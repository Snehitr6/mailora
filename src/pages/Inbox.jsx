
import { useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  Archive,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox as InboxIcon,
  Mail,
  MailOpen,
  MoreVertical,
  RotateCcw,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";

import EmailList from "../components/EmailList";
import { useEmails } from "../context/EmailContext";

const folderTitles = {
  inbox: "Inbox",
  starred: "Starred",
  snoozed: "Snoozed",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

function matchesSearch(email, search) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [query];

  return tokens.every((token) => {
    const value = token.replace(/^"|"$/g, "");
    const separator = value.indexOf(":");

    if (separator > 0) {
      const operator = value.slice(0, separator);
      const operand = value.slice(separator + 1).replace(/^"|"$/g, "");

      switch (operator) {
        case "from":
          return `${email.sender || ""} ${email.email || ""}`
            .toLowerCase()
            .includes(operand);
        case "to":
          return String(email.to || "").toLowerCase().includes(operand);
        case "subject":
          return String(email.subject || "").toLowerCase().includes(operand);
        case "has":
          if (operand === "attachment") {
            return Boolean(email.attachments?.length);
          }
          return true;
        case "is":
          if (operand === "unread") return Boolean(email.unread);
          if (operand === "read") return !email.unread;
          if (operand === "starred") return Boolean(email.starred);
          if (operand === "draft") return email.folder === "drafts";
          return true;
        case "newer_than": {
          const match = operand.match(/^(\d+)([dmy])$/);
          if (!match) return true;

          const amount = Number(match[1]);
          const unit = match[2];
          const multiplier =
            unit === "m" ? 30 : unit === "y" ? 365 : 1;
          const timestamp = new Date(email.time).getTime();

          if (Number.isNaN(timestamp)) return false;

          return Date.now() - timestamp <= amount * multiplier * 86400000;
        }
        default:
          return true;
      }
    }

    const content = [
      email.sender,
      email.email,
      email.to,
      email.subject,
      email.preview,
      email.body,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return content.includes(value);
  });
}

export default function Inbox() {
  const { folder = "inbox" } = useParams();
  const navigate = useNavigate();
  const { search = "", openCompose, setToast } = useOutletContext() || {};

  const {
    emails = [],
    toggleStar,
    toggleRead,
    markRead,
    markUnread,
    moveEmail,
    moveMany,
    removeEmail,
    removeMany,
    restoreEmail,
    permanentlyDelete,
    permanentlyDeleteMany,
    emptyTrash,
    archiveEmail,
    reportSpam,
  } = useEmails();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const title = folderTitles[folder] || "Inbox";

  const folderEmails = useMemo(() => {
    let result = emails.filter((email) => {
      if (folder === "starred") {
        return email.starred && !["trash", "spam"].includes(email.folder);
      }

      if (folder === "snoozed") {
        return (
          Number(email.snoozedUntil) > Date.now() &&
          !["trash", "spam"].includes(email.folder)
        );
      }

      return email.folder === folder;
    });

    result = result.filter((email) => matchesSearch(email, search));

    result.sort((a, b) => {
      const dateA = new Date(a.time).getTime() || 0;
      const dateB = new Date(b.time).getTime() || 0;

      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [emails, folder, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(folderEmails.length / pageSize));
  const visibleEmails = folderEmails.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const selectedVisible = visibleEmails.filter((email) =>
    selectedIds.includes(email.id)
  );

  const allVisibleSelected =
    visibleEmails.length > 0 &&
    visibleEmails.every((email) => selectedIds.includes(email.id));

  const notify = (message) => setToast?.(message);

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleEmails.some((email) => email.id === id))
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([...current, ...visibleEmails.map((email) => email.id)]),
      ]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedAction = (action, message) => {
    if (!selectedIds.length) return;
    action?.(selectedIds);
    clearSelection();
    notify(message);
  };

  const handleOpen = (email) => {
    if (email.folder === "drafts") {
      openCompose?.(email);
      return;
    }

    navigate(`/email/${email.id}`);
  };

  const handleArchive = () => {
    if (selectedIds.length) {
      selectedAction(
        moveMany,
        "Selected messages archived"
      );
      // Apply the destination separately because moveMany requires two args.
      moveMany?.(selectedIds, "archive");
      return;
    }

    notify("Select messages to archive");
  };

  const archiveSelected = () => {
    if (!selectedIds.length) return;
    moveMany?.(selectedIds, "archive");
    clearSelection();
    notify("Selected messages archived");
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;

    if (folder === "trash") {
      permanentlyDeleteMany?.(selectedIds);
      notify("Messages permanently deleted");
    } else {
      (removeMany || ((ids) => ids.forEach((id) => removeEmail?.(id))))(
        selectedIds
      );
      notify("Messages moved to trash");
    }

    clearSelection();
  };

  const markSelectedRead = () => {
    if (!selectedIds.length) return;

    if (markManyReadAvailable()) {
      selectedAction(
        markManyReadAvailable(),
        "Messages marked as read"
      );
      return;
    }

    selectedIds.forEach((id) => markRead?.(id));
    clearSelection();
    notify("Messages marked as read");
  };

  const markManyReadAvailable = () => {
    const context = {
      markRead,
      markUnread,
      emails,
    };

    return context.markRead
      ? (ids) => ids.forEach((id) => context.markRead(id))
      : null;
  };

  const markSelectedUnread = () => {
    if (!selectedIds.length) return;

    selectedIds.forEach((id) => markUnread?.(id));
    clearSelection();
    notify("Messages marked as unread");
  };

  const handleRestore = () => {
    if (!selectedIds.length) return;

    selectedIds.forEach((id) => restoreEmail?.(id));
    clearSelection();
    notify("Messages restored");
  };

  const handleSpam = () => {
    if (!selectedIds.length) return;

    if (reportSpam) {
      selectedIds.forEach((id) => reportSpam(id));
    } else {
      selectedIds.forEach((id) => moveEmail?.(id, "spam"));
    }

    clearSelection();
    notify("Messages moved to spam");
  };

  const handleStar = (id) => {
    toggleStar?.(id);
  };

  const handleRead = (id) => {
    toggleRead?.(id);
  };

  const handleSingleArchive = (email) => {
    if (archiveEmail) {
      archiveEmail(email.id);
    } else {
      moveEmail?.(email.id, "archive");
    }

    notify("Message archived");
  };

  const handleSingleDelete = (email) => {
    if (folder === "trash") {
      permanentlyDelete?.(email.id);
      notify("Message permanently deleted");
    } else {
      removeEmail?.(email.id);
      notify("Message moved to trash");
    }
  };

  const handleSingleRestore = (email) => {
    restoreEmail?.(email.id);
    notify("Message restored");
  };

  const handleEmptyTrash = () => {
    if (folder !== "trash" || folderEmails.length === 0) return;
    emptyTrash?.();
    clearSelection();
    notify("Trash emptied");
  };

  return (
    <section className="animate-enter min-w-0 overflow-hidden rounded-2xl bg-white dark:bg-[#1e1f20]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex min-h-[64px] flex-wrap items-center gap-1 border-b border-slate-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#1e1f20] sm:px-5">
        {selectedIds.length > 0 ? (
          <>
            <button
              type="button"
              onClick={clearSelection}
              className="toolbar-btn"
              title="Clear selection"
            >
              <X size={19} />
            </button>

            <span className="mr-2 text-sm font-medium">
              {selectedIds.length} selected
            </span>

            {folder === "trash" ? (
              <>
                <button
                  type="button"
                  onClick={handleRestore}
                  className="toolbar-btn"
                  title="Restore"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="toolbar-btn"
                  title="Delete permanently"
                >
                  <Trash2 size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={archiveSelected}
                  className="toolbar-btn"
                  title="Archive"
                >
                  <Archive size={18} />
                </button>
                <button
                  type="button"
                  onClick={markSelectedRead}
                  className="toolbar-btn"
                  title="Mark as read"
                >
                  <MailOpen size={18} />
                </button>
                <button
                  type="button"
                  onClick={markSelectedUnread}
                  className="toolbar-btn"
                  title="Mark as unread"
                >
                  <Mail size={18} />
                </button>
                {folder !== "spam" && (
                  <button
                    type="button"
                    onClick={handleSpam}
                    className="toolbar-btn"
                    title="Report spam"
                  >
                    <ShieldAlert size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="toolbar-btn"
                  title="Move to trash"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="toolbar-btn"
              title={allVisibleSelected ? "Deselect all" : "Select all"}
            >
              {allVisibleSelected ? <Check size={18} /> : <span className="h-4 w-4 rounded-[3px] border-2 border-slate-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setSortOrder((current) =>
                  current === "newest" ? "oldest" : "newest"
                );
              }}
              className="toolbar-btn"
              title={`Sort by ${sortOrder === "newest" ? "oldest" : "newest"}`}
            >
              <MoreVertical size={18} />
            </button>

            <div className="ml-auto flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <span>
                {folderEmails.length === 0
                  ? "0"
                  : `${page * pageSize + 1}–${Math.min(
                      (page + 1) * pageSize,
                      folderEmails.length
                    )}`}{" "}
                of {folderEmails.length}
              </span>

              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="toolbar-btn !h-9 !w-9"
                title="Previous page"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages - 1, current + 1)
                  )
                }
                className="toolbar-btn !h-9 !w-9"
                title="Next page"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Folder heading */}
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f0fe] text-[#0b57d0] dark:bg-[#26364d] dark:text-blue-300">
            <InboxIcon size={20} />
          </span>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {folderEmails.length}{" "}
              {folderEmails.length === 1 ? "message" : "messages"}
              {search.trim() ? " matching your search" : ""}
            </p>
          </div>
        </div>

        {folder === "trash" && folderEmails.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Empty trash
          </button>
        )}
      </div>

      {/* Messages */}
      {folderEmails.length > 0 ? (
        <EmailList
          emails={visibleEmails}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleStar={handleStar}
          onToggleRead={handleRead}
          onOpen={handleOpen}
          onCompose={openCompose}
          onToast={notify}
          folder={folder}
          onArchive={handleSingleArchive}
          onDelete={handleSingleDelete}
          onRestore={handleSingleRestore}
        />
      ) : (
        <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-slate-50 text-slate-400 dark:bg-[#292a2d] dark:text-slate-500">
            {folder === "trash" ? (
              <Trash2 size={32} strokeWidth={1.4} />
            ) : folder === "spam" ? (
              <ShieldAlert size={32} strokeWidth={1.4} />
            ) : (
              <InboxIcon size={32} strokeWidth={1.4} />
            )}
          </div>

          <h2 className="text-base font-medium">
            {search.trim()
              ? "No matching messages"
              : folder === "inbox"
                ? "Your inbox is clear"
                : `No messages in ${title.toLowerCase()}`}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            {search.trim()
              ? "Try different search terms or adjust your search filters."
              : folder === "inbox"
                ? "Messages sent to you will appear here."
                : folder === "trash"
                  ? "Messages you delete will appear here."
                  : "There are no messages to show right now."}
          </p>

          {search.trim() && (
            <button
              type="button"
              onClick={() => navigate(`/inbox/${folder}`)}
              className="mt-5 rounded-full bg-[#e8f0fe] px-5 py-2.5 text-sm font-semibold text-[#0b57d0] transition hover:bg-[#d3e3fd] dark:bg-[#26364d] dark:text-blue-300"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </section>
  );
}
