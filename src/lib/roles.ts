export type Role = "client" | "team" | "admin";

export const ROLE_THEME: Record<
  Role,
  { headerBg: string; accent: string; label: string; route: string }
> = {
  client: {
    headerBg: "var(--background)",
    accent: "var(--teal)",
    label: "Client portal",
    route: "/portal",
  },
  team: {
    headerBg: "var(--background)",
    accent: "var(--magenta)",
    label: "Team workspace",
    route: "/workspace",
  },
  admin: {
    headerBg: "var(--background)",
    accent: "var(--magenta)",
    label: "Founder console",
    route: "/console",
  },
};

const KEY = "divan.activeRole";

export function getActiveRole(): Role {
  if (typeof window === "undefined") return "client";
  return (localStorage.getItem(KEY) as Role) || "client";
}

export function setActiveRole(role: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, role);
}
