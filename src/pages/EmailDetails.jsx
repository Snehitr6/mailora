
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmailView from "../components/EmailView";
import { useEmails } from "../context/EmailContext";
import { useOutletContext } from "react-router-dom";

export default function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { emails = [], markRead, toggleStar, moveEmail } = useEmails();
  const { openCompose, setToast } = useOutletContext() || {};

  const email = useMemo(
    () => emails.find((item) => String(item.id) === String(id)),
    [emails, id]
  );

  useEffect(() => {
    if (email?.unread) {
      markRead?.(email.id);
    }
  }, [email, markRead]);

  const openReply = (message, mode = "reply") => {
    if (!openCompose) {
      setToast?.("Compose is unavailable");
      return;
    }

    openCompose({
      id: undefined,
      folder: "drafts",
      to:
        mode === "forward"
          ? ""
          : message.email || message.sender || "",
      subject:
        mode === "forward"
          ? `Fwd: ${message.subject || ""}`
          : `Re: ${message.subject || ""}`,
      body:
        mode === "forward"
          ? `\n\n---------- Forwarded message ----------\nFrom: ${message.sender || ""}\nSubject: ${message.subject || ""}\n\n${message.body || ""}`
          : `\n\nOn ${message.time || ""}, ${message.sender || "sender"} wrote:\n> ${(message.body || "").replace(/\n/g, "\n> ")}`,
    });
  };

  const handleMove = (destination) => {
    if (!email) return;
    moveEmail?.(email.id, destination);
    setToast?.(
      destination === "trash"
        ? "Message moved to Trash"
        : destination === "spam"
          ? "Message reported as spam"
          : "Message archived"
    );
    navigate(
      destination === "trash" || destination === "spam"
        ? `/inbox/${destination}`
        : "/inbox",
      { replace: true }
    );
  };

  return (
    <EmailView
      email={email}
      onBack={() => navigate(-1)}
      onReply={(message) => openReply(message, "reply")}
      onReplyAll={(message) => openReply(message, "reply")}
      onForward={(message) => openReply(message, "forward")}
      onArchive={() => handleMove("archive")}
      onDelete={() => handleMove("trash")}
      onReportSpam={() => handleMove("spam")}
      onToggleStar={() => {
        if (email) toggleStar?.(email.id);
      }}
      onToggleRead={() => {
        if (email) {
          markRead?.(email.id);
          setToast?.("Message marked as read");
        }
      }}
      onSnooze={() => setToast?.("Snooze requires a scheduled wake-up time.")}
      onToast={setToast}
    />
  );
}
