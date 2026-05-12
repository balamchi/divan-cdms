import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "success" | "danger" | "warning" | "neutral";
  accentColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaTone = "success",
  accentColor,
  className,
}: MetricCardProps) {
  const deltaColor =
    deltaTone === "success"
      ? "var(--success)"
      : deltaTone === "danger"
        ? "var(--danger)"
        : deltaTone === "warning"
          ? "var(--warning)"
          : "var(--text-secondary)";
  return (
    <div
      className={cn("rounded-md p-3.5 flex flex-col gap-1.5", className)}
      style={{ background: "#F1EFE8" }}
    >
      <span className="text-[11px] text-text-secondary">{label}</span>
      <span
        className="text-[24px] leading-none font-medium"
        style={{ color: accentColor || "var(--text-primary)" }}
      >
        {value}
      </span>
      {delta ? (
        <span className="text-[11px] font-medium" style={{ color: deltaColor }}>
          {delta}
        </span>
      ) : null}
    </div>
  );
}
