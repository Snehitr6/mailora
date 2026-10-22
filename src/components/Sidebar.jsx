
import { useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  Clock,
  FileText,
  Inbox,
  Mail,
  Send,
  ShieldAlert,
  Star,
  Trash2,
  X,
  SquarePen,
} from "lucide-react";
import { useEmails } from "../context/EmailContext";
import { useAuth } from "../context/AuthContext";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "snoozed", label: "Snoozed", icon: Clock },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "spam", label: "Spam", icon: ShieldAlert },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export default function Sidebar({
  mobileOpen,
  onClose,
  onCompose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { emails } = useEmails();
  const { user, logout } = useAuth();

  const activeFolder =
    location.pathname.split("/")[2] || "inbox";

  const getCount = (folder) => {
    if (folder === "starred") {
      return emails.filter(
        (email) =>
          email.starred &&
          email.folder !== "trash" &&
          email.folder !== "spam"
      ).length;
    }

    if (folder === "snoozed") {
      return emails.filter(
        (email) => email.snoozedUntil && email.snoozedUntil > Date.now()
      ).length;
    }

    return emails.filter(
      (email) =>
        email.folder === folder &&
        (folder !== "inbox" || email.unread)
    ).length;
  };

  const goTo = (folder) => {
    navigate(`/inbox/${folder}`);
    onClose?.();
  };

  const sidebarContent = (
    <>
      <div className="flex h-[72px] items-center gap-3 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
          <Mail size={20} />
        </span>
        <span className="text-[21px] font-semibold tracking-tight text-slate-800 dark:text-slate-100">
          Mailora
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      </div>

      <div className="px-3 pb-4 pt-2">
        <button
          type="button"
          onClick={onCompose}
          className="flex h-14 items-center gap-3 rounded-2xl bg-[#c2e7ff] px-5 text-sm font-semibold text-[#001d35] shadow-sm transition hover:shadow-md dark:bg-indigo-600 dark:text-white"
        >
          <SquarePen size={20} />
          Compose
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {folders.map(({ id, label, icon: Icon }) => {
          const active = activeFolder === id;
          const count = getCount(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => goTo(id)}
              className={`flex h-10 w-full items-center gap-4 rounded-full px-4 text-left text-sm transition ${
                active
                  ? "bg-[#d3e3fd] font-semibold text-[#041e49] dark:bg-indigo-500/20 dark:text-indigo-200"
                  : "text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="text-xs font-semibold tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {(user?.name || "Alex Morgan")
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {user?.name || "Alex Morgan"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email || "demo@mailora.app"}
            </p>
          </div>
          {typeof logout === "function" && (
            <button
              type="button"
              title="Sign out"
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate("/signin", { replace: true });
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <Send size={16} className="rotate-180" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#f6f8fc] transition-transform duration-200 dark:bg-slate-950 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
