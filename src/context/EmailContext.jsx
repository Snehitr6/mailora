import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { initialEmails } from "../data/emails";

const EmailContext = createContext(null);
const STORAGE_KEY = "mailoraEmails";

function loadEmails() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [...initialEmails];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [...initialEmails];

    const savedById = new Map(
      parsed.map((email) => [String(email.id), email])
    );

    const seedIds = new Set(
      initialEmails.map((email) => String(email.id))
    );

    const refreshedSeeds = initialEmails.map((seed) => {
      const previous = savedById.get(String(seed.id));

      if (!previous) return { ...seed };

      return {
        ...seed,
        unread: previous.unread ?? seed.unread,
        starred: previous.starred ?? seed.starred,
        snoozedUntil: previous.snoozedUntil ?? seed.snoozedUntil,
      };
    });

    const customEmails = parsed.filter(
      (email) => !seedIds.has(String(email.id))
    );

    return [...refreshedSeeds, ...customEmails];
  } catch (error) {
    console.error("Failed to load Mailora emails:", error);
    return [...initialEmails];
  }
}

function createId() {
  return `mail-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function EmailProvider({ children }) {
  const [emails, setEmails] = useState(loadEmails);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
    } catch (error) {
      console.error("Failed to save Mailora emails:", error);
    }
  }, [emails]);

  const updateEmail = useCallback((id, updates) => {
    setEmails((current) =>
      current.map((email) =>
        String(email.id) === String(id)
          ? {
              ...email,
              ...(typeof updates === "function"
                ? updates(email)
                : updates),
            }
          : email
      )
    );
  }, []);

  const toggleStar = useCallback((id) => {
    setEmails((current) =>
      current.map((email) =>
        String(email.id) === String(id)
          ? { ...email, starred: !email.starred }
          : email
      )
    );
  }, []);

  const toggleRead = useCallback((id) => {
    setEmails((current) =>
      current.map((email) =>
        String(email.id) === String(id)
          ? { ...email, unread: !email.unread }
          : email
      )
    );
  }, []);

  const markRead = useCallback(
    (id) => updateEmail(id, { unread: false }),
    [updateEmail]
  );

  const markUnread = useCallback(
    (id) => updateEmail(id, { unread: true }),
    [updateEmail]
  );

  const moveEmail = useCallback((id, folder) => {
    setEmails((current) =>
      current.map((email) =>
        String(email.id) === String(id)
          ? {
              ...email,
              folder,
              archived: folder === "archive",
              ...(folder === "trash" || folder === "spam"
                ? { starred: false }
                : {}),
            }
          : email
      )
    );
  }, []);

  const moveMany = useCallback((ids, folder) => {
    const selected = new Set(ids.map(String));

    setEmails((current) =>
      current.map((email) =>
        selected.has(String(email.id))
          ? {
              ...email,
              folder,
              archived: folder === "archive",
              ...(folder === "trash" || folder === "spam"
                ? { starred: false }
                : {}),
            }
          : email
      )
    );
  }, []);

  const removeEmail = useCallback(
    (id) => moveEmail(id, "trash"),
    [moveEmail]
  );

  const removeMany = useCallback(
    (ids) => moveMany(ids, "trash"),
    [moveMany]
  );

  const restoreEmail = useCallback(
    (id) => moveEmail(id, "inbox"),
    [moveEmail]
  );

  const permanentlyDelete = useCallback((id) => {
    setEmails((current) =>
      current.filter((email) => String(email.id) !== String(id))
    );
  }, []);

  const permanentlyDeleteMany = useCallback((ids) => {
    const selected = new Set(ids.map(String));

    setEmails((current) =>
      current.filter((email) => !selected.has(String(email.id)))
    );
  }, []);

  const emptyTrash = useCallback(() => {
    setEmails((current) =>
      current.filter((email) => email.folder !== "trash")
    );
  }, []);

  const archiveEmail = useCallback(
    (id) => moveEmail(id, "archive"),
    [moveEmail]
  );

  const reportSpam = useCallback(
    (id) => moveEmail(id, "spam"),
    [moveEmail]
  );

  const saveDraft = useCallback((draft) => {
    const id = draft.id || createId();
    const bodyText =
      typeof draft.body === "string"
        ? draft.body.replace(/<[^>]*>/g, " ").trim()
        : "";

    const savedDraft = {
      ...draft,
      id,
      folder: "drafts",
      sender: draft.sender || "Alex Morgan",
      email: draft.email || "demo@mailora.app",
      to: draft.to || "",
      subject: draft.subject || "",
      body: draft.body || "",
      preview: draft.preview || bodyText.slice(0, 120),
      time: new Date().toISOString(),
      unread: false,
      starred: Boolean(draft.starred),
      archived: false,
      attachments: Array.isArray(draft.attachments)
        ? draft.attachments
        : [],
    };

    setEmails((current) => {
      const exists = current.some(
        (email) => String(email.id) === String(id)
      );

      return exists
        ? current.map((email) =>
            String(email.id) === String(id) ? savedDraft : email
          )
        : [savedDraft, ...current];
    });

    return savedDraft;
  }, []);

  const sendEmail = useCallback((message) => {
    const id = createId();
    const bodyText =
      typeof message.body === "string"
        ? message.body.replace(/<[^>]*>/g, " ").trim()
        : "";

    const sentMessage = {
      ...message,
      id,
      folder: "sent",
      sender: message.sender || "Alex Morgan",
      email: message.email || "demo@mailora.app",
      to: message.to || "",
      subject: message.subject || "(no subject)",
      body: message.body || "",
      preview: message.preview || bodyText.slice(0, 120),
      time: new Date().toISOString(),
      unread: false,
      starred: false,
      archived: false,
      attachments: Array.isArray(message.attachments)
        ? message.attachments
        : [],
    };

    setEmails((current) => {
      const withoutDraft = message.id
        ? current.filter(
            (email) => String(email.id) !== String(message.id)
          )
        : current;

      return [sentMessage, ...withoutDraft];
    });

    return sentMessage;
  }, []);

  const snoozeEmail = useCallback(
    (id, until) =>
      updateEmail(id, {
        snoozedUntil:
          until instanceof Date ? until.getTime() : Number(until),
      }),
    [updateEmail]
  );

  const unsnoozeEmail = useCallback(
    (id) => updateEmail(id, { snoozedUntil: null }),
    [updateEmail]
  );

  const value = {
    emails,
    setEmails,
    updateEmail,
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
    saveDraft,
    sendEmail,
    snoozeEmail,
    unsnoozeEmail,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmails() {
  const context = useContext(EmailContext);

  if (!context) {
    throw new Error("useEmails must be used inside EmailProvider");
  }

  return context;
}