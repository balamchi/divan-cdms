import type { TaskStatus } from "@/lib/mock-data";

const MAP: Record<TaskStatus, { bg: string; fg: string; label: string }> = {
  "to do": { bg: "var(--status-todo-bg)", fg: "var(--status-todo-fg)", label: "To do" },
  "in progress": {
    bg: "var(--status-progress-bg)",
    fg: "var(--status-progress-fg)",
    label: "In progress",
  },
  "Client Review": {
    bg: "var(--status-review-bg)",
    fg: "var(--status-review-fg)",
    label: "Client review",
  },
  Approved: {
    bg: "var(--status-approved-bg)",
    fg: "var(--status-approved-fg)",
    label: "Approved",
  },
  complete: {
    bg: "var(--status-complete-bg)",
    fg: "var(--status-complete-fg)",
    label: "Complete",
  },
  approved: {
    bg: "var(--status-approved-bg)",
    fg: "var(--status-approved-fg)",
    label: "Approved",
  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = MAP[status];
  return (
    <span
      className="inline-flex items-center uppercase font-medium"
      style={{
        background: m.bg,
        color: m.fg,
        fontSize: "11px",
        letterSpacing: "0.08em",
        padding: "3px 8px",
        borderRadius: "4px",
        transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {m.label}
    </span>
  );
}
