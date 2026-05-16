import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    if (result.redirected) return;
  };

  const inputBase =
    "w-full h-11 px-4 rounded-[10px] border text-[14px] outline-none transition-colors bg-white/[0.04] border-white/10 text-white placeholder:text-white/40 focus:border-white/30";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{ background: "#000000" }}
    >
      {/* Card */}
      <div
        className="w-full mx-4 p-8 md:p-12"
        style={{
          maxWidth: 440,
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20,
        }}
      >
        {/* Wordmark */}
        <div className="text-center mb-8">
          <span
            className="text-white font-medium"
            style={{ fontSize: 18, letterSpacing: "0.1em" }}
          >
            DIVAN
          </span>
        </div>

        {/* Gradient headline */}
        <h1
          className="text-center font-semibold mb-3"
          style={{
            fontSize: 28,
            lineHeight: 1.2,
            background: "linear-gradient(135deg, #ff4d8d 0%, #ff7e3d 50%, #ffb84d 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome back.
        </h1>

        {/* Subtitle */}
        <p
          className="text-center mb-8"
          style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.65)" }}
        >
          Sign in to your CDMS workspace.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[10px] mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["client", "team"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 h-9 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                color: tab === t ? "#000000" : "rgba(255,255,255,0.65)",
                background: tab === t ? "#ffffff" : "transparent",
              }}
            >
              {t === "client" ? "Client (magic link)" : "Team (Google SSO)"}
            </button>
          ))}
        </div>

        {/* Form */}
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
                <span className="text-[12px] block mb-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Work email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@viviariu.com"
                  className={inputBase}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-full font-medium text-[14px] transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                {busy ? "Sending…" : "Send magic link"}
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full font-medium text-[14px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 border"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.62z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.34C2.43 15.95 5.48 18 9 18z" fill="#34A853" />
                <path d="M3.95 10.7c-.18-.54-.29-1.12-.29-1.7 0-.59.1-1.16.29-1.7V5.07H.95C.34 6.17 0 7.43 0 9s.34 2.83.95 3.93l3-2.34z" fill="#FBBC05" />
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.45.9 11.42 0 9 0 5.48 0 2.43 2.05.95 5.07l3 2.34C4.66 5.17 6.65 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              {busy ? "Redirecting…" : "Continue with Google"}
            </button>
          )}
        </form>

        {/* Divider */}
        {tab === "client" && (
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        )}

        {/* Alternate sign-in method */}
        {tab === "client" ? (
          <button
            type="button"
            disabled={busy}
            onClick={signInGoogle}
            className="w-full h-11 rounded-full font-medium text-[14px] flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 border"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#ffffff",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.62z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.34C2.43 15.95 5.48 18 9 18z" fill="#34A853" />
              <path d="M3.95 10.7c-.18-.54-.29-1.12-.29-1.7 0-.59.1-1.16.29-1.7V5.07H.95C.34 6.17 0 7.43 0 9s.34 2.83.95 3.93l3-2.34z" fill="#FBBC05" />
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.45.9 11.42 0 9 0 5.48 0 2.43 2.05.95 5.07l3 2.34C4.66 5.17 6.65 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={sendMagicLink}
            className="w-full h-11 rounded-full font-medium text-[14px] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Send magic link
          </button>
        )}

        {/* Demo buttons */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p
            className="text-[11px] uppercase tracking-wider mb-3 text-center"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Demo · jump straight in (preview only)
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => enterAsDemo("client")}
              className="h-8 px-3 rounded-full text-[12px] transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
            >
              As Vivi (client)
            </button>
            <button
              onClick={() => enterAsDemo("team")}
              className="h-8 px-3 rounded-full text-[12px] transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
            >
              As Rahil (team)
            </button>
            <button
              onClick={() => enterAsDemo("admin")}
              className="h-8 px-3 rounded-full text-[12px] transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
            >
              As Shahab (admin)
            </button>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <a
            href="https://divangroup.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white/60"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to divangroup.ca
          </a>
        </div>
      </div>

      {/* Bottom footer */}
      <div
        className="absolute bottom-6 left-0 right-0 text-center"
        style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}
      >
        Divan CDMS · Private workspace · Toronto 2026
      </div>
    </div>
  );
}
