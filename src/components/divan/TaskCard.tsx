import { Image as ImageIcon, Play, Mail, Megaphone, MapPin, Sparkles } from "lucide-react";
import type { Task, TaskKind } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

const KIND_ICON: Record<TaskKind, typeof ImageIcon> = {
  "Publish Plan": ImageIcon,
  "Story Plan": Play,
  Email: Mail,
  Ad: Megaphone,
  "GBP Post": MapPin,
  Influencer: Sparkles,
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

interface TaskCardProps {
  task: Task;
  variant: "client" | "team";
  onApprove?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  active?: boolean;
  timer?: string;
}

export function TaskCard({ task, variant, onApprove, onRequestChanges, active, timer }: TaskCardProps) {
  const Icon = KIND_ICON[task.kind];
  const isReview = task.status === "Client Review";

  return (
    <div
      className="bg-card rounded-xl border border-border p-3 flex gap-3 transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      style={active ? { borderLeft: "3px solid var(--teal)" } : undefined}
    >
      <div
        className="h-20 w-16 shrink-0 rounded-md grid place-items-center"
        style={{ background: "var(--surface-warm)" }}
      >
        <Icon className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <span className="text-[11px] text-text-secondary">{fmt(task.publishDate)}</span>
          {timer && (
            <span
              className="ml-auto text-[11px] font-medium"
              style={{ color: "var(--danger)" }}
            >
              {timer}
            </span>
          )}
        </div>
        <h4 className="text-[14px] font-medium text-text-primary truncate">{task.subject}</h4>
        <p className="text-[12px] text-text-secondary line-clamp-2">
          {task.description.slice(0, 130)}
        </p>
        <div className="flex items-center gap-2 pt-1">
          {variant === "client" && isReview ? (
            <>
              <button
                type="button"
                onClick={() => onApprove?.(task.id)}
                className="h-8 px-3 rounded-md text-[12px] font-medium text-white transition-colors hover:opacity-90"
                style={{ background: "var(--teal)" }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onRequestChanges?.(task.id)}
                className="h-8 px-3 rounded-md text-[12px] font-medium border border-border text-text-primary hover:bg-secondary transition-colors"
              >
                Request changes
              </button>
            </>
          ) : variant === "team" ? (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="h-6 w-6 rounded-full ring-2 ring-card grid place-items-center text-[10px] font-medium"
                  style={{ background: "var(--surface-warm)", color: "var(--text-secondary)" }}
                  title={a}
                >
                  {a.slice(0, 2)}
                </span>
              ))}
              {timer && (
                <button
                  type="button"
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
    </div>
  );
}
