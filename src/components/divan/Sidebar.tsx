import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/roles";
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
  accentColor?: "teal" | "magenta" | "charcoal";
}

export function Sidebar({ items, footer }: SidebarProps) {
  const location = useLocation();
  return (
    <aside
      className="hidden md:flex shrink-0 w-[220px] flex-col"
      style={{ background: "var(--background)" }}
    >
      <nav className="flex-1 py-6 px-3">
        {items.map((item) => {
          const active = location.pathname === item.route;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.route}-${item.label}`}
              to={item.route}
              className={cn(
                "flex items-center gap-2.5 rounded-md transition-colors",
                "hover:text-foreground",
              )}
              style={{
                padding: "8px 12px",
                color: active ? "var(--foreground)" : "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={16} strokeWidth={1.6} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badgeCount ? (
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className="px-5 py-4">{footer}</div> : null}
    </aside>
  );
}
