import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, RefreshCw, Link2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  syncOneFolder,
  listActiveCompanies,
  getClickUpConnection,
  getClickUpAuthorizeUrl,
  getRetainerMetrics,
} from "@/lib/clickup.functions";
import { TopHeader } from "@/components/divan/TopHeader";
import { MetricCard } from "@/components/divan/MetricCard";
import { AppFooter } from "@/components/divan/AppFooter";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/console")({
  component: AdminConsole,
  head: () => ({
    meta: [
      { title: "Founder console · Divan CDMS" },
      {
        name: "description",
        content: "Retainer health and workspace sync for Divan Group leadership.",
      },
    ],
  }),
});

interface RetainerRow {
  id: string;
  name: string;
  monthly_retainer_cents: number;
  postsCount: number;
  lastSync: string | null;
}

const healthColor = (lastSync: string | null): string => {
  if (!lastSync) return "var(--danger)";
  const age = Date.now() - new Date(lastSync).getTime();
  if (age < 24 * 60 * 60 * 1000) return "var(--success)";
  if (age < 7 * 24 * 60 * 60 * 1000) return "var(--warning)";
  return "var(--danger)";
};

const fmtUsd = (cents: number) => {
  if (!cents) return "—";
  return `$${Math.round(cents / 100).toLocaleString()}`;
};

function AdminConsole() {
  useRequireAuth();
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    currentFolder: string;
  } | null>(null);
  const syncOneFolderFn = useServerFn(syncOneFolder);
  const listCompaniesFn = useServerFn(listActiveCompanies);
  const fetchConn = useServerFn(getClickUpConnection);
  const fetchAuthorizeUrl = useServerFn(getClickUpAuthorizeUrl);
  const fetchMetrics = useServerFn(getRetainerMetrics);
  const { session, user } = useAuth();
  const [cuConnected, setCuConnected] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<{
    activeRetainers: number;
    mrrCents: number;
    companies: RetainerRow[];
  }>({ activeRetainers: 0, mrrCents: 0, companies: [] });

  const loadMetrics = async () => {
    try {
      const res = await fetchMetrics({});
      setMetrics(res as any);
    } catch (e) {
      console.error("retainer metrics failed", e);
    }
  };

  useEffect(() => {
    if (!session) {
      setCuConnected(false);
      return;
    }
    fetchConn({}).then((r) => setCuConnected(r.connected)).catch(() => setCuConnected(false));
    void loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const runSyncAll = async () => {
    setSyncingAll(true);
    setSyncProgress({ current: 0, total: 0, currentFolder: "" });
    try {
      const { companies } = await listCompaniesFn({});
      setSyncProgress({ current: 0, total: companies.length, currentFolder: "" });
      let totalTasks = 0;
      let totalErrors = 0;
      for (let i = 0; i < companies.length; i++) {
        const c = companies[i] as { id: string; name: string; clickup_folder_id: string };
        setSyncProgress({ current: i + 1, total: companies.length, currentFolder: c.name });
        try {
          const res = await syncOneFolderFn({ data: { folder_id: c.clickup_folder_id } });
          totalTasks += res.tasks;
          totalErrors += res.errors.length;
          if (res.errors.length > 0) console.error(`[${c.name}] errors:`, res.errors);
        } catch (e: any) {
          console.error(`[${c.name}] sync threw:`, e?.message ?? e);
          totalErrors += 1;
        }
      }
      toast.success(
        `Synced ${totalTasks} tasks across ${companies.length} folders. ${totalErrors} errors.`,
      );
      await loadMetrics();
    } catch (e: any) {
      toast.error(e?.message ?? "Full sync failed");
    } finally {
      setSyncingAll(false);
      setSyncProgress(null);
    }
  };

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <TopHeader role="admin" userName={firstName} initials="SB" unread={0} />

      {/* AI command bar — disabled placeholder */}
      <div
        className="sticky top-14 z-30 h-12 px-5 md:px-10 flex items-center gap-3 border-b border-white/10"
        style={{ background: "var(--charcoal)", color: "white", opacity: 0.5 }}
        title="AI features coming soon"
      >
        <Sparkles className="h-4 w-4" style={{ color: "var(--magenta)" }} strokeWidth={1.5} />
        <input
          type="text"
          readOnly
          placeholder="Coming in Phase 4 · AI command bar"
          className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/40 cursor-not-allowed"
        />
        <kbd className="hidden md:inline-flex items-center h-6 px-1.5 rounded bg-white/10 text-[10px] text-white/70">
          ⌘K
        </kbd>
      </div>

      <main className="flex-1 px-5 md:px-10 py-8 max-w-[1280px] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <MetricCard
            label="Monthly recurring"
            value={fmtUsd(metrics.mrrCents)}
          />
          <MetricCard label="Active retainers" value={metrics.activeRetainers} />
        </div>

        <div className="flex justify-end mb-4">
          {cuConnected ? (
            <span
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-[12px] font-medium border"
              style={{ borderColor: "var(--success)", color: "var(--success)" }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              ClickUp connected
            </span>
          ) : cuConnected === false ? (
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-[12px] font-medium border"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--danger)" }}
                  aria-hidden
                />
                ClickUp disconnected
              </span>
              <button
                type="button"
                onClick={connectClickUp}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-[12px] font-medium border hover:bg-[color-mix(in_oklab,var(--magenta)_8%,transparent)] transition-colors"
                style={{ borderColor: "var(--magenta)", color: "var(--magenta)" }}
              >
                <Link2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                Reconnect
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-medium">All retainers · health</h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-secondary">
                  {metrics.activeRetainers} active
                </span>
                <button
                  type="button"
                  onClick={runSyncAll}
                  disabled={syncingAll}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium text-white disabled:opacity-60"
                  style={{ background: "var(--magenta)" }}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${syncingAll ? "animate-spin" : ""}`}
                    strokeWidth={1.8}
                  />
                  {syncingAll ? "Syncing all…" : "Sync all workspaces"}
                </button>
              </div>
            </header>
            {syncProgress && syncProgress.total > 0 ? (
              <div
                className="px-5 py-2 text-[12px] text-text-secondary border-b border-border"
                style={{ background: "var(--muted)" }}
              >
                Syncing {syncProgress.current}/{syncProgress.total}
                {syncProgress.currentFolder ? `: ${syncProgress.currentFolder}` : ""}
              </div>
            ) : null}
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-2 font-normal">Client</th>
                  <th className="px-3 py-2 font-normal">MRR</th>
                  <th className="px-3 py-2 font-normal">Posts</th>
                  <th className="px-5 py-2 font-normal">Health</th>
                </tr>
              </thead>
              <tbody>
                {metrics.companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-text-secondary text-center">
                      No active retainers yet.
                    </td>
                  </tr>
                ) : (
                  metrics.companies.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-5 py-3 text-text-primary">{c.name}</td>
                      <td className="px-3 py-3 text-text-primary">
                        {fmtUsd(c.monthly_retainer_cents)}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">{c.postsCount}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: healthColor(c.lastSync) }}
                          aria-hidden
                          title={c.lastSync ? `Last sync ${new Date(c.lastSync).toLocaleString()}` : "Never synced"}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="lg:col-span-2 space-y-3">
            <div className="rounded-2xl p-6 border border-border" style={{ background: "var(--card)" }}>
              <p className="text-[14px] font-medium text-text-primary mb-1">Lead pipeline</p>
              <p className="text-[12px] text-text-secondary">
                Connect your CRM space to enable. Coming soon.
              </p>
            </div>
          </section>
        </div>
        <AppFooter />
      </main>
    </div>
  );
}
