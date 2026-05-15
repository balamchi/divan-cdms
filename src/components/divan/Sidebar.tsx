import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/roles";
import { ROLE_THEME } from "@/lib/roles";
import { cn } from "@/lib/utils";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
  badgeCount?: number;
}

interface SidebarProps {
  role: Role;
  items: NavItem[];
  footer?: React.ReactNode;
  /** Optional override; defaults to the role's accent. */
  accentColor?: "teal" | "magenta" | "charcoal";
}

const ACCENT_VAR: Record<NonNullable<SidebarProps["accentColor"]>, string> = {
  teal: "var(--teal)",
  magenta: "var(--magenta)",
  charcoal: "var(--charcoal)",
};

export function Sidebar({ role, items, footer, accentColor }: SidebarProps) {
  const accent = accentColor ? ACCENT_VAR[accentColor] : ROLE_THEME[role].accent;
  const location = useLocation();
  return (
    <aside
      className="hidden md:flex shrink-0 w-[220px] flex-col border-r border-border"
      style={{ background: "var(--surface-warm)" }}
    >
      <nav className="flex-1 py-4">
        {items.map((item) => {
          const active = location.pathname === item.route;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.route}-${item.label}`}
              to={item.route}
              className={cn(
                "group relative flex items-center gap-3 py-2 pr-4 text-[14px] font-normal transition-colors",
              )}
              style={{
                paddingLeft: "12px",
                color: active ? accent : "var(--text-primary)",
                background: active
                  ? `color-mix(in oklab, ${accent} 5%, transparent)`
                  : undefined,
                fontWeight: active ? 500 : 400,
              }}
            >
              {/* Accent bar */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 bottom-0 transition-all duration-[250ms] ease-in-out group-hover:translate-x-0 group-hover:opacity-60"
                style={{
                  width: "4px",
                  background: accent,
                  opacity: active ? 1 : 0,
                  transform: active ? "translateX(0)" : "translateX(-100%)",
                }}
              />
              <Icon size={20} strokeWidth={1.6} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badgeCount ? (
                <span
                  className="h-5 min-w-[20px] px-1.5 rounded-full text-[10px] grid place-items-center text-white font-medium"
                  style={{ background: accent }}
                >
                  {item.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className="p-5 border-t border-border/60">{footer}</div> : null}
    </aside>
  );
}
