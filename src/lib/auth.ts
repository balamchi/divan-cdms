import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/roles";

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  company_id: string | null;
  avatar_url: string | null;
}

export interface AuthState {
  loading: boolean;
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
  user: AppUser | null;
}

async function fetchAppUser(authUserId: string, email: string | undefined): Promise<AppUser | null> {
  // try by auth_user_id first
  const byAuth = await supabase
    .from("users")
    .select("id,email,full_name,role,company_id,avatar_url")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (byAuth.data) return byAuth.data as AppUser;
  if (!email) return null;
  const byEmail = await supabase
    .from("users")
    .select("id,email,full_name,role,company_id,avatar_url")
    .eq("email", email)
    .maybeSingle();
  return (byEmail.data as AppUser | null) ?? null;
}

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({ loading: true, session: null, user: null });

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setState({ loading: false, session: null, user: null });
        return;
      }
      setState((s) => ({ ...s, session, loading: true }));
      // Defer the DB lookup so we don't deadlock the auth event loop
      setTimeout(async () => {
        const user = await fetchAppUser(session.user.id, session.user.email ?? undefined);
        if (!mounted) return;
        setState({ loading: false, session, user });
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setState({ loading: false, session: null, user: null });
        return;
      }
      const user = await fetchAppUser(session.user.id, session.user.email ?? undefined);
      if (!mounted) return;
      setState({ loading: false, session, user });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
