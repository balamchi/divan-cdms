import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricTrend = "positive" | "negative" | "neutral" | "loading";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  /** Legacy tone — mapped to `trend` when `trend` is not provided. */
  deltaTone?: "success" | "danger" | "warning" | "neutral";
  /** Top accent line color — stays in role/category color regardless of trend. */
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
  accentColor = "var(--teal)",
  trend,
  className,
}: MetricCardProps) {
  const t: MetricTrend = trend ?? deriveTrend(deltaTone);

  const numberColor =
    t === "positive"
      ? "var(--success)"
      : t === "negative"
        ? "var(--danger)"
        : t === "neutral"
          ? "var(--text-secondary)"
          : "var(--text-primary)";

  const deltaColor =
    deltaTone === "danger"
      ? "var(--danger)"
      : deltaTone === "warning"
        ? "var(--warning)"
        : deltaTone === "success"
          ? "var(--success)"
          : "var(--text-secondary)";

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: "var(--card)",
        borderRadius: "12px",
        border: "0.5px solid var(--border)",
        padding: "20px 24px",
      }}
    >
      {/* Top accent line — always category color */}
      <div
        aria-hidden
        className="dark:opacity-40"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: accentColor,
          opacity: 0.6,
        }}
      />
      <div
        className="uppercase font-medium"
        style={{
          color: "var(--text-secondary)",
          fontSize: "11px",
          letterSpacing: "0.073em",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      {t === "loading" ? (
        <div
          className="animate-pulse"
          style={{
            width: "40px",
            height: "48px",
            borderRadius: "6px",
            background: "color-mix(in oklab, var(--text-secondary) 20%, transparent)",
          }}
        />
      ) : (
        <div className="flex items-baseline gap-2">
          {t === "positive" && (
            <ArrowUp
              className="dark:hidden"
              style={{ color: numberColor, opacity: 0.6 }}
              size={20}
              strokeWidth={1.6}
            />
          )}
          {t === "positive" && (
            <ArrowUp
              className="hidden dark:inline-block"
              style={{ color: numberColor, opacity: 0.6 }}
              size={24}
              strokeWidth={1.6}
            />
          )}
          {t === "negative" && (
            <>
              <ArrowDown
                className="dark:hidden"
                style={{ color: numberColor, opacity: 0.6 }}
                size={20}
                strokeWidth={1.6}
              />
              <ArrowDown
                className="hidden dark:inline-block"
                style={{ color: numberColor, opacity: 0.6 }}
                size={24}
                strokeWidth={1.6}
              />
            </>
          )}
          <span
            className="text-[40px] dark:text-[48px] font-medium leading-none"
            style={{ color: numberColor, letterSpacing: "-0.5px" }}
          >
            {t === "neutral" && typeof value === "number" ? `— ${value}` : value}
          </span>
        </div>
      )}

      {delta && t !== "loading" ? (
        <div
          className="mt-2 font-medium"
          style={{ fontSize: "11px", color: deltaColor }}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}
