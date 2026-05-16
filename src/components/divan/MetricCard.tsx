import { cn } from "@/lib/utils";

export type MetricTrend = "positive" | "negative" | "neutral" | "loading";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "success" | "danger" | "warning" | "neutral";
  accentColor?: string;
  trend?: MetricTrend;
  className?: string;
}

function deriveTrend(deltaTone?: MetricCardProps["deltaTone"]): MetricTrend {
  if (deltaTone === "success") return "positive";
  if (deltaTone === "danger") return "negative";
  return "neutral";
}

export function MetricCard({
  label,
  value,
  delta,
  deltaTone,
  trend,
  className,
}: MetricCardProps) {
  const t: MetricTrend = trend ?? deriveTrend(deltaTone);

  const prefix =
    t === "positive" ? "+" : t === "negative" ? "\u2212" : "";

  const displayValue =
    typeof value === "number" && prefix ? `${prefix}${value}` : value;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="type-eyebrow" style={{ marginBottom: "8px" }}>
        {label}
      </div>

      {t === "loading" ? (
        <div
          className="animate-pulse"
          style={{
            width: "120px",
            height: "64px",
            borderRadius: "6px",
            background: "color-mix(in oklab, var(--text-secondary) 15%, transparent)",
          }}
        />
      ) : (
        <span className="type-display">{displayValue}</span>
      )}

      {delta && t !== "loading" ? (
        <div
          style={{
            fontSize: "15px",
            fontWeight: 400,
            color: "var(--text-secondary)",
            marginTop: "8px",
          }}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}
