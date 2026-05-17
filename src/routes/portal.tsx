import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  CheckCircle2,
  Calendar,
  BarChart3,
  Folder,
  MessageCircle,
  Camera,
} from "lucide-react";
import { TopHeader } from "@/components/divan/TopHeader";
import { Sidebar, type NavItem } from "@/components/divan/Sidebar";
import { MetricCard } from "@/components/divan/MetricCard";
import { TaskCard } from "@/components/divan/TaskCard";
import { AppFooter } from "@/components/divan/AppFooter";
import { useServerFn } from "@tanstack/react-start";
import { getPortalTasks, createApproval } from "@/lib/clickup.functions";
import { RequestChangesModal } from "@/components/divan/RequestChangesModal";
import { MessageThread } from "@/components/divan/MessageThread";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/require-auth";
import {
  COMPANIES,
  TASKS,
  DIVAN_TEAM_FOR_CLIENT,
  type Task,
  type TaskKind,
  type TaskStatus,
} from "@/lib/mock-data";

const VIVIA_COMPANY_UUID = "fb5bcc0c-666e-437f-abd0-8a1507b30c99";

export const Route = createFileRoute("/portal")({
  component: PortalDashboard,
  head: () => ({
    meta: [
      { title: "Client portal · Divan CDMS" },
      {
        name: "description",
        content:
          "Approve content, review your monthly report, and message your Divan team — all in one place.",
      },
    ],
  }),
});

function PortalDashboard() {
  useRequireAuth();
  const company = COMPANIES[0]; // Vivia Riu
  const { user } = useAuth();
  const companyTasks = useMemo(
    () => TASKS.filter((t) => t.companyId === company.id),
    [company.id],
  );
  const [tasks, setTasks] = useState<Task[]>(companyTasks);
  const fetchPortalTasks = useServerFn(getPortalTasks);

  // Effective company id: real auth user's company, or Vivia for demo "As Vivi".
  const effectiveCompanyId = user?.company_id ?? VIVIA_COMPANY_UUID;

  useEffect(() => {
    if (effectiveCompanyId !== VIVIA_COMPANY_UUID) return;
    let cancelled = false;
    (async () => {
      try {
        const { tasks: rows } = await fetchPortalTasks({
          data: { company_id: VIVIA_COMPANY_UUID },
        });
        if (cancelled || !rows) return;
        const mapped: Task[] = rows.map((r: any) => ({
          id: r.task_id,
          companyId: company.id,
          subject: r.subject || r.name || "(untitled)",
          description: r.description || "",
          kind: (r.kind as TaskKind) || "Publish Plan",
          status: (r.status as TaskStatus) || "to do",
          publishDate: r.publish_date || new Date().toISOString(),
          assignees: Array.isArray(r.assignees)
            ? (r.assignees as any[]).map((a) => a?.username || a?.email || "").filter(Boolean)
            : [],
        }));
        setTasks(mapped);
      } catch (e) {
        console.error("portal load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveCompanyId, company.id, fetchPortalTasks]);

  const awaiting = tasks.filter((t) => t.status === "Client Review");
  const scheduledStatuses = new Set(["Approved", "complete", "to do", "in progress"]);
  const weekFromNow = Date.now() + 7 * 86400000;
  const scheduled = tasks.filter((t) => {
    if (!scheduledStatuses.has(t.status)) return false;
    const ts = +new Date(t.publishDate);
    return ts >= Date.now() && ts <= weekFromNow;
  });
  const upcoming = [...tasks]
    .filter((t) => +new Date(t.publishDate) >= Date.now())
    .sort((a, b) => +new Date(a.publishDate) - +new Date(b.publishDate))
    .slice(0, 4);

  const approve = useServerFn(createApproval);
  const [pendingChanges, setPendingChanges] = useState<string | null>(null);

  const onApprove = async (id: string) => {
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status: "complete" } : t)));
    try {
      await approve({ data: { task_id: id, action: "approved" } });
      toast.success("Approved");
    } catch (e: any) {
      toast.error(e?.message ?? "Approve failed");
    }
  };
  const onRequestChanges = (id: string) => setPendingChanges(id);
  const submitChanges = async (note: string) => {
    if (!pendingChanges) return;
    const id = pendingChanges;
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status: "in progress" } : t)));
    try {
      await approve({ data: { task_id: id, action: "changes_requested", note } });
      toast.success("Sent to the team");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send");
    }
  };

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", route: "/portal" },
    { icon: CheckCircle2, label: "Approvals", route: "/portal", badgeCount: awaiting.length },
    { icon: Calendar, label: "Content calendar", route: "/portal" },
    { icon: BarChart3, label: "Monthly reports", route: "/portal" },
    { icon: Folder, label: "File library", route: "/portal" },
    { icon: MessageCircle, label: "Messages", route: "/portal", badgeCount: 2 },
    { icon: Camera, label: "Shoot bookings", route: "/portal" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader role="client" userName="Vivi Riu" initials="VR" unread={awaiting.length} />
      <div className="flex flex-1">
        <Sidebar
          role="client"
          items={navItems}
          footer={
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-3">
                Your team at Divan
              </p>
              <ul className="space-y-2.5">
                {DIVAN_TEAM_FOR_CLIENT.map((m) => (
                  <li key={m.name} className="flex items-center gap-2.5">
                    <span
                      className="h-7 w-7 rounded-full grid place-items-center text-[10px] font-medium"
                      style={{ background: "var(--teal-soft)", color: "var(--teal)" }}
                    >
                      {m.initials}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[12px] text-text-primary">{m.name}</div>
                      <div className="text-[10px] text-text-secondary">{m.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          }
        />

        <main className="flex-1 px-5 md:px-10 py-8 max-w-[1200px]">
          <header className="mb-6">
            <h1 className="text-[18px] font-medium">Welcome back, Vivi</h1>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {awaiting.length} {awaiting.length === 1 ? "item needs" : "items need"} your review · Next shoot: May 18
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <MetricCard
              label="Awaiting approval"
              value={awaiting.length}
              accentColor="var(--magenta)"
            />
            <MetricCard label="Scheduled this week" value={scheduled.length} />
            <MetricCard
              label="Reach this month"
              value="+34%"
              delta="vs April"
              deltaTone="success"
              accentColor="var(--success)"
            />
          </div>

          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[14px] font-medium">Needs your approval</h2>
              <span className="text-[11px] text-text-secondary">
                {awaiting.length} pending
              </span>
            </div>
            {awaiting.length === 0 ? (
              <div
                className="rounded-xl border border-border bg-card flex flex-col items-center text-center"
                style={{ padding: "48px 24px" }}
              >
                <CheckCircle2
                  size={64}
                  strokeWidth={1.4}
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                />
                <h3
                  className="font-medium"
                  style={{ fontSize: "16px", marginTop: "12px", color: "var(--text-primary)" }}
                >
                  All caught up
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    maxWidth: "280px",
                    marginTop: "4px",
                  }}
                >
                  No items need your review right now. We'll let you know when something's ready.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {awaiting.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    variant="client"
                    onApprove={onApprove}
                    onRequestChanges={onRequestChanges}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[13px] font-medium mb-3">Upcoming this week</h3>
              <ul className="divide-y divide-border">
                {upcoming.map((t) => (
                  <li key={t.id} className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-[13px] text-text-primary truncate">
                      {t.subject}
                    </span>
                    <span className="text-[11px] text-text-secondary shrink-0">
                      {new Date(t.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[13px] font-medium mb-3">Latest report</h3>
              <p className="text-[13px] text-text-primary mb-1">April 2026 · Performance</p>
              <p className="text-[12px] text-text-secondary mb-4">
                Reach grew 34% MoM with Story Plans driving the lift. Carousel saves up
                21%. Booking inquiries up 12.
              </p>
              <a
                href="#"
                className="text-[12px] font-medium"
                style={{ color: "var(--teal)" }}
              >
                View full report →
              </a>
            </section>
          </div>

          {/* Messages with the Divan team */}
          <section className="mt-10">
            <h2 className="text-[14px] font-medium mb-3">Messages</h2>
            <MessageThread
              companyId={effectiveCompanyId}
              currentUserRole="client"
              teamNameOverride="The Divan Team"
            />
          </section>

          <AppFooter />
        </main>
      </div>

      <RequestChangesModal
        open={pendingChanges !== null}
        onClose={() => setPendingChanges(null)}
        onSubmit={submitChanges}
      />
    </div>
  );
}
