import type { TaskStatus } from "@/lib/mock-data";

const MAP: Record<
  TaskStatus,
  { bg: string; fg: string; label: string }
> = {
  "to do": { bg: "var(--status-todo-bg)", fg: "var(--status-todo-fg)", label: "To do" },
  "in progress": { bg: "var(--status-progress-bg)", fg: "var(--status-progress-fg)", label: "In progress" },
  "Client Review": { bg: "var(--status-review-bg)", fg: "var(--status-review-fg)", label: "Client review" },
  Approved: { bg: "var(--status-approved-bg)", fg: "var(--status-approved-fg)", label: "Approved" },
  complete: { bg: "var(--status-complete-bg)", fg: "var(--status-complete-fg)", label: "Complete" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = MAP[status];
  return (
    <span
      className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium tracking-wide"
      style={{ background: m.bg, color: m.fg }}
    >
      {m.label}
    </span>
  );
}
