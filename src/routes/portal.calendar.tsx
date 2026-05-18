import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Home, CheckCircle2, Calendar as CalendarIcon, MessageCircle, X } from "lucide-react";
import { TopHeader } from "@/components/divan/TopHeader";
import { Sidebar, type NavItem } from "@/components/divan/Sidebar";
import { AppFooter } from "@/components/divan/AppFooter";
import { useServerFn } from "@tanstack/react-start";
import { getPortalTasks } from "@/lib/clickup.functions";
import { useRequireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/auth";
import { normalizeStatus } from "@/lib/utils";

const VIVIA_COMPANY_UUID = "fb5bcc0c-666e-437f-abd0-8a1507b30c99";

export const Route = createFileRoute("/portal/calendar")({
  component: PortalCalendar,
  head: () => ({
    meta: [
      { title: "Content calendar · Divan CDMS" },
      { name: "description", content: "Monthly view of your scheduled content." },
    ],
  }),
});

interface PortalTask {
  task_id: string;
  name: string | null;
  subject: string | null;
  description: string | null;
  status: string | null;
  publish_date: string | null;
  list_name: string | null;
  assignees?: any[];
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const chipStyleFor = (status: string | null): { bg: string; fg: string } => {
  const n = normalizeStatus(status ?? "");
  if (n === "approved_or_done") return { bg: "var(--teal-soft)", fg: "var(--teal)" };
  if (n === "in_progress") return { bg: "var(--magenta-soft)", fg: "var(--magenta)" };
  if (status === "Closed" || status === "closed")
    return { bg: "var(--secondary)", fg: "var(--text-muted)" };
  return { bg: "var(--secondary)", fg: "var(--text-secondary)" };
};

function PortalCalendar() {
  useRequireAuth();
  const { user } = useAuth();
  const fetchPortalTasks = useServerFn(getPortalTasks);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [selected, setSelected] = useState<PortalTask | null>(null);

  const effectiveCompanyId = user?.company_id ?? VIVIA_COMPANY_UUID;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { tasks: rows } = await fetchPortalTasks({
          data: { company_id: effectiveCompanyId },
        });
        if (!cancelled) setTasks((rows ?? []) as PortalTask[]);
      } catch (e) {
        console.error("calendar load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveCompanyId, fetchPortalTasks]);

  const { byDay, unscheduled } = useMemo(() => {
    const map = new Map<string, PortalTask[]>();
    const un: PortalTask[] = [];
    for (const t of tasks) {
      if (!t.publish_date) {
        un.push(t);
        continue;
      }
      const d = new Date(t.publish_date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = String(d.getUTCDate());
      const cur = map.get(key) ?? [];
      cur.push(t);
      map.set(key, cur);
    }
    return { byDay: map, unscheduled: un };
  }, [tasks, month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", route: "/portal" },
    { icon: CheckCircle2, label: "Approvals", route: "/portal" },
    { icon: CalendarIcon, label: "Content calendar", route: "/portal/calendar" },
    { icon: MessageCircle, label: "Messages", route: "/portal" },
  ];

  const totalInMonth = Array.from(byDay.values()).reduce((s, a) => s + a.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader role="client" userName={user?.full_name ?? "there"} initials="VR" unread={0} />
      <div className="flex flex-1">
        <Sidebar role="client" items={navItems} />
        <main className="flex-1 px-5 md:px-10 py-8 max-w-[1200px]">
          <header className="mb-6">
            <h1 className="text-[20px] font-medium">Content calendar</h1>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {MONTH_LABELS[month]} {year}
            </p>
          </header>

          {unscheduled.length > 0 && (
            <section className="mb-6 rounded-xl border border-border bg-card p-4">
              <p className="text-[12px] text-text-secondary mb-2">Unscheduled</p>
              <div className="flex flex-wrap gap-2">
                {unscheduled.map((t) => {
                  const s = chipStyleFor(t.status);
                  return (
                    <button
                      key={t.task_id}
                      onClick={() => setSelected(t)}
                      className="px-2.5 h-7 rounded-full text-[12px] font-medium"
                      style={{ background: s.bg, color: s.fg }}
                    >
                      {(t.subject || t.name || "Untitled").slice(0, 28)}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {totalInMonth === 0 && unscheduled.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card text-center"
              style={{ padding: "48px 24px" }}
            >
              <CalendarIcon size={48} strokeWidth={1.4} style={{ color: "var(--text-muted)", opacity: 0.5 }} className="mx-auto" />
              <p className="text-[14px] mt-3" style={{ color: "var(--text-primary)" }}>
                No content scheduled for {MONTH_LABELS[month]} {year} yet.
              </p>
              <p className="text-[12px] text-text-secondary mt-1">
                Check back after your team finishes planning.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-7" style={{ background: "var(--secondary)" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="px-2 py-2 text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  const tasksForDay = day ? byDay.get(String(day)) ?? [] : [];
                  return (
                    <div
                      key={i}
                      className="border-t border-l border-border p-1.5 min-h-[96px] last:border-r"
                      style={{ background: "var(--card)" }}
                    >
                      {day !== null && (
                        <>
                          <div className="text-[11px] text-text-secondary mb-1">{day}</div>
                          <div className="flex flex-col gap-1">
                            {tasksForDay.slice(0, 3).map((t) => {
                              const s = chipStyleFor(t.status);
                              return (
                                <button
                                  key={t.task_id}
                                  onClick={() => setSelected(t)}
                                  className="text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                                  style={{ background: s.bg, color: s.fg }}
                                  title={t.subject || t.name || ""}
                                >
                                  {(t.subject || t.name || "Untitled").slice(0, 22)}
                                </button>
                              );
                            })}
                            {tasksForDay.length > 3 && (
                              <span className="text-[10px] text-text-secondary px-1">
                                +{tasksForDay.length - 3} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <AppFooter />
        </main>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full overflow-y-auto p-6"
            style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-[16px] font-medium pr-4">
                {selected.subject || selected.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="text-[13px] space-y-2">
              <div className="flex gap-2">
                <dt className="text-text-secondary w-24">Status</dt>
                <dd>{selected.status ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-secondary w-24">Date</dt>
                <dd>
                  {selected.publish_date
                    ? new Date(selected.publish_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })
                    : "Unscheduled"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-secondary w-24">Owner</dt>
                <dd>The Divan Team</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-secondary w-24">List</dt>
                <dd>{selected.list_name ?? "—"}</dd>
              </div>
            </dl>
            {selected.description && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-1">
                  Description
                </p>
                <p className="text-[13px] whitespace-pre-wrap text-text-primary">
                  {selected.description.slice(0, 600)}
                  {selected.description.length > 600 ? "…" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
