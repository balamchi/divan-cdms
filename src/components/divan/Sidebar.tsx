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
          const [path, hash] = item.route.split("#");
          const active = location.pathname === path && (!hash || location.hash === `#${hash}`);
          const Icon = item.icon;
          const className = "flex items-center gap-2.5 rounded-md transition-colors hover:text-foreground";
          const style = {
            padding: "8px 12px",
            color: active ? "var(--foreground)" : "var(--text-secondary)",
            fontSize: "14px",
            fontWeight: active ? 500 : 400,
          } as const;
          const inner = (
            <>
              <Icon size={16} strokeWidth={1.6} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badgeCount ? (
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {item.badgeCount}
                </span>
              ) : null}
            </>
          );
          if (hash) {
            return (
              <Link
                key={`${item.route}-${item.label}`}
                to={path}
                hash={hash}
                className={className}
                style={style}
              >
                {inner}
              </Link>
            );
          }
          return (
            <Link
              key={`${item.route}-${item.label}`}
              to={item.route}
              className={className}
              style={style}
            >
              {inner}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className="px-5 py-4">{footer}</div> : null}
    </aside>
  );
}
