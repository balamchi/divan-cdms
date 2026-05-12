import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import {
  COMPANIES,
  TASKS,
  DIVAN_TEAM_FOR_CLIENT,
  type Task,
} from "@/lib/mock-data";

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
  const company = COMPANIES[0]; // Vivia Riu
  const companyTasks = useMemo(
    () => TASKS.filter((t) => t.companyId === company.id),
    [company.id],
  );
  const [tasks, setTasks] = useState<Task[]>(companyTasks);

  const awaiting = tasks.filter((t) => t.status === "Client Review");
  const scheduled = tasks.filter((t) => t.status === "Approved");
  const upcoming = [...tasks]
    .filter((t) => new Date(t.publishDate) >= new Date(Date.now() - 86400000))
    .sort((a, b) => +new Date(a.publishDate) - +new Date(b.publishDate))
    .slice(0, 4);

  const onApprove = (id: string) =>
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status: "Approved" } : t)));
  const onRequestChanges = (id: string) =>
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status: "in progress" } : t)));

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
              {awaiting.length} items need your review · Next shoot: May 18
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
              <div className="rounded-xl border border-border bg-card p-8 text-center text-[13px] text-text-secondary">
                You're all caught up. Nice.
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
                      {new Date(t.publishDate).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
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
        </main>
      </div>
    </div>
  );
}
