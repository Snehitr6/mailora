
import { useState } from "react";
import {
  Archive,
  Mail,
  MailOpen,
  Star,
  Trash2,
  ShieldAlert,
  Clock,
  MoreVertical,
} from "lucide-react";

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EmailRow({
  email,
  selected = false,
  onToggleSelect,
  onToggleStar,
  onToggleRead,
  onOpen,
  onToast,
  folder,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isUnread = Boolean(email.unread);
  const sender = email.sender || email.email || "Unknown sender";
  const subject = email.subject || "(No subject)";
  const preview = email.preview || email.body || "";
  const time = formatTime(email.time);

  const iconButton =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white";

  const stop = (event) => event.stopPropagation();

  const handleRead = (event) => {
    stop(event);
    onToggleRead?.();
    onToast?.(isUnread ? "Marked as read" : "Marked as unread");
  };

  return (
    <article
      className={`group relative flex min-h-[62px] items-center gap-2 border-l-[3px] px-2 transition sm:gap-3 sm:px-3 ${
        selected
          ? "border-l-blue-600 bg-[#c2dbff]/40 dark:bg-blue-900/20"
          : "border-l-transparent"
      } ${
        isUnread
          ? "bg-[#f2f6fc] dark:bg-slate-800/70"
          : "bg-white dark:bg-[#202124]"
      } hover:z-10 hover:shadow-[0_1px_3px_rgba(60,64,67,0.22)] dark:hover:bg-slate-800`}
    >
      <div className="flex shrink-0 items-center gap-0 sm:gap-1">
        <button
          type="button"
          onClick={(event) => {
            stop(event);
            onToggleSelect?.();
          }}
          aria-label={selected ? "Deselect email" : "Select email"}
          aria-pressed={selected}
          className={`${iconButton} h-8 w-8`}
        >
          <span
            className={`grid h-[17px] w-[17px] place-items-center rounded-[3px] border ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-slate-400 group-hover:border-slate-600 dark:border-slate-500"
            }`}
          >
            {selected && (
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
                <path
                  d="m3 8 3 3 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={(event) => {
            stop(event);
            onToggleStar?.();
          }}
          aria-label={email.starred ? "Remove star" : "Star email"}
          aria-pressed={Boolean(email.starred)}
          className={`${iconButton} h-8 w-8 ${
            email.starred ? "text-amber-500" : ""
          }`}
        >
          <Star
            size={18}
            fill={email.starred ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-4"
        aria-label={`Open email: ${subject}`}
      >
        <span
          className={`w-[100px] shrink-0 truncate text-[13px] sm:w-[155px] ${
            isUnread
              ? "font-bold text-slate-900 dark:text-white"
              : "font-normal text-slate-700 dark:text-slate-300"
          }`}
        >
          {sender}
        </span>

        <span className="flex min-w-0 flex-1 items-center gap-1">
          <span
            className={`max-w-full truncate text-[13px] ${
              isUnread
                ? "font-bold text-slate-900 dark:text-slate-100"
                : "font-medium text-slate-700 dark:text-slate-300"
            }`}
          >
            {subject}
          </span>

          <span className="hidden min-w-0 truncate text-[13px] text-slate-500 dark:text-slate-400 md:inline">
            {" — "}
            {preview}
          </span>
        </span>

        {email.attachments?.length > 0 && (
          <span className="hidden rounded border border-slate-300 px-2 py-0.5 text-[10px] text-slate-500 lg:inline dark:border-slate-600">
            Attachment
          </span>
        )}

        <span
          className={`w-[68px] shrink-0 text-right text-[11px] sm:w-[84px] sm:text-xs ${
            isUnread
              ? "font-bold text-slate-800 dark:text-slate-100"
              : "font-medium text-slate-500 dark:text-slate-400"
          }`}
        >
          {time}
        </span>
      </button>

      <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 bg-white pl-2 group-hover:flex dark:bg-slate-800 sm:flex sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={handleRead}
          title={isUnread ? "Mark as read" : "Mark as unread"}
          aria-label={isUnread ? "Mark as read" : "Mark as unread"}
          className={iconButton}
        >
          {isUnread ? <MailOpen size={17} /> : <Mail size={17} />}
        </button>

        <button
          type="button"
          onClick={(event) => {
            stop(event);
            onToast?.("Use the email toolbar to archive this message.");
          }}
          title="Archive"
          aria-label="Archive email"
          className={iconButton}
        >
          <Archive size={17} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            stop(event);
            setMoreOpen((value) => !value);
          }}
          title="More actions"
          aria-label="More email actions"
          className={iconButton}
        >
          <MoreVertical size={17} />
        </button>
      </div>

      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Close actions menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute right-3 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={(event) => {
                stop(event);
                setMoreOpen(false);
                onToggleRead?.();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isUnread ? <MailOpen size={16} /> : <Mail size={16} />}
              Mark as {isUnread ? "read" : "unread"}
            </button>

            <button
              type="button"
              onClick={(event) => {
                stop(event);
                setMoreOpen(false);
                onToast?.("Archive action is available from the message toolbar.");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Archive size={16} />
              Archive
            </button>

            <button
              type="button"
              onClick={(event) => {
                stop(event);
                setMoreOpen(false);
                onToast?.("Open the message to access its full actions.");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Clock size={16} />
              Snooze
            </button>

            <button
              type="button"
              onClick={(event) => {
                stop(event);
                setMoreOpen(false);
                onToast?.("Open the message to manage spam and trash.");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {folder === "spam" ? (
                <Mail size={16} />
              ) : (
                <ShieldAlert size={16} />
              )}
              {folder === "spam" ? "Not spam" : "Report spam"}
            </button>

            <button
              type="button"
              onClick={(event) => {
                stop(event);
                setMoreOpen(false);
                onToast?.("Open the message to manage it in Trash.");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
              Move to trash
            </button>
          </div>
        </>
      )}
    </article>
  );
}
