
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ComposeModal from "../components/ComposeModal";
import { useEmails } from "../context/EmailContext";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { saveDraft, sendEmail } = useEmails();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("mailoraTheme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    try {
      localStorage.setItem("mailoraTheme", darkMode ? "dark" : "light");
    } catch {
      // Theme still works for the current session.
    }
  }, [darkMode]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const openCompose = useCallback((draft = null) => {
    setDraftToEdit(draft);
    setComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setComposeOpen(false);
    setDraftToEdit(null);
  }, []);

  const handleSaveDraft = useCallback(
    (draft) => {
      saveDraft?.(draft);
      closeCompose();
      showToast("Draft saved");
    },
    [saveDraft, closeCompose, showToast]
  );

  const handleSend = useCallback(
    (message) => {
      sendEmail?.(message);
      closeCompose();
      showToast("Message sent");
      navigate("/inbox/sent");
    },
    [sendEmail, closeCompose, showToast, navigate]
  );

  const toggleTheme = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f8fc] text-[#202124] transition-colors duration-200 dark:bg-[#131314] dark:text-[#e3e3e3]">
      {/* Single sidebar instance */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onCompose={() => openCompose()}
      />

      {/* Main content: render the navbar only once */}
      <div className="min-h-screen min-w-0 lg:pl-[264px]">
        <Navbar
          search={search}
          setSearch={setSearch}
          onMenu={() => setMobileOpen(true)}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

        <main className="min-w-0 px-2 py-3 sm:px-4 sm:py-5 lg:px-6">
          <Outlet
            context={{
              search,
              setSearch,
              openCompose,
              setToast: showToast,
            }}
          />
        </main>
      </div>

      {/* Compose modal */}
      <ComposeModal
        open={composeOpen}
        onClose={closeCompose}
        initialDraft={draftToEdit}
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
      />

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[100] flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[#303134] px-4 py-3 text-sm font-medium text-white shadow-xl animate-enter"
        >
          <CheckCircle2 size={19} className="shrink-0 text-emerald-400" />

          <span className="break-words">{toast}</span>

          <button
            type="button"
            onClick={() => setToast("")}
            className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
