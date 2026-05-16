import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getActiveRole } from "@/lib/roles";

/**
 * Client-side auth guard. Redirects to /login if there's no Supabase
 * session AND no localStorage demo role flag.
 */
export function useRequireAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) return;
      const demoRole =
        typeof window !== "undefined" ? localStorage.getItem("divan.activeRole") : null;
      if (demoRole) return;
      void getActiveRole();
      navigate({ to: "/login" });
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);
}
