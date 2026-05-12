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
}

export function Sidebar({ role, items, footer }: SidebarProps) {
  const accent = ROLE_THEME[role].accent;
  const location = useLocation();
  return (
    <aside
      className="hidden md:flex shrink-0 w-[220px] flex-col border-r border-border"
      style={{ background: "#F1EFE8" }}
    >
      <nav className="flex-1 py-4">
        {items.map((item) => {
          const active = location.pathname === item.route;
          const Icon = item.icon;
          return (
            <Link
              key={item.route}
              to={item.route}
              className={cn(
                "group flex items-center gap-3 px-5 py-2 text-[13px] text-text-primary/80 hover:text-text-primary transition-colors relative",
              )}
              style={
                active
                  ? { color: accent, fontWeight: 500, boxShadow: `inset 2px 0 0 0 ${accent}` }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              <span className="flex-1">{item.label}</span>
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
