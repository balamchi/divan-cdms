import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, AlertCircle, RefreshCw, Link2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  syncClickUpList,
  getClickUpConnection,
  getClickUpAuthorizeUrl,
} from "@/lib/clickup.functions";
import { TopHeader } from "@/components/divan/TopHeader";
import { MetricCard } from "@/components/divan/MetricCard";
import { AppFooter } from "@/components/divan/AppFooter";
import { COMPANIES } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/console")({
  component: AdminConsole,
  head: () => ({
    meta: [
      { title: "Founder console · Divan CDMS" },
      {
        name: "description",
        content:
          "Retainer health, lead pipeline, and AI command bar for Divan Group leadership.",
      },
    ],
  }),
});

const LEAD_STAGES = [
  { name: "New", count: 4, latest: "Lumière Skin Studio" },
  { name: "Discovery", count: 3, latest: "Aria Luxe Realty" },
  { name: "Proposal sent", count: 2, latest: "Mahdi Hospitality Group" },
];

function AdminConsole() {
  const activeRetainers = COMPANIES.filter(() => true).length;
  const [syncing, setSyncing] = useState(false);
  const sync = useServerFn(syncClickUpList);
  const fetchConn = useServerFn(getClickUpConnection);
  const fetchAuthorizeUrl = useServerFn(getClickUpAuthorizeUrl);
  const { session } = useAuth();
  const [cuConnected, setCuConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setCuConnected(false);
      return;
    }
    fetchConn({}).then((r) => setCuConnected(r.connected)).catch(() => setCuConnected(false));
  }, [session, fetchConn]);

  const connectClickUp = async () => {
    try {
      const redirectUri = `${window.location.origin}/clickup/callback`;
      const { url } = await fetchAuthorizeUrl({ data: { redirect_uri: redirectUri } });
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start ClickUp connection");
    }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const r = await sync({ data: {} });
      toast.success(`Synced ${r.synced} task${r.synced === 1 ? "" : "s"} from Vivia Riu`);
    } catch (e: any) {
      toast.error(e?.message ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <TopHeader role="admin" userName="Shahab" initials="SB" unread={5} />

      {/* AI command bar */}
      <div
        className="sticky top-14 z-30 h-12 px-5 md:px-10 flex items-center gap-3 border-b border-white/10"
        style={{ background: "var(--charcoal)", color: "white" }}
      >
        <Sparkles className="h-4 w-4" style={{ color: "var(--magenta)" }} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Ask CDMS · draft Par May report, summarize Vivia week, find leads I haven't replied to..."
          className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/40"
        />
        <kbd className="hidden md:inline-flex items-center h-6 px-1.5 rounded bg-white/10 text-[10px] text-white/70">
          ⌘K
        </kbd>
      </div>

      <main className="flex-1 px-5 md:px-10 py-8 max-w-[1280px] w-full">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <MetricCard
            label="Monthly recurring"
            value="$18,400"
            delta="+$2.1k vs April"
            deltaTone="success"
          />
          <MetricCard
            label="AR outstanding"
            value="$4,250"
            delta="2 invoices > 30 days"
            deltaTone="warning"
            accentColor="var(--warning)"
          />
          <MetricCard label="Active retainers" value={activeRetainers} />
          <MetricCard
            label="Team utilization"
            value="78%"
            delta="target 75%"
            deltaTone="neutral"
          />
        </div>

        {/* Fallback Connect ClickUp button (always visible to admin) */}
        <div className="flex justify-end mb-4">
          {cuConnected ? (
            <span
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-[12px] font-medium border"
              style={{ borderColor: "var(--success)", color: "var(--success)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--success)" }}
                aria-hidden
              />
              ClickUp connected
            </span>
          ) : (
            <button
              type="button"
              onClick={connectClickUp}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-[12px] font-medium border hover:bg-[color-mix(in_oklab,var(--magenta)_8%,transparent)] transition-colors"
              style={{ borderColor: "var(--magenta)", color: "var(--magenta)" }}
            >
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Connect ClickUp
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Retainer health */}
          <section className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-medium">All retainers · health</h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-secondary">
                  {COMPANIES.length} active
                </span>
                <button
                  type="button"
                  onClick={runSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-white disabled:opacity-60"
                  style={{ background: "var(--magenta)" }}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`}
                    strokeWidth={1.8}
                  />
                  {syncing ? "Syncing…" : "Sync Vivia Riu now"}
                </button>
              </div>
            </header>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-2 font-normal">Client</th>
                  <th className="px-3 py-2 font-normal">MRR</th>
                  <th className="px-3 py-2 font-normal">Posts</th>
                  <th className="px-3 py-2 font-normal">Reach</th>
                  <th className="px-5 py-2 font-normal">Health</th>
                </tr>
              </thead>
              <tbody>
                {COMPANIES.map((c) => {
                  const ratio = c.postsDone / c.postsPlanned;
                  const health =
                    ratio > 0.8
                      ? "var(--success)"
                      : ratio > 0.5
                        ? "var(--warning)"
                        : "var(--danger)";
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-5 py-3 text-text-primary">{c.name}</td>
                      <td className="px-3 py-3 text-text-primary">
                        ${c.mrr.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {c.postsDone}/{c.postsPlanned}
                      </td>
                      <td
                        className="px-3 py-3 font-medium"
                        style={{
                          color:
                            c.reachDelta >= 0 ? "var(--success)" : "var(--danger)",
                        }}
                      >
                        {c.reachDelta >= 0 ? "+" : ""}
                        {c.reachDelta}%
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: health }}
                          aria-hidden
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Lead pipeline + alert */}
          <section className="lg:col-span-2 space-y-3">
            <h2 className="text-[14px] font-medium">Lead pipeline</h2>
            {LEAD_STAGES.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
              >
                <div className="leading-tight">
                  <div className="text-[12px] text-text-secondary">{s.name}</div>
                  <div className="text-[13px] text-text-primary mt-0.5">
                    Latest: <span className="font-medium">{s.latest}</span>
                  </div>
                </div>
                <div
                  className="h-9 w-9 rounded-md grid place-items-center text-[14px] font-medium"
                  style={{
                    background: "var(--magenta-soft)",
                    color: "var(--magenta)",
                  }}
                >
                  {s.count}
                </div>
              </div>
            ))}

            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ background: "var(--magenta-soft)" }}
            >
              <AlertCircle
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--magenta)" }}
                strokeWidth={1.5}
              />
              <div className="text-[12px] text-text-primary leading-relaxed">
                <span className="font-medium">CRA exam · May 26</span> · 14 days remaining.
                Package ready. Action plan in Operations / Finance.
              </div>
            </div>
          </section>
        </div>
        <AppFooter />
      </main>
    </div>
  );
}
