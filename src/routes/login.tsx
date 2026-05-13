import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DivanLogo } from "@/components/divan/DivanLogo";
import { setActiveRole, type Role, ROLE_THEME } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in · Divan CDMS" },
      {
        name: "description",
        content:
          "Divan CDMS — the team workspace and client portal for Divan Group. Discipline. Consistency. Creativity.",
      },
    ],
  }),
});

async function routeForSignedInUser(navigate: ReturnType<typeof useNavigate>, email: string | undefined) {
  if (!email) return;
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("email", email)
    .maybeSingle();
  const role = (data?.role as Role | undefined) ?? "client";
  setActiveRole(role);
  navigate({ to: ROLE_THEME[role].route });
}

function LoginPage() {
  const [tab, setTab] = useState<"team" | "client">("client");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // If a session is already present (or one comes back from OAuth), redirect.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) routeForSignedInUser(navigate, session.user.email ?? undefined);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) routeForSignedInUser(navigate, session.user.email ?? undefined);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const enterAsDemo = (role: Role) => {
    setActiveRole(role);
    navigate({ to: ROLE_THEME[role].route });
  };

  const sendMagicLink = async () => {
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your inbox.");
  };

  const signInGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message ?? "Sign in failed");
      return;
    }
    if (result.redirected) return; // browser will navigate
    // tokens already set — auth state change handler will route
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Brand panel */}
      <div
        className="hidden md:flex w-[44%] flex-col justify-between p-10"
        style={{ background: "var(--charcoal)", color: "white" }}
      >
        <DivanLogo variant="light" size="lg" />
        <div className="space-y-4">
          <h1 className="text-3xl leading-tight font-medium max-w-md">
            One workspace for the team. One portal for clients.
          </h1>
          <p className="text-[13px] text-white/70 max-w-md">
            Divan CDMS unifies content production, approvals, and reporting for medical
            aesthetics, beauty, real estate, and hospitality clients.
          </p>
          <div className="pt-6 flex gap-2">
            <span className="h-8 w-8 rounded-md" style={{ background: "var(--teal)" }} aria-hidden />
            <span className="h-8 w-8 rounded-md" style={{ background: "var(--magenta)" }} aria-hidden />
            <span className="h-8 w-8 rounded-md border border-white/15" aria-hidden />
          </div>
        </div>
        <p className="text-[11px] text-white/50">
          Divan CDMS · Discipline. Consistency. Creativity.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <DivanLogo variant="dark" size="lg" />
          </div>
          <h2 className="text-xl font-medium mb-1">Sign in</h2>
          <p className="text-[13px] text-text-secondary mb-6">
            Welcome back. Choose how you sign in.
          </p>

          <div className="flex gap-1 p-1 rounded-md bg-secondary mb-6">
            {(["client", "team"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 h-8 rounded-[5px] text-[12px] transition-colors ${
                  tab === t
                    ? "bg-card text-text-primary font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-text-secondary"
                }`}
              >
                {t === "client" ? "Client (magic link)" : "Team (Google SSO)"}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tab === "client") sendMagicLink();
              else signInGoogle();
            }}
            className="space-y-3"
          >
            {tab === "client" ? (
              <>
                <label className="block">
                  <span className="text-[12px] text-text-secondary">Work email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@viviariu.com"
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-[14px] outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-10 rounded-md text-white text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--teal)" }}
                >
                  {busy ? "Sending…" : "Send magic link"}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={busy}
                className="w-full h-10 rounded-md text-white text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--magenta)" }}
              >
                {busy ? "Redirecting…" : "Continue with Google"}
              </button>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-3">
              Demo · jump straight in (preview only)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => enterAsDemo("client")}
                className="h-8 px-3 rounded-md text-[12px] border border-border hover:bg-secondary"
              >
                As Vivi (client)
              </button>
              <button
                onClick={() => enterAsDemo("team")}
                className="h-8 px-3 rounded-md text-[12px] border border-border hover:bg-secondary"
              >
                As Rahil (team)
              </button>
              <button
                onClick={() => enterAsDemo("admin")}
                className="h-8 px-3 rounded-md text-[12px] border border-border hover:bg-secondary"
              >
                As Shahab (admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
