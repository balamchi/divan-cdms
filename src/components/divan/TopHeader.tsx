import { Bell } from "lucide-react";
import { DivanLogo } from "./DivanLogo";
import type { Role } from "@/lib/roles";
import { ROLE_THEME } from "@/lib/roles";
import { RoleSwitcher } from "./RoleSwitcher";

interface TopHeaderProps {
  role: Role;
  userName: string;
  initials: string;
  unread?: number;
}

export function TopHeader({ role, userName, initials, unread = 0 }: TopHeaderProps) {
  const theme = ROLE_THEME[role];
  return (
    <header
      className="sticky top-0 z-40 h-14 w-full border-b border-white/10 px-4 md:px-6 flex items-center justify-between"
      style={{ background: theme.headerBg, color: "white" }}
    >
      <div className="flex items-center gap-4">
        <DivanLogo variant="light" size="md" />
        <span className="hidden md:block h-4 w-px bg-white/30" />
        <span className="hidden md:inline text-[13px] text-white/70">{theme.label}</span>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <RoleSwitcher current={role} />
        <button
          type="button"
          aria-label="Notifications"
          className="relative h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full text-[10px] font-medium grid place-items-center text-white"
              style={{ background: "var(--danger)" }}
            >
              {unread}
            </span>
          )}
        </button>
        <div className="hidden md:flex items-center gap-2.5">
          <span className="text-[13px] text-white/85">{userName}</span>
          <div className="h-8 w-8 rounded-full bg-white/15 ring-1 ring-white/20 grid place-items-center text-[11px] font-medium">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
