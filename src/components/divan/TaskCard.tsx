import { FileText } from "lucide-react";
import type { Task } from "@/lib/mock-data";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

interface TaskCardProps {
  task: Task & {
    cover_url?: string;
    attachments?: { url: string }[];
  };
  variant: "client" | "team";
  onApprove?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  active?: boolean;
  timer?: string;
}

export function TaskCard({
  task,
  variant,
  onApprove,
  onRequestChanges,
  active,
  timer,
}: TaskCardProps) {
  const cover =
    task.cover_url ||
    (task.attachments && task.attachments.length > 0 ? task.attachments[0]?.url : undefined);

  const isReview = task.status === "Client Review";

  return (
    <div
      className="group flex items-center gap-4 cursor-pointer transition-colors"
      style={{
        padding: "12px 8px",
        borderBottom: "1px solid var(--border)",
        background: active ? "var(--secondary)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--secondary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "";
      }}
    >
      {/* Thumbnail */}
      <div
        className="shrink-0 grid place-items-center overflow-hidden"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          background: "var(--secondary)",
        }}
      >
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileText
            size={20}
            strokeWidth={1.4}
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          />
        )}
      </div>

      {/* Title + kind */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{ fontSize: "17px", fontWeight: 500, color: "var(--foreground)" }}
        >
          {task.subject}
        </div>
        <div
          className="truncate"
          style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}
        >
          {task.kind}
        </div>
      </div>

      {/* Right meta + actions */}
      <div className="flex items-center gap-4 shrink-0">
        {timer && (
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {timer}
          </span>
        )}
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {fmt(task.publishDate)}
        </span>

        {variant === "client" && isReview ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(task.id);
              }}
              className="h-8 px-3 rounded-md text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "var(--primary)" }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestChanges?.(task.id);
              }}
              className="h-8 px-3 rounded-md text-[13px] font-medium transition-colors"
              style={{ color: "var(--ring)", background: "transparent" }}
            >
              Request changes
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
