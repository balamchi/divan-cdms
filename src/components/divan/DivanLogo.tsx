import { cn } from "@/lib/utils";

interface DivanLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function DivanLogo({ variant = "light", size = "md", className }: DivanLogoProps) {
  const color = variant === "light" ? "text-white" : "text-text-primary";
  return (
    <div className={cn("flex items-baseline gap-2 tracking-wide", color, SIZE_MAP[size], className)}>
      <span className="font-medium tracking-[0.18em]">DIVAN</span>
      <span
        className="font-persian font-medium opacity-85"
        style={{ fontSize: "85%" }}
        dir="rtl"
        aria-hidden
      >
        دیوان
      </span>
    </div>
  );
}
