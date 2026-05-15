import { useMemo } from "react";
import type { Task } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

const GRADIENTS = [
  "linear-gradient(135deg, #A6774C 0%, #7A716A 100%)",
  "linear-gradient(135deg, #48423D 0%, #7A716A 100%)",
  "linear-gradient(135deg, #6B1E5C 0%, #2C2C2A 100%)",
  "linear-gradient(135deg, #0B6B8C 0%, #1A1A19 100%)",
  "linear-gradient(135deg, #7A716A 0%, #48423D 100%)",
  "linear-gradient(135deg, #A6774C 0%, #6B1E5C 100%)",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

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

  const gradient = useMemo(() => {
    const seed = (task.companyId || task.id || "x") + (task.subject || "");
    return GRADIENTS[hashString(seed) % GRADIENTS.length];
  }, [task.companyId, task.id, task.subject]);

  const isReview = task.status === "Client Review";

  return (
    <div
      className="group cursor-pointer overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      style={{
        background: "var(--card)",
        border: "0.5px solid var(--border)",
        borderRadius: "12px",
        boxShadow: active ? "inset 3px 0 0 0 var(--teal)" : undefined,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          borderRadius: "12px 12px 0 0",
          background: cover ? undefined : gradient,
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02]"
          />
        ) : null}
        {/* Bottom gradient for legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        {/* Kind pill top-right */}
        <span
          className="absolute top-2 right-2 uppercase font-medium text-white"
          style={{
            background: "rgba(0,0,0,0.6)",
            padding: "4px 6px",
            fontSize: "9px",
            letterSpacing: "0.05em",
            borderRadius: "4px",
          }}
        >
          {task.kind}
        </span>
        {/* Publish date bottom-right */}
        <span
          className="absolute font-medium text-white/75"
          style={{
            right: "8px",
            bottom: "8px",
            fontSize: "10px",
          }}
        >
          {fmt(task.publishDate)}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2" style={{ padding: "12px" }}>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {timer && (
            <span
              className="ml-auto font-medium"
              style={{ fontSize: "11px", color: "var(--danger)" }}
            >
              {timer}
            </span>
          )}
        </div>
        <h4
          className="truncate"
          style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}
        >
          {task.subject}
        </h4>
        <p
          className="line-clamp-2"
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "var(--text-secondary)",
          }}
        >
          {task.description.slice(0, 130)}
        </p>

        {variant === "client" && isReview ? (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(task.id);
              }}
              className="h-8 px-3 rounded-md text-[12px] font-medium text-white transition-colors hover:opacity-90"
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
              className="h-8 px-3 rounded-md text-[12px] font-medium border border-border text-text-primary hover:bg-secondary transition-colors"
            >
              Request changes
            </button>
          </div>
        ) : variant === "team" ? (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="h-6 w-6 rounded-full ring-2 grid place-items-center text-[10px] font-medium"
                  style={{
                    background: "var(--surface-warm)",
                    color: "var(--text-secondary)",
                    boxShadow: "0 0 0 2px var(--card)",
                  }}
                  title={a}
                >
                  {a.slice(0, 2)}
                </span>
              ))}
            </div>
            {timer && (
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto h-7 px-2.5 rounded-md text-[11px] font-medium text-white"
                style={{ background: "var(--danger)" }}
              >
                Stop
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
