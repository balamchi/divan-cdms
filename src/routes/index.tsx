import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Database,
  CheckSquare,
  Heart,
  Box,
  Layers,
  Mail,
  Check,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_THEME, type Role } from "@/lib/roles";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Divan CDMS — The system behind the promise" },
      {
        name: "description",
        content:
          "CDMS is the operating system behind every Divan engagement. 287 checkpoints. Zero surprises. Predictable excellence.",
      },
      { property: "og:title", content: "Divan CDMS" },
      {
        property: "og:description",
        content:
          "The system behind 287 checkpoints. Built by Divan Group, Toronto.",
      },
    ],
  }),
});

type Lens = "experience" | "picture" | "system";

function LandingPage() {
  const navigate = useNavigate();
  const [lens, setLens] = useState<Lens>("experience");

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
        <h1 className="dl-h1">The System Behind the Promise</h1>
        <p className="dl-sub">
          Every Divan engagement is run through CDMS — the operating system
          we built to manage marketing projects with zero surprises and
          predictable excellence.
        </p>
        <p className="dl-caption" style={{ marginTop: 28 }}>
          COMPREHENSIVE DIGITAL MARKETING SYSTEM · DIVAN GROUP · TORONTO 2026
        </p>
        <a href="#the-system" className="dl-cta">
          See it in action →
        </a>
        <p className="dl-mini">Active across Toronto, Montreal, Dubai, LA</p>
      </section>

      {/* THE THESIS */}
      <section className="dl-section" id="the-system">
        <p className="dl-caption">THE THESIS</p>
        <h2 className="dl-h2">You experience simplicity. We orchestrate complexity.</h2>
        <p className="dl-sub-small">
          Most agencies promise quality. Few can show you the machinery that
          produces it. CDMS is that machinery — visible, accountable, and
          operational across every account we run.
        </p>

        <div className="dl-pills-row">
          <button
            onClick={() => setLens("experience")}
            className={`dl-pill dl-pill-purple ${lens === "experience" ? "is-active" : ""}`}
          >
            ● What you experience
          </button>
          <button
            onClick={() => setLens("picture")}
            className={`dl-pill dl-pill-orange ${lens === "picture" ? "is-active" : ""}`}
          >
            ● The full picture
          </button>
          <button
            onClick={() => setLens("system")}
            className={`dl-pill dl-pill-blue ${lens === "system" ? "is-active" : ""}`}
          >
            ● The system at work
          </button>
        </div>

        <div className="dl-browser">
          <div className="dl-browser-bar">
            <div className="dl-dots">
              <span className="dl-dot" style={{ background: "#ff5f57" }} />
              <span className="dl-dot" style={{ background: "#febc2e" }} />
              <span className="dl-dot" style={{ background: "#28c840" }} />
            </div>
            <div className="dl-url">cdms.divangroup.ca</div>
            <div style={{ width: 60 }} />
          </div>
          <div className="dl-browser-body">
            {lens === "experience" && <ExperiencePanel />}
            {lens === "picture" && <PicturePanel />}
            {lens === "system" && <SystemPanel />}
          </div>
        </div>
      </section>

      {/* FOUR DISCIPLINES */}
      <section className="dl-section">
        <p className="dl-caption">THE OPERATING SYSTEM</p>
        <h2 className="dl-h2">Four disciplines. One platform.</h2>
        <p className="dl-sub-small">
          CDMS is structured around the four operational pillars every modern
          agency engagement actually needs.
        </p>

        <div className="dl-grid-4">
          {[
            {
              cap: "PRODUCTION",
              title: "Content moves through the system, not your inbox.",
              body:
                "Briefs, scripts, captions, edits — every asset has a place, a status, and an owner. Visible to the client, accountable to the team.",
            },
            {
              cap: "APPROVAL",
              title: "Approvals in seconds, not Slack threads.",
              body:
                "Clients see what's ready. They approve or request changes. The system routes feedback to the right person automatically.",
            },
            {
              cap: "REPORTING",
              title: "Reports that arrive before you ask.",
              body:
                "Monthly performance, content delivered, ad spend — generated from real data, formatted for executives, delivered on the 8th.",
            },
            {
              cap: "INTELLIGENCE",
              title: "Claude, embedded where work happens.",
              body:
                "Caption drafts in your brand voice. DM replies that book appointments. Persian-English translation that respects tone. Briefs from voice notes.",
            },
          ].map((c) => (
            <div key={c.cap} className="dl-card">
              <div className="dl-card-cap">{c.cap}</div>
              <div className="dl-card-title">{c.title}</div>
              <div className="dl-card-desc">{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POWERED BY */}
      <section className="dl-section">
        <p className="dl-caption">POWERED BY</p>
        <h2 className="dl-h2">Built on the best of 2026.</h2>
        <p className="dl-sub-small">
          Not a no-code wrapper. A real system, on real infrastructure, in
          production today.
        </p>

        <div className="dl-logo-strip">
          {[
            { name: "Anthropic Claude", icon: <Sparkles size={16} /> },
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
          Anthropic Claude · Supabase · ClickUp · Lovable · Tabler · TanStack
        </p>
      </section>

      {/* STAT STRIP */}
      <section className="dl-section dl-stats">
        <div className="dl-stat">
          <div className="dl-stat-num">287</div>
          <div className="dl-stat-label">ACTIVE CHECKPOINTS</div>
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

      {/* FINAL */}
      <section className="dl-section dl-final">
        <p className="dl-caption">WHY THIS MATTERS</p>
        <h2 className="dl-h1-grad" style={{ fontSize: "clamp(36px, 6vw, 56px)" }}>
          Most agencies promise. We operate.
        </h2>
        <p className="dl-sub">
          Anyone can post Instagram tips and call it strategy. We built the
          system that runs marketing accounts the way they should be run in
          2026 — measured, automated where it matters, human where it counts.
          CDMS is the proof.
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
          <span>divangroup.ca · The system behind every engagement</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Tab panels ---------- */

function ExperiencePanel() {
  const rows = [
    {
      icon: <Mail size={16} />,
      tint: "#6ea8ff",
      bg: "rgba(110,168,255,0.12)",
      title: "Brief delivered",
      meta: "Aurora Clinic · May content plan",
      time: "2 days ago",
    },
    {
      icon: <Check size={16} />,
      tint: "#4ade80",
      bg: "rgba(74,222,128,0.12)",
      title: "Reels approved",
      meta: "Northside Realty · Spring campaign",
      time: "Today",
    },
    {
      icon: <Calendar size={16} />,
      tint: "#c8a8ff",
      bg: "rgba(200,168,255,0.12)",
      title: "Review scheduled",
      meta: "Casa Bella · Brand refresh",
      time: "Tomorrow 2 PM",
    },
  ];
  return (
    <div className="dl-mock">
      <div className="dl-mock-eyebrow">CLIENT SIDE</div>
      <div className="dl-mock-title">Simple updates.</div>
      <p className="dl-mock-desc">
        You get the brief, the approvals, the calendar. Nothing else. The
        complexity stays where it belongs — behind the system.
      </p>
      <div className="dl-mock-rows">
        {rows.map((r) => (
          <div key={r.title} className="dl-mock-row">
            <span
              className="dl-mock-row-icon"
              style={{ color: r.tint, background: r.bg }}
            >
              {r.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div className="dl-mock-row-title">{r.title}</div>
              <div className="dl-mock-row-meta">{r.meta}</div>
            </div>
            <span className="dl-mock-row-time">{r.time}</span>
          </div>
        ))}
      </div>
      <div className="dl-mock-footer">Clean. Predictable. On time.</div>
    </div>
  );
}

function PicturePanel() {
  return (
    <div className="dl-mock">
      <div className="dl-mock-eyebrow">BOTH SIDES</div>
      <div className="dl-mock-title">Both sides, one system.</div>
      <p className="dl-mock-desc">
        What you see and what we run — connected in real time. Updates on your
        side reflect actual work happening across our team.
      </p>
      <div className="dl-mini-grid">
        <div className="dl-mini-card">
          <div className="dl-mini-card-title">Your view</div>
          <ul className="dl-mini-list">
            <li>1 brief approved</li>
            <li>3 deliverables pending review</li>
            <li>Next checkpoint: Tuesday 2 PM</li>
          </ul>
        </div>
        <div className="dl-mini-card">
          <div className="dl-mini-card-title">Our work</div>
          <ul className="dl-mini-list">
            <li>287 active checkpoints</li>
            <li>8 team members coordinating</li>
            <li>Live ClickUp sync</li>
          </ul>
        </div>
      </div>
      <div className="dl-mock-footer">One source of truth. Two perspectives.</div>
    </div>
  );
}

function SystemPanel() {
  const stats = [
    { n: "24", l: "Active now", c: "#ffa566" },
    { n: "156", l: "Completed this month", c: "#4ade80" },
    { n: "8", l: "Team active", c: "#8cc4ff" },
  ];
  return (
    <div className="dl-mock">
      <div className="dl-mock-eyebrow">THE MACHINERY</div>
      <div className="dl-mock-title">287 active checkpoints.</div>
      <p className="dl-mock-desc">
        This is the machinery. Every task, every brief, every approval —
        tracked, assigned, time-stamped, accountable.
      </p>
      <div className="dl-sys-stats">
        {stats.map((s) => (
          <div key={s.l} className="dl-sys-stat">
            <div className="dl-sys-num" style={{ color: s.c }}>{s.n}</div>
            <div className="dl-sys-label">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="dl-sys-pill">
        <span className="dl-sys-dot" /> Managed in ClickUp · Live sync
      </div>
      <div className="dl-sys-footer">
        <div>Every simple update you receive</div>
        <div className="dl-sys-footer-grad">Represents hours of coordination</div>
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

.dl-wordmark { font-weight: 500; letter-spacing: 0.1em; color: #fff; font-size: 15px; }

.dl-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; background: transparent; backdrop-filter: blur(8px);
}
.dl-nav-signin {
  color: #fff; opacity: 0.7; background: transparent; border: none; cursor: pointer;
  font-size: 14px; font-family: inherit; transition: opacity 0.15s ease; text-decoration: none;
}
.dl-nav-signin:hover { opacity: 1; }

.dl-hero {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 24px; text-align: center;
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
  font-size: clamp(56px, 9vw, 96px);
  line-height: 1.05; font-weight: 600; letter-spacing: -0.03em;
  background: var(--gradient-headline);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  max-width: 1000px;
}

.dl-h2 {
  margin: 12px auto 16px; max-width: 900px;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 500; letter-spacing: -0.02em; color: #fff; text-align: center;
}

.dl-sub {
  margin: 24px auto 0; max-width: 640px;
  color: var(--text-landing-secondary);
  font-size: 20px; line-height: 1.5; font-weight: 400;
}
.dl-sub-small {
  margin: 0 auto 48px; max-width: 680px;
  color: var(--text-landing-secondary);
  font-size: 18px; text-align: center; line-height: 1.6;
}

.dl-cta {
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: 32px;
  background: #fff; color: #000;
  padding: 14px 28px; border-radius: 100px;
  font-weight: 500; font-size: 16px;
  border: none; cursor: pointer; font-family: inherit;
  text-decoration: none; transition: transform 0.15s ease;
}
.dl-cta:hover { transform: scale(1.02); }
.dl-cta-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); }

.dl-mini { margin-top: 16px; color: var(--text-landing-muted); font-size: 13px; }

.dl-section { padding: 120px 24px; max-width: 1200px; margin: 0 auto; text-align: center; }

.dl-caption {
  font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
  margin: 0 0 16px;
  background: var(--gradient-headline);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  display: inline-block;
}

.dl-pills-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }

.dl-browser {
  background: var(--bg-landing-card);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 24px; overflow: hidden; text-align: left;
  max-width: 1100px; margin: 0 auto;
}
.dl-browser-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-bottom: 1px solid var(--bg-landing-card-border);
}
.dl-dots { display: flex; gap: 6px; width: 60px; }
.dl-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.dl-url {
  flex: 1; text-align: center; font-size: 12px; color: var(--text-landing-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dl-browser-body { padding: 32px; background: #050505; min-height: 420px; }

.dl-mock { color: #fff; font-size: 14px; display: flex; flex-direction: column; gap: 16px; }
.dl-mock-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-landing-muted); font-weight: 500; }
.dl-mock-title { font-size: 28px; font-weight: 600; letter-spacing: -0.015em; color: #fff; }
.dl-mock-desc { color: var(--text-landing-secondary); font-size: 15px; line-height: 1.6; margin: 0; max-width: 640px; }

.dl-mock-rows { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.dl-mock-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--bg-landing-card-border);
}
.dl-mock-row-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
}
.dl-mock-row-title { font-size: 15px; font-weight: 500; color: #fff; }
.dl-mock-row-meta { font-size: 13px; color: var(--text-landing-secondary); margin-top: 2px; }
.dl-mock-row-time { font-size: 12px; color: var(--text-landing-muted); }
.dl-mock-footer {
  margin-top: 8px; padding-top: 16px;
  border-top: 1px solid var(--bg-landing-card-border);
  color: var(--text-landing-muted); font-size: 13px;
}

.dl-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
.dl-mini-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 14px; padding: 20px;
}
.dl-mini-card-title { font-size: 13px; color: var(--text-landing-muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; }
.dl-mini-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; color: #fff; font-size: 15px; }

.dl-sys-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 8px; }
.dl-sys-stat {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 14px; padding: 24px; text-align: center;
}
.dl-sys-num { font-size: 40px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; }
.dl-sys-label { font-size: 12px; color: var(--text-landing-muted); margin-top: 8px; }
.dl-sys-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 100px;
  background: rgba(74,222,128,0.1); color: #4ade80;
  font-size: 12px; align-self: flex-start;
}
.dl-sys-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; }
.dl-sys-footer { margin-top: 8px; color: var(--text-landing-secondary); font-size: 15px; line-height: 1.5; }
.dl-sys-footer-grad {
  background: var(--gradient-headline);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  font-weight: 500;
}

.dl-grid-4 {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-top: 16px; text-align: left;
}
.dl-card {
  background: var(--bg-landing-card);
  border: 1px solid var(--bg-landing-card-border);
  border-radius: 16px; padding: 32px;
  display: flex; flex-direction: column; gap: 14px;
}
.dl-card-cap {
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 500;
  background: var(--gradient-headline);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.dl-card-title { font-size: 22px; font-weight: 500; color: #fff; letter-spacing: -0.01em; line-height: 1.25; }
.dl-card-desc { font-size: 14px; color: var(--text-landing-secondary); line-height: 1.6; }

.dl-logo-strip {
  display: flex; gap: 48px; justify-content: center; align-items: center; flex-wrap: wrap;
  margin: 16px 0 24px;
}
.dl-logo {
  display: inline-flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.6); font-size: 16px; font-weight: 500;
  transition: color 0.15s ease;
}
.dl-logo:hover { color: #fff; }
.dl-footnote { color: var(--text-landing-muted); font-size: 12px; }

.dl-stats { display: flex; justify-content: space-around; align-items: center; gap: 32px; flex-wrap: wrap; }
.dl-stat { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.dl-stat-num {
  font-size: 64px; font-weight: 600; letter-spacing: -0.02em;
  background: var(--gradient-stat);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1;
}
.dl-stat-label { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-landing-muted); }

.dl-final { display: flex; flex-direction: column; align-items: center; }
.dl-cta-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }

.dl-footer { padding: 60px 24px 40px; border-top: 1px solid var(--bg-landing-card-border); max-width: 1200px; margin: 0 auto; }
.dl-footer-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 32px; }
.dl-tag { color: var(--text-landing-secondary); font-size: 13px; }
.dl-footer-bottom { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--text-landing-muted); font-size: 12px; }

@media (max-width: 1024px) {
  .dl-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .dl-section { padding: 80px 20px; }
  .dl-pills-row { flex-direction: column; align-items: stretch; }
  .dl-grid-4 { grid-template-columns: 1fr; }
  .dl-stats { flex-direction: column; }
  .dl-mini-grid { grid-template-columns: 1fr; }
  .dl-sys-stats { grid-template-columns: 1fr; }
  .dl-browser-body { padding: 20px; min-height: 0; }
  .dl-url { display: none; }
  .dl-footer-top, .dl-footer-bottom { flex-direction: column; text-align: center; }
}
`;
