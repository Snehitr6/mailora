
import { useEffect, useRef, useState } from "react";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Paperclip,
  Trash2,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";

export default function ComposeModal({
  open,
  onClose,
  initialDraft = null,
  onSend,
  onSaveDraft,
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const bodyRef = useRef(null);
  const fileRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    setTo(initialDraft?.to || "");
    setCc(initialDraft?.cc || "");
    setBcc(initialDraft?.bcc || "");
    setSubject(initialDraft?.subject || "");
    setBody(initialDraft?.body || "");
    setAttachments(
      Array.isArray(initialDraft?.attachments)
        ? initialDraft.attachments
        : []
    );
    setShowCc(Boolean(initialDraft?.cc));
    setShowBcc(Boolean(initialDraft?.bcc));
    setError("");
    setMinimized(false);
    setExpanded(false);
    setShowFormatting(false);
    setShowMore(false);
  }, [open, initialDraft]);

  if (!open) return null;

  const createPayload = () => ({
    ...(initialDraft?.id ? { id: initialDraft.id } : {}),
    folder: "drafts",
    to: to.trim(),
    cc: cc.trim(),
    bcc: bcc.trim(),
    subject: subject.trim(),
    body,
    attachments,
  });

  const validateEmailList = (value) => {
    if (!value.trim()) return true;

    return value
      .split(/[;,]/)
      .map((email) => email.trim())
      .filter(Boolean)
      .every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const validateRecipients = () => {
    if (!to.trim()) {
      setError("Please add at least one recipient.");
      return false;
    }

    if (
      !validateEmailList(to) ||
      !validateEmailList(cc) ||
      !validateEmailList(bcc)
    ) {
      setError("Enter valid email addresses, separated by commas.");
      return false;
    }

    return true;
  };

  const handleSend = () => {
    setError("");

    if (!validateRecipients()) return;

    onSend?.({
      ...createPayload(),
      folder: "sent",
      time: new Date().toISOString(),
      unread: false,
      starred: false,
    });
  };

  const handleSaveDraft = () => {
    setError("");

    if (!to.trim() && !subject.trim() && !body.trim() && !attachments.length) {
      onClose?.();
      return;
    }

    onSaveDraft?.({
      ...createPayload(),
      time: initialDraft?.time || new Date().toISOString(),
      unread: false,
      starred: initialDraft?.starred || false,
    });
  };

  const handleClose = () => {
    handleSaveDraft();
    onClose?.();
  };

  const handleAttachment = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setAttachments((previous) => [
      ...previous,
      ...files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    ]);

    event.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const insertFormatting = (command, value = null) => {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const inputClass =
    "w-full min-w-0 border-0 bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:justify-end sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setMinimized(true);
        }
      }}
    >
      {!minimized && (
        <section
          className={`flex flex-col overflow-hidden bg-white shadow-2xl dark:bg-[#202124] ${
            expanded
              ? "h-[95dvh] w-full sm:h-[92dvh] sm:w-[min(900px,calc(100vw-32px))]"
              : "h-[min(650px,92dvh)] w-full sm:h-[600px] sm:w-[min(560px,calc(100vw-32px))]"
          } ${
            expanded
              ? "rounded-t-2xl sm:rounded-2xl"
              : "rounded-t-2xl sm:rounded-xl"
          } animate-enter`}
          role="dialog"
          aria-modal="true"
          aria-label="Compose email"
        >
          {/* Header */}
          <header className="flex h-12 shrink-0 items-center justify-between bg-[#f2f6fc] px-4 dark:bg-[#303134]">
            <h2 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {initialDraft?.id ? "Edit draft" : "New message"}
            </h2>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Minimize compose"
              >
                <Minus size={17} />
              </button>

              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="toolbar-btn !h-8 !w-8"
                aria-label={expanded ? "Restore compose size" : "Expand compose"}
              >
                {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Close compose"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* Fields */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
              <label
                htmlFor="compose-to"
                className="shrink-0 text-sm text-slate-500 dark:text-slate-400"
              >
                To
              </label>

              <input
                id="compose-to"
                className={inputClass}
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setError("");
                }}
                placeholder="Recipients"
                autoComplete="off"
              />

              <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowCc((value) => !value)}
                  className="hover:text-blue-600"
                >
                  Cc
                </button>
                <button
                  type="button"
                  onClick={() => setShowBcc((value) => !value)}
                  className="hover:text-blue-600"
                >
                  Bcc
                </button>
              </div>
            </div>

            {showCc && (
              <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
                <label
                  htmlFor="compose-cc"
                  className="w-10 shrink-0 text-sm text-slate-500"
                >
                  Cc
                </label>
                <input
                  id="compose-cc"
                  className={inputClass}
                  value={cc}
                  onChange={(event) => setCc(event.target.value)}
                  placeholder="Carbon copy"
                  autoComplete="off"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
                <label
                  htmlFor="compose-bcc"
                  className="w-10 shrink-0 text-sm text-slate-500"
                >
                  Bcc
                </label>
                <input
                  id="compose-bcc"
                  className={inputClass}
                  value={bcc}
                  onChange={(event) => setBcc(event.target.value)}
                  placeholder="Blind carbon copy"
                  autoComplete="off"
                />
              </div>
            )}

            <input
              aria-label="Subject"
              className={`${inputClass} border-b border-slate-200 dark:border-slate-700`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject"
            />

            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Message body"
              aria-multiline="true"
              onInput={(event) => setBody(event.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: body }}
              className="email-content min-h-[220px] py-4 text-sm text-slate-800 outline-none dark:text-slate-100"
              data-placeholder="Write your message..."
            />

            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.name || "attachment"}-${index}`}
                    className="flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-[#303134]"
                  >
                    <Paperclip size={14} className="shrink-0 text-slate-500" />
                    <span className="max-w-[180px] truncate">
                      {attachment.name || String(attachment)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-slate-500 hover:text-red-500"
                      aria-label={`Remove ${attachment.name || "attachment"}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
          </div>

          {/* Formatting toolbar */}
          {showFormatting && (
            <div className="flex flex-wrap items-center gap-1 border-t border-slate-200 px-4 py-2 dark:border-slate-700">
              <button
                type="button"
                onClick={() => insertFormatting("bold")}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("italic")}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("underline")}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Underline"
              >
                <Underline size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("insertUnorderedList")}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Bulleted list"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("insertOrderedList")}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Numbered list"
              >
                <ListOrdered size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Enter link URL");
                  if (url) insertFormatting("createLink", url);
                }}
                className="toolbar-btn !h-8 !w-8"
                aria-label="Insert link"
              >
                <Link2 size={16} />
              </button>
            </div>
          )}

          {/* Footer actions */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-700">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                className="flex h-10 items-center gap-2 rounded-full bg-[#0b57d0] px-5 text-sm font-medium text-white transition hover:bg-[#0842a0] active:scale-[0.98]"
              >
                <Send size={15} />
                Send
              </button>

              <button
                type="button"
                onClick={() => setShowFormatting((value) => !value)}
                className={`toolbar-btn !h-9 !w-9 ${
                  showFormatting ? "bg-slate-100 dark:bg-slate-700" : ""
                }`}
                aria-label="Toggle formatting"
                title="Formatting options"
              >
                <span className="text-lg font-semibold">A</span>
              </button>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="toolbar-btn !h-9 !w-9"
                aria-label="Attach file"
                title="Attach files"
              >
                <Paperclip size={17} />
              </button>

              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachment}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="toolbar-btn !h-9 !w-9"
                aria-label="Add image"
                title="Add image"
              >
                <ImageIcon size={17} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMore((value) => !value)}
                  className="toolbar-btn !h-9 !w-9"
                  aria-label="More compose options"
                >
                  <MoreVertical size={17} />
                </button>

                {showMore && (
                  <div className="absolute bottom-11 left-0 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#303134]">
                    <button
                      type="button"
                      onClick={() => {
                        setTo("");
                        setCc("");
                        setBcc("");
                        setSubject("");
                        setBody("");
                        setAttachments([]);
                        setError("");
                        setShowMore(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Clear message
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Save draft
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="toolbar-btn !h-9 !w-9 text-slate-500 hover:text-red-600"
              aria-label="Discard or close message"
              title="Close"
            >
              <Trash2 size={17} />
            </button>
          </footer>
        </section>
      )}

      {minimized && (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="fixed bottom-0 right-4 flex h-12 w-[min(320px,calc(100vw-32px))] items-center justify-between rounded-t-xl bg-[#f2f6fc] px-4 text-sm font-semibold text-slate-800 shadow-xl dark:bg-[#303134] dark:text-white"
        >
          <span className="flex items-center gap-2">
            <ChevronDown size={16} />
            {subject.trim() || "New message"}
          </span>
          <Maximize2 size={15} />
        </button>
      )}
    </div>
  );
}
