
import { useState } from "react";
import {
  ArrowLeft,
  Archive,
  ArrowUpRight,
  Clock,
  Forward,
  MoreVertical,
  Printer,
  Reply,
  ReplyAll,
  Star,
  Trash2,
  ShieldAlert,
  Mail,
  MailOpen,
  ChevronDown,
  Paperclip,
} from "lucide-react";

function formatFullDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export default function EmailView({
  email,
  onBack,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onToggleStar,
  onToggleRead,
  onReportSpam,
  onSnooze,
  onToast,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  if (!email) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center dark:bg-[#202124]">
        <Mail size={38} className="mb-4 text-slate-400" />
        <h2 className="text-lg font-medium">Email not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          This message may have been moved or deleted.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
        >
          Back to inbox
        </button>
      </div>
    );
  }

  const sender = email.sender || "Unknown sender";
  const senderEmail = email.email || "";
  const recipient = email.to || "me";
  const subject = email.subject || "(No subject)";

  const actionButton =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

  const handleAction = (action, fallbackMessage) => {
    setMoreOpen(false);

    if (typeof action === "function") {
      action(email);
    } else {
      onToast?.(fallbackMessage);
    }
  };

  return (
    <section className="animate-enter flex min-h-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#202124]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-slate-100 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-[#202124]/95 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          title="Back to inbox"
          aria-label="Back to inbox"
          className={actionButton}
        >
          <ArrowLeft size={19} />
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          type="button"
          onClick={() => handleAction(onArchive, "Archive action unavailable")}
          title="Archive"
          className={actionButton}
        >
          <Archive size={18} />
        </button>

        <button
          type="button"
          onClick={() => handleAction(onReportSpam, "Spam action unavailable")}
          title="Report spam"
          className={actionButton}
        >
          <ShieldAlert size={18} />
        </button>

        <button
          type="button"
          onClick={() => handleAction(onDelete, "Delete action unavailable")}
          title="Move to trash"
          className={actionButton}
        >
          <Trash2 size={18} />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />

        <button
          type="button"
          onClick={() =>
            handleAction(
              onToggleRead,
              "Read status action unavailable"
            )
          }
          title="Toggle read status"
          className={actionButton}
        >
          <MailOpen size={18} />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              handleAction(onToggleStar, "Star action unavailable")
            }
            title={email.starred ? "Remove star" : "Star email"}
            className={`${actionButton} ${
              email.starred ? "text-amber-500" : ""
            }`}
          >
            <Star
              size={18}
              fill={email.starred ? "currentColor" : "none"}
            />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              title="More actions"
              aria-label="More actions"
              aria-expanded={moreOpen}
              className={actionButton}
            >
              <MoreVertical size={19} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => handleAction(onSnooze, "Snooze action unavailable")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Clock size={16} />
                  Snooze
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction(
                      () => window.print(),
                      "Print unavailable"
                    )
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer size={16} />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction(
                      () => {
                        navigator.clipboard?.writeText(email.body || "");
                        onToast?.("Email body copied");
                      },
                      "Copy unavailable"
                    )
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Mail size={16} />
                  Copy message text
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <article className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8 pt-5 sm:px-8 sm:pt-7 lg:px-12">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h1 className="min-w-0 break-words text-[22px] font-normal leading-8 tracking-tight text-slate-800 dark:text-slate-100 sm:text-[26px]">
            {subject}
          </h1>

          {email.attachments?.length > 0 && (
            <span className="mt-1 flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Paperclip size={13} />
              {email.attachments.length}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {getInitials(sender)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {sender}
                </p>
                <p className="break-all text-xs text-slate-500 dark:text-slate-400">
                  {senderEmail ? `<${senderEmail}>` : ""}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFullDate(email.time)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDetailsOpen((value) => !value)}
              aria-expanded={detailsOpen}
              className="mt-2 flex max-w-full items-center gap-1 rounded-lg py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <span className="truncate">
                to {recipient === "me" ? "me" : recipient}
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {detailsOpen && (
              <div className="mt-2 space-y-2 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-700">
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-slate-500">From</span>
                  <span className="break-all">
                    {sender} {senderEmail && `<${senderEmail}>`}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-slate-500">To</span>
                  <span className="break-all">{recipient}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-slate-500">Date</span>
                  <span>{formatFullDate(email.time)}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-20 shrink-0 text-slate-500">Subject</span>
                  <span className="break-words">{subject}</span>
                </div>
              </div>
            )}

            <div className="email-content mt-7 whitespace-pre-wrap break-words text-[14px] leading-7 text-slate-700 dark:text-slate-200">
              {email.body || email.preview || "This message has no body."}
            </div>

            {email.attachments?.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-700">
                <p className="mb-3 text-xs font-medium text-slate-500">
                  {email.attachments.length} attachment(s)
                </p>
                <div className="flex flex-wrap gap-3">
                  {email.attachments.map((attachment, index) => (
                    <div
                      key={`${String(attachment)}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700"
                    >
                      <Paperclip size={18} className="text-slate-500" />
                      <span className="max-w-[180px] truncate text-sm">
                        {typeof attachment === "string"
                          ? attachment
                          : attachment?.name || "Attachment"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onReply?.(email)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Reply size={17} />
                Reply
              </button>

              <button
                type="button"
                onClick={() => onForward?.(email)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Forward size={17} />
                Forward
              </button>

              <button
                type="button"
                onClick={() => onReplyAll?.(email)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ReplyAll size={17} />
                Reply all
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
