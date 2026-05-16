import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Languages,
  FileText,
  Heart,
  Database,
  CheckSquare,
  Layers,
  Box,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_THEME, type Role } from "@/lib/roles";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Divan CDMS — The agency platform we built for ourselves" },
      {
        name: "description",
        content:
          "AI-powered content production, approval, and reporting. The internal platform of Divan Group. Made in Toronto, 2026.",
      },
      { property: "og:title", content: "Divan CDMS" },
      {
        property: "og:description",
        content:
          "The agency platform we built for ourselves. AI-powered content production, approval, and reporting.",
      },
    ],
  }),
});

type Lens = "client" | "team" | "admin";

function LandingPage() {
  const navigate = useNavigate();
  const [lens, setLens] = useState<Lens>("client");

  const goSignIn = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user.email;
    if (!email) {
      navigate({ to: "/login" });
      return;
    }
    const { data: u } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .maybeSingle();
    const role = (u?.role as Role | undefined) ?? "client";
    navigate({ to: ROLE_THEME[role].route });
  };

  return (
    <div className="divan-landing">
      <style>{LANDING_CSS}</style>

      {/* NAV */}
      <nav className="dl-nav">
        <div className="dl-wordmark">DIVAN</div>
        <button onClick={goSignIn} className="dl-nav-signin">
          Sign in →
        </button>
      </nav>

      {/* HERO */}
      <section className="dl-hero">
        <span className="dl-pill dl-pill-purple">● INTERNAL TOOL · DIVAN GROUP</span>
        <h1 className="dl-h1">Divan CDMS</h1>
        <p className="dl-sub">
          The agency platform we built for ourselves. AI-powered content
          production, approval, and reporting. Made in Toronto, 2026.
        </p>
        <button onClick={goSignIn} className="dl-cta">
          Sign in →
        </button>
        <p className="dl-mini">Private beta · By invitation only</p>
      </section>

      {/* THREE LENSES */}
      <section className="dl-section">
        <p className="dl-caption">ONE PLATFORM</p>
        <h2 className="dl-h2">Three lenses.</h2>
        <p className="dl-sub-small">
          The same data, designed differently for who's looking at it.
        </p>

        <div className="dl-pills-row">
          <button
            onClick={() => setLens("client")}
            className={`dl-pill dl-pill-purple ${lens === "client" ? "is-active" : ""}`}
          >
            ● Client View
          </button>
          <button
            onClick={() => setLens("team")}
            className={`dl-pill dl-pill-orange ${lens === "team" ? "is-active" : ""}`}
          >
            ● Team View
          </button>
          <button
            onClick={() => setLens("admin")}
            className={`dl-pill dl-pill-blue ${lens === "admin" ? "is-active" : ""}`}
          >
            ● Admin View
          </button>
        </div>

        <div className="dl-browser">
          <div className="dl-browser-bar">
            <div className="dl-dots">
              <span className="dl-dot" style={{ background: "#ff5f57" }} />
              <span className="dl-dot" style={{ background: "#febc2e" }} />
              <span className="dl-dot" style={{ background: "#28c840" }} />
            </div>
            <div className="dl-url">cdms.divangroup.ca/{lens === "client" ? "portal" : lens === "team" ? "workspace" : "console"}</div>
            <div style={{ width: 60 }} />
          </div>
          <div className="dl-browser-body">
            <MockDashboard lens={lens} />
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="dl-section">
        <p className="dl-caption">INTELLIGENCE</p>
        <h2 className="dl-h2">AI tools, built in.</h2>
        <p className="dl-sub-small">
          Caption generation, DM replies, translation, and brief writing —
          powered by Claude, running where your team already works.
        </p>

        <div className="dl-grid-4">
          {[
            {
              icon: <Sparkles size={24} />,
              title: "Caption Studio",
              desc: "EN + FA Instagram captions in your brand voice.",
            },
            {
              icon: <MessageSquare size={24} />,
              title: "DM Reply",
              desc: "Turn inbox chaos into booked appointments.",
            },
            {
              icon: <Languages size={24} />,
              title: "Translator",
              desc: "Persian ↔ English, tone-aware, instant.",
            },
            {
              icon: <FileText size={24} />,
              title: "Brief Writer",
              desc: "Turn a voice note into a production brief.",
            },
          ].map((c) => (
            <div key={c.title} className="dl-card">
              <div className="dl-card-icon">{c.icon}</div>
              <div className="dl-card-title">{c.title}</div>
              <div className="dl-card-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POWERED BY */}
      <section className="dl-section">
        <p className="dl-caption">POWERED BY</p>
        <h2 className="dl-h2">Built on the best of 2026.</h2>

        <div className="dl-logo-strip">
          {[
            { name: "Claude", icon: <Sparkles size={16} /> },
            { name: "Supabase", icon: <Database size={16} /> },
            { name: "ClickUp", icon: <CheckSquare size={16} /> },
            { name: "Lovable", icon: <Heart size={16} /> },
            { name: "Tabler Icons", icon: <Box size={16} /> },
            { name: "TanStack", icon: <Layers size={16} /> },
          ].map((l) => (
            <div key={l.name} className="dl-logo">
              {l.icon}
              <span>{l.name}</span>
            </div>
          ))}
        </div>
        <p className="dl-footnote">
          Anthropic Claude · Supabase · ClickUp · Lovable · Tabler Icons · TanStack
        </p>
      </section>

      {/* STAT STRIP */}
      <section className="dl-section dl-stats">
        <div className="dl-stat">
          <div className="dl-stat-num">AI-Powered</div>
          <div className="dl-stat-label">EVERY WORKFLOW</div>
        </div>
        <div className="dl-stat">
          <div className="dl-stat-num">Real-Time</div>
          <div className="dl-stat-label">CLICKUP SYNC</div>
        </div>
        <div className="dl-stat">
          <div className="dl-stat-num">0</div>
          <div className="dl-stat-label">MISSED DEADLINES</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="dl-section dl-final">
        <h2 className="dl-h1-grad">Want to see how we work?</h2>
        <p className="dl-sub">
          If you're considering hiring Divan Group, ask us for a CDMS
          walkthrough. You'll see exactly how your account would be managed
          before signing anything.
        </p>
        <div className="dl-cta-row">
          <a
            href="https://divangroup.ca"
            target="_blank"
            rel="noreferrer"
            className="dl-cta"
          >
            Visit divangroup.ca
          </a>
          <Link to="/login" className="dl-cta dl-cta-outline">
            Sign in →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="dl-footer">
        <div className="dl-footer-top">
          <div className="dl-wordmark">DIVAN</div>
          <div className="dl-tag">Discipline. Consistency. Creativity.</div>
          <Link to="/login" className="dl-nav-signin">
            Sign in →
          </Link>
        </div>
        <div className="dl-footer-bottom">
          <span>© 2026 Divan Group · Toronto, Canada</span>
          <span>divangroup.ca · Built with Claude, Lovable & Supabase</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Mock dashboard panels ---------- */

const FAKE_CLIENTS = [
  { name: "Aurora Clinic", done: 14, total: 20 },
  { name: "Northside Realty", done: 11, total: 16 },
  { name: "Casa Bella", done: 9, total: 12 },
  { name: "Lumière Beauty", done: 16, total: 18 },
];

function MockDashboard({ lens }: { lens: Lens }) {
  return (
    <div className="dl-mock">
      {lens === "client" && <ClientMock />}
      {lens === "team" && <TeamMock />}
      {lens === "admin" && <AdminMock />}
    </div>
  );
}

function ClientMock() {
  const tasks = [
    { title: "May Content Plan", kind: "Publish Plan", date: "May 14" },
    { title: "Brand Refresh Reels", kind: "Story Plan", date: "May 16" },
    { title: "Spring Campaign Stories", kind: "Story Plan", date: "May 18" },
  ];
  return (
    <div className="dl-mock-page">
      <div className="dl-mock-eyebrow">CLIENT PORTAL</div>
      <div className="dl-mock-title">Aurora Clinic</div>
      <div className="dl-mock-row-head">
        <span>Needs your approval</span>
        <span>{tasks.length} items</span>
      </div>
      {tasks.map((t) => (
        <div key={t.title} className="dl-mock-row">
          <FileText size={16} style={{ color: "#86868b" }} />
          <div style={{ flex: 1 }}>
            <div className="dl-mock-row-title">{t.title}</div>
            <div className="dl-mock-row-meta">{t.kind} · Publishes {t.date}</div>
          </div>
          <span className="dl-mock-btn dl-mock-btn-primary">Approve</span>
          <span className="dl-mock-btn">Request changes</span>
        </div>
      ))}
    </div>
  );
}

function TeamMock() {
  return (
    <div className="dl-mock-page dl-mock-team">
      <aside className="dl-mock-side">
        <div className="dl-mock-eyebrow">SPACES</div>
        {FAKE_CLIENTS.map((c) => (
          <div key={c.name} className="dl-mock-side-row">
            <div>
              <div className="dl-mock-row-title">{c.name}</div>
              <div className="dl-mock-row-meta">{c.done}/{c.total} done</div>
            </div>
            <div className="dl-mock-bar">
              <div
                className="dl-mock-bar-fill"
                style={{ width: `${(c.done / c.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </aside>
      <main className="dl-mock-main">
        <div className="dl-mock-eyebrow">MY DAY</div>
        <div className="dl-mock-title">Good morning, Sarah K.</div>
        <div className="dl-mock-row-head">
          <span>In progress</span>
          <span>3 tasks</span>
        </div>
        {[
          { t: "Edit · Aurora Clinic spring reel", m: "Sarah K. · 01:24:38" },
          { t: "Carousel · Casa Bella interior tour", m: "James L." },
          { t: "Brief · Northside Realty listing video", m: "Mira N." },
        ].map((r) => (
          <div key={r.t} className="dl-mock-row">
            <FileText size={16} style={{ color: "#86868b" }} />
            <div style={{ flex: 1 }}>
              <div className="dl-mock-row-title">{r.t}</div>
              <div className="dl-mock-row-meta">{r.m}</div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function AdminMock() {
  const metrics = [
    { label: "TASKS SYNCED", value: "1,247" },
    { label: "AI GENERATIONS", value: "89" },
    { label: "ACTIVE CLIENTS", value: "4" },
    { label: "APPROVALS PENDING", value: "12" },
  ];
  return (
    <div className="dl-mock-page">
      <div className="dl-mock-eyebrow">FOUNDER CONSOLE</div>
      <div className="dl-mock-title">This month</div>
      <div className="dl-mock-metrics">
        {metrics.map((m) => (
          <div key={m.label} className="dl-mock-metric">
            <div className="dl-mock-metric-label">{m.label}</div>
            <div className="dl-mock-metric-value">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scoped CSS ---------- */

const LANDING_CSS = `
.divan-landing {
  --bg-landing: #000000;
  --bg-landing-card: #0a0a0a;
  --bg-landing-card-border: rgba(255,255,255,0.06);
  --text-landing-primary: #ffffff;
  --text-landing-secondary: rgba(255,255,255,0.65);
  --text-landing-muted: rgba(255,255,255,0.4);
  --gradient-headline: linear-gradient(135deg, #ff4d8d 0%, #ff7e3d 50%, #ffb84d 100%);
  --gradient-stat: linear-gradient(135deg, #ff4d8d 0%, #ff7e3d 100%);
  --accent-pill-purple: rgba(155, 89, 232, 0.15);
  --accent-pill-purple-text: #c8a8ff;
  --accent-pill-orange: rgba(255, 126, 61, 0.15);
  --accent-pill-orange-text: #ffa566;
  --accent-pill-blue: rgba(100, 180, 255, 0.15);
  --accent-pill-blue-text: #8cc4ff;

  background: var(--bg-landing);
  color: var(--text-landing-primary);
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.18), transparent 50%),
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.12), transparent 50%),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.15), transparent 50%),
    radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,0.1), transparent 50%),
    radial-gradient(1px 1px at 10% 70%, rgba(255,255,255,0.12), transparent 50%);
  background-attachment: fixed;
}

.divan-landing * { box-sizing: border-box; }

.dl-wordmark {
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #fff;
  font-size: 15px;
}

.dl-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  background: transparent;
  backdrop-filter: blur(8px);
}

.dl-nav-signin {
  color: #fff; opacity: 0.7;
  background: transparent; border: none; cursor: pointer;
  font-size: 14px; font-family: inherit;
  transition: opacity 0.15s ease;
}
.dl-nav-signin:hover { opacity: 1; }

.dl-hero {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.dl-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 100px;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase;
  background: var(--accent-pill-purple);
  color: var(--accent-pill-purple-text);
  border: none; cursor: default; font-family: inherit;
}
.dl-pill-purple { background: var(--accent-pill-purple); color: var(--accent-pill-purple-text); }
.dl-pill-orange { background: var(--accent-pill-orange); color: var(--accent-pill-orange-text); }
.dl-pill-blue   { background: var(--accent-pill-blue);   color: var(--accent-pill-blue-text); }

.dl-pills-row .dl-pill { cursor: pointer; transition: transform 0.15s ease, opacity 0.15s ease; opacity: 0.7; }
.dl-pills-row .dl-pill:hover { opacity: 1; }
.dl-pills-row .dl-pill.is-active { opacity: 1; transform: scale(1.04); }

.dl-h1, .dl-h1-grad {
  margin: 24px 0 0;
  font-size: 96px;
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.03em;
  background: var(--gradient-headline);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dl-h2 {
  margin: 12px 0 16px;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #fff;
  text-align: center;
}

.dl-sub {
  margin: 24px auto 0;
  max-width: 600px;
  color: var(--text-landing-secondary);
  font-size: 20px;
  line-height: 1.5;
  font-weight: 400;
}
.dl-sub-small {
  margin: 0 auto 48px;
  max-width: 500px;
  color: var(--text-landing-secondary);
  font-size: 18px;
  text-align: center;
  line-height: 1.5;
}

.dl-cta {
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: 40px;
  background: #fff; color: #000;
  padding: 14px 28px; border-radius: 100px;
  font-weight: 500; font-size: 16px;
  border: none; cursor: pointer; font-family: inherit;
  text-decoration: none;
  transition: transform 0.15s ease;
}
.dl-cta:hover { transform: scale(1.02); }

.dl-cta-outline {
  background: transparent; color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}

.dl-mini {
  margin-top: 16px;
  color: var(--text-landing-muted);
  font-size: 13px;
}

.dl-section {
  padding: 120px 24px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.dl-caption {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  margin: 0 0 16px;
  background: var(--gradient-headline);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.dl-pills-row {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
  margin-bottom: 32px;
}

.dl-browser {
  background: var(--bg-landing-card);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 24px;
  overflow: hidden;
  text-align: left;
  max-width: 1100px; margin: 0 auto;
}
.dl-browser-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--bg-landing-card-border);
}
.dl-dots { display: flex; gap: 6px; width: 60px; }
.dl-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.dl-url {
  flex: 1; text-align: center;
  font-size: 12px; color: var(--text-landing-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dl-browser-body {
  padding: 32px;
  background: #fafafa;
  min-height: 420px;
  transition: opacity 0.2s ease;
}

.dl-mock {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  color: #1d1d1f;
  font-size: 14px;
}
.dl-mock-page { display: flex; flex-direction: column; gap: 12px; }
.dl-mock-eyebrow {
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  color: #86868b; font-weight: 500;
}
.dl-mock-title {
  font-size: 28px; font-weight: 600; letter-spacing: -0.015em;
  color: #1d1d1f; margin-bottom: 8px;
}
.dl-mock-row-head {
  display: flex; justify-content: space-between;
  font-size: 12px; color: #86868b; padding-bottom: 8px;
  border-bottom: 1px solid #e5e5ea;
}
.dl-mock-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid #f2f2f4;
}
.dl-mock-row-title { font-size: 15px; font-weight: 500; color: #1d1d1f; }
.dl-mock-row-meta { font-size: 12px; color: #86868b; margin-top: 2px; }
.dl-mock-btn {
  font-size: 12px; padding: 6px 12px; border-radius: 6px;
  border: 1px solid #d2d2d7; color: #1d1d1f; background: #fff;
}
.dl-mock-btn-primary { background: #1d1d1f; color: #fff; border-color: #1d1d1f; }

.dl-mock-team { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
.dl-mock-side { display: flex; flex-direction: column; gap: 12px; }
.dl-mock-side-row {
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 0; border-bottom: 1px solid #f2f2f4;
}
.dl-mock-bar { width: 100%; height: 4px; background: #f2f2f4; border-radius: 999px; overflow: hidden; }
.dl-mock-bar-fill { height: 100%; background: #1d1d1f; }
.dl-mock-main { display: flex; flex-direction: column; gap: 8px; }

.dl-mock-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 8px;
}
.dl-mock-metric {
  background: #f5f5f7; border-radius: 10px; padding: 16px;
  display: flex; flex-direction: column; gap: 4px;
}
.dl-mock-metric-label { font-size: 10px; letter-spacing: 0.15em; color: #86868b; }
.dl-mock-metric-value { font-size: 28px; font-weight: 600; color: #1d1d1f; }

.dl-grid-4 {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-top: 16px; text-align: left;
}
.dl-card {
  background: var(--bg-landing-card);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 16px;
  padding: 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.dl-card-icon { color: #fff; opacity: 0.9; }
.dl-card-title { font-size: 16px; font-weight: 500; color: #fff; }
.dl-card-desc { font-size: 14px; color: var(--text-landing-secondary); line-height: 1.5; }

.dl-logo-strip {
  display: flex; gap: 48px; justify-content: center; align-items: center; flex-wrap: wrap;
  margin: 16px 0 24px;
}
.dl-logo {
  display: inline-flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.6);
  font-size: 16px; font-weight: 500;
  transition: color 0.15s ease;
}
.dl-logo:hover { color: #fff; }
.dl-footnote {
  color: var(--text-landing-muted); font-size: 12px;
}

.dl-stats {
  display: flex; justify-content: space-around; align-items: center; gap: 32px; flex-wrap: wrap;
}
.dl-stat { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.dl-stat-num {
  font-size: 64px; font-weight: 600; letter-spacing: -0.02em;
  background: var(--gradient-stat);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1;
}
.dl-stat-label {
  font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text-landing-muted);
}

.dl-final { display: flex; flex-direction: column; align-items: center; }
.dl-cta-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

.dl-footer {
  padding: 60px 24px 40px;
  border-top: 1px solid var(--bg-landing-card-border);
  max-width: 1200px; margin: 0 auto;
}
.dl-footer-top {
  display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
  margin-bottom: 32px;
}
.dl-tag { color: var(--text-landing-secondary); font-size: 13px; }
.dl-footer-bottom {
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  color: var(--text-landing-muted); font-size: 12px;
}

@media (max-width: 768px) {
  .dl-h1, .dl-h1-grad { font-size: 56px; }
  .dl-h2 { font-size: 32px; }
  .dl-sub { font-size: 17px; }
  .dl-section { padding: 80px 20px; }
  .dl-pills-row { flex-direction: column; align-items: stretch; }
  .dl-grid-4 { grid-template-columns: 1fr; }
  .dl-stats { flex-direction: column; }
  .dl-mock-team { grid-template-columns: 1fr; }
  .dl-mock-metrics { grid-template-columns: repeat(2, 1fr); }
  .dl-browser-body { padding: 16px; min-height: 0; }
  .dl-url { display: none; }
  .dl-footer-top, .dl-footer-bottom { flex-direction: column; text-align: center; }
}
`;
