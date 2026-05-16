import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/roles";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: ThemeMode) => void;
}

const STORAGE_KEY = "divan-cdms-theme";

const ROLE_DEFAULT: Record<Role, ThemeMode> = {
  client: "light",
  team: "light",
  admin: "light",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : null;
}

function systemPref(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(() => readStored() ?? "system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => systemPref());
  const [hasUserChoice, setHasUserChoice] = useState<boolean>(() => readStored() !== null);

  // Apply per-role default once we know the role, only if the user hasn't picked.
  useEffect(() => {
    if (hasUserChoice) return;
    if (!user?.role) return;
    const def = ROLE_DEFAULT[user.role as Role] ?? "system";
    setThemeState(def);
  }, [user?.role, hasUserChoice]);

  // Watch system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Apply class
  useEffect(() => {
    applyClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    setHasUserChoice(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback for SSR / pre-mount usage
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
    };
  }
  return ctx;
}
