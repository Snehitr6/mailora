
import EmailRow from "./EmailRow";

export default function EmailList({
  emails = [],
  selectedIds = [],
  onToggleSelect,
  onToggleStar,
  onToggleRead,
  onOpen,
  onCompose,
  onToast,
  folder,
}) {
  if (!emails.length) return null;

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
      {emails.map((email) => (
        <EmailRow
          key={email.id}
          email={email}
          selected={selectedIds.includes(email.id)}
          onToggleSelect={() => onToggleSelect?.(email.id)}
          onToggleStar={() => onToggleStar?.(email.id)}
          onToggleRead={() => onToggleRead?.(email.id)}
          onOpen={() => onOpen?.(email)}
          onCompose={onCompose}
          onToast={onToast}
          folder={folder}
        />
      ))}
    </div>
  );
}
