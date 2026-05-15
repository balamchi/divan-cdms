import {
  Bell,
  LogOut,
  Link2,
  Check,
  User as UserIcon,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DivanLogo } from "./DivanLogo";
import type { Role } from "@/lib/roles";
import { ROLE_THEME } from "@/lib/roles";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getClickUpConnection, getClickUpAuthorizeUrl } from "@/lib/clickup.functions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTheme, type ThemeMode } from "@/integrations/theme/ThemeProvider";

interface TopHeaderProps {
  role: Role;
  userName: string;
  initials: string;
  unread?: number;
}

export function TopHeader({ role, userName, initials, unread = 0 }: TopHeaderProps) {
  const theme = ROLE_THEME[role];
  const { session, user, signOut } = useAuth();
  const { theme: themeMode, setTheme } = useTheme();
  const navigate = useNavigate();
  const authed = !!session;
  const displayName = user?.full_name || userName;
  const displayInitials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : initials;
  const effectiveRole: Role = (user?.role as Role) || role;
  const showClickUp = effectiveRole === "team" || effectiveRole === "admin";
  const [cuConnected, setCuConnected] = useState<boolean | null>(null);
  const fetchConn = useServerFn(getClickUpConnection);
  const fetchAuthorizeUrl = useServerFn(getClickUpAuthorizeUrl);

  useEffect(() => {
    if (!showClickUp || !authed) {
      setCuConnected(false);
      return;
    }
    fetchConn({}).then((r) => setCuConnected(r.connected)).catch(() => setCuConnected(false));
  }, [showClickUp, authed, fetchConn]);

  const connectClickUp = async () => {
    try {
      const redirectUri = `${window.location.origin}/clickup/callback`;
      const { url } = await fetchAuthorizeUrl({ data: { redirect_uri: redirectUri } });
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start ClickUp connection");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const themeOptions: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Laptop },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-white/10 flex items-center justify-between"
      style={{
        background: theme.headerBg,
        color: "white",
        padding: "12px 20px",
      }}
    >
      <div className="flex items-center gap-3">
        <DivanLogo variant="light" size="sm" />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {!authed && <RoleSwitcher current={role} />}
        <button
          type="button"
          aria-label="Notifications"
          className="relative h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 transition-colors"
        >
          <Bell size={18} strokeWidth={1.6} />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full text-[10px] font-medium grid place-items-center text-white"
              style={{ background: "var(--danger)" }}
            >
              {unread}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 h-8 pl-1.5 pr-1 rounded-md hover:bg-white/10 transition-colors outline-none"
              aria-label="Account menu"
            >
              <div
                className="rounded-full bg-white/15 ring-1 ring-white/20 grid place-items-center font-medium"
                style={{ height: "32px", width: "32px", fontSize: "12px" }}
              >
                {displayInitials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/70" strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="text-[13px] font-medium">{displayName}</div>
              <div className="text-[11px] text-text-secondary capitalize">
                {effectiveRole}
                {!authed && " · demo"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-[13px]">
              <UserIcon className="h-3.5 w-3.5 mr-2" strokeWidth={1.6} />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-text-secondary font-normal">
              Appearance
            </DropdownMenuLabel>
            {themeOptions.map(({ value, label, Icon }) => (
              <DropdownMenuItem
                key={value}
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(value);
                }}
                className="text-[13px] flex items-center"
              >
                <Icon className="h-3.5 w-3.5 mr-2" strokeWidth={1.6} />
                <span className="flex-1">{label}</span>
                {themeMode === value && (
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </DropdownMenuItem>
            ))}

            {showClickUp && !cuConnected && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={connectClickUp} className="text-[13px]">
                  <Link2 className="h-3.5 w-3.5 mr-2" strokeWidth={1.6} />
                  Connect ClickUp
                </DropdownMenuItem>
              </>
            )}
            {showClickUp && cuConnected && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={connectClickUp}
                  className="text-[13px]"
                  title="Reconnect ClickUp"
                >
                  <Check
                    className="h-3.5 w-3.5 mr-2"
                    style={{ color: "var(--success)" }}
                    strokeWidth={1.8}
                  />
                  ClickUp connected
                </DropdownMenuItem>
              </>
            )}
            {authed && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="text-[13px]">
                  <LogOut className="h-3.5 w-3.5 mr-2" strokeWidth={1.6} />
                  Sign out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
