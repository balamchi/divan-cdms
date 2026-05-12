import { useNavigate } from "@tanstack/react-router";
import type { Role } from "@/lib/roles";
import { ROLE_THEME, setActiveRole } from "@/lib/roles";

interface RoleSwitcherProps {
  current: Role;
}

// Demo-only switcher so you can preview all three role experiences before
// Lovable Cloud auth is wired up. Removed once real auth lands.
export function RoleSwitcher({ current }: RoleSwitcherProps) {
  const navigate = useNavigate();
  const roles: Role[] = ["client", "team", "admin"];
  return (
    <div className="hidden md:flex items-center gap-1 rounded-md bg-white/10 p-0.5 text-[11px]">
      {roles.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => {
            setActiveRole(r);
            navigate({ to: ROLE_THEME[r].route });
          }}
          className={`px-2.5 h-6 rounded-[5px] transition-colors ${
            current === r ? "bg-white text-text-primary" : "text-white/80 hover:bg-white/10"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
