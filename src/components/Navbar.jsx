
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

export default function Navbar({
  search = "",
  setSearch = () => {},
  onMenu,
  darkMode = false,
  onToggleTheme = () => {},
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [displayEmail, setDisplayEmail] = useState(user?.email || "");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    setDisplayName(user?.name || "");
    setDisplayEmail(user?.email || "");
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setPanel(null);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closePanels = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setPanel(null);
  };

  const handleSignOut = () => {
    closePanels();

    if (typeof logout === "function") {
      logout();
    }

    navigate("/signin", { replace: true });
  };

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "M";

  const handleSaveSettings = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("displayName") || "").trim();

    if (!name) return;

    setDisplayName(name);

    try {
      const stored = JSON.parse(
        localStorage.getItem("mailoraUser") || "null"
      );

      if (stored) {
        localStorage.setItem(
          "mailoraUser",
          JSON.stringify({ ...stored, name })
        );
      }
    } catch {
      // Keep the updated name for the current session.
    }

    setPanel("saved");
  };

  return (
    <>
      <header className="mailora-navbar sticky top-0 z-30 flex h-[72px] min-w-0 items-center gap-2 border-b border-slate-100 bg-white/95 px-3 backdrop-blur-xl dark:border-slate-800 dark:bg-[#1e1f20]/95 sm:gap-3 sm:px-5 lg:px-6">
        {/* Mobile menu button only */}
        <button
          type="button"
          onClick={onMenu}
          className="mailora-mobile-menu toolbar-btn shrink-0 lg:hidden"
          aria-label="Open navigation menu"
          title="Menu"
        >
          <Menu size={21} />
        </button>

        {/* Mobile Mailora logo only */}
        <button
          type="button"
          onClick={() => navigate("/inbox")}
          className="flex shrink-0 items-center gap-2 lg:hidden"
          aria-label="Go to Mailora inbox"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Mail size={20} />
          </span>

          <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            Mailora
          </span>
        </button>

        {/* Desktop search */}
        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search mail"
            className="w-full max-w-[720px]"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Mobile search */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((value) => !value);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            className="toolbar-btn lg:hidden"
            aria-label={mobileSearchOpen ? "Close search" : "Search mail"}
            title="Search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Theme: hidden on mobile, visible from 640px */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="toolbar-btn hidden sm:grid"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={darkMode ? "Light theme" : "Dark theme"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications: hidden on mobile, visible from 640px */}
          <div className="relative hidden sm:block" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setProfileOpen(false);
              }}
              className="toolbar-btn"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              title="Notifications"
            >
              <Bell size={20} />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#252629]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-700">
                  <h3 className="font-semibold">Notifications</h3>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="toolbar-btn !h-8 !w-8"
                    aria-label="Close notifications"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="px-5 py-8 text-center">
                  <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700">
                    <Bell size={22} />
                  </span>

                  <p className="text-sm font-medium">
                    You’re all caught up
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    New notifications will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Help: hidden on mobile, visible from 640px */}
          <button
            type="button"
            onClick={() => {
              closePanels();
              setPanel("help");
            }}
            className="toolbar-btn hidden sm:grid"
            aria-label="Help and support"
            title="Help"
          >
            <CircleHelp size={20} />
          </button>

          {/* Account menu: visible on all screen sizes */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1 rounded-full p-1 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:hover:bg-slate-700"
              aria-label="Open account menu"
              aria-expanded={profileOpen}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5940ff] text-sm font-semibold text-white">
                {initials}
              </span>

              <ChevronDown
                size={15}
                className="hidden text-slate-500 sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#252629]">
                <div className="px-5 pb-5 pt-6 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#5940ff] text-lg font-semibold text-white">
                    {initials}
                  </div>

                  <p className="mt-3 truncate text-sm font-semibold">
                    {displayName || "Mailora user"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {displayEmail || "No email available"}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    <ShieldCheck size={14} />
                    Mailora account
                  </div>
                </div>

                <div className="border-t border-slate-100 py-2 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setPanel("settings");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Settings size={18} />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setPanel("help");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <CircleHelp size={18} />
                    Help and support
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="sticky top-[72px] z-20 border-b border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-[#1e1f20] lg:hidden">
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search mail"
            className="w-full"
          />
        </div>
      )}

      {/* Settings and help dialogs */}
      {panel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPanel(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-panel-title"
            className="animate-enter max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#252629] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="account-panel-title" className="text-xl font-semibold">
                  {panel === "settings"
                    ? "Settings"
                    : panel === "help"
                      ? "Help and support"
                      : "Settings saved"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {panel === "settings"
                    ? "Personalize your Mailora experience."
                    : panel === "help"
                      ? "Find your way around Mailora."
                      : "Your profile name was updated."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPanel(null)}
                className="toolbar-btn !h-9 !w-9"
                aria-label="Close panel"
              >
                <X size={19} />
              </button>
            </div>

            {panel === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div>
                  <label
                    htmlFor="display-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Display name
                  </label>

                  <input
                    id="display-name"
                    name="displayName"
                    defaultValue={displayName}
                    required
                    maxLength={80}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-[#1e1f20]"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Appearance</p>

                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-3">
                      {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                      {darkMode ? "Dark theme" : "Light theme"}
                    </span>

                    <span className="text-xs text-slate-500">
                      Click to change
                    </span>
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-[#1e1f20]">
                  <p className="text-sm font-medium">Account email</p>

                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                    {displayEmail || "No email available"}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Changing your email or password requires account
                    authentication support.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    className="rounded-full px-5 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-full bg-[#0b57d0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0842a0]"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            )}

            {panel === "help" && (
              <div className="space-y-3">
                {[
                  {
                    title: "How do I search my email?",
                    body: "Use the search bar to find senders, subjects, and message content. You can also use filters such as from: and subject:.",
                  },
                  {
                    title: "How do I organize messages?",
                    body: "Select a message to archive it, star it for quick access, or move it to Trash or Spam using the available message actions.",
                  },
                  {
                    title: "How do I manage my account?",
                    body: "Open your profile menu and select Settings to change your display name or theme.",
                  },
                  {
                    title: "Need more help?",
                    body: "This demo does not have a connected support service. Contact your application administrator for account or technical issues.",
                  },
                ].map((item) => (
                  <details
                    key={item.title}
                    className="group rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium">
                      <span className="flex items-center justify-between gap-3">
                        {item.title}
                        <ChevronDown
                          size={17}
                          className="shrink-0 transition group-open:rotate-180"
                        />
                      </span>
                    </summary>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {item.body}
                    </p>
                  </details>
                ))}

                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="mt-3 w-full rounded-full bg-[#0b57d0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0842a0]"
                >
                  Done
                </button>
              </div>
            )}

            {panel === "saved" && (
              <div className="py-3 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Check size={28} />
                </span>

                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  Your display name is now {displayName}.
                </p>

                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="mt-6 rounded-full bg-[#0b57d0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0842a0]"
                >
                  Done
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
