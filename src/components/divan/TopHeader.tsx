import { Bell, LogOut } from "lucide-react";
import { DivanLogo } from "./DivanLogo";
import type { Role } from "@/lib/roles";
import { ROLE_THEME } from "@/lib/roles";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

interface TopHeaderProps {
  role: Role;
  userName: string;
  initials: string;
  unread?: number;
}

export function TopHeader({ role, userName, initials, unread = 0 }: TopHeaderProps) {
  const theme = ROLE_THEME[role];
  const { session, user, signOut } = useAuth();
  const navigate = useNavigate();
  const authed = !!session;
  const displayName = user?.full_name || userName;
  const displayInitials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : initials;

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
        {authed ? (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] text-white/85 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} />
            Sign out
          </button>
        ) : (
          <RoleSwitcher current={role} />
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="relative h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
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
          <span className="text-[13px] text-white/85">{displayName}</span>
          <div className="h-8 w-8 rounded-full bg-white/15 ring-1 ring-white/20 grid place-items-center text-[11px] font-medium">
            {displayInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
