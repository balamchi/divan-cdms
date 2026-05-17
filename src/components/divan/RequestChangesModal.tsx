import { useState } from "react";

interface RequestChangesModalProps {
  open: boolean;
  taskTitle?: string;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void> | void;
}

export function RequestChangesModal({
  open,
  taskTitle,
  onClose,
  onSubmit,
}: RequestChangesModalProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const valid = note.trim().length >= 10 && note.length <= 1000;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onSubmit(note.trim());
      setNote("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-medium text-text-primary">
          Request changes
        </h2>
        <p className="text-[13px] text-text-secondary mt-1">
          Tell the team what needs to change{taskTitle ? ` on "${taskTitle}"` : ""}.
          Your note will be added as a comment on the task.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What should change?"
          maxLength={1000}
          rows={5}
          className="mt-4 w-full rounded-lg px-3 py-2 text-[14px] outline-none resize-y"
          style={{
            border: "1px solid var(--border)",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
          autoFocus
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-text-secondary">
            {note.trim().length < 10
              ? `${Math.max(0, 10 - note.trim().length)} more characters`
              : `${note.length} / 1000`}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 px-4 rounded-md text-[13px] font-medium border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              background: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid || busy}
            className="h-9 px-4 rounded-md text-[13px] font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {busy ? "Sending…" : "Send to team"}
          </button>
        </div>
      </div>
    </div>
  );
}
