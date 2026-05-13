import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Clock,
  Sparkles,
  TrendingUp,
  Package,
  Settings,
  BookOpen,
  Users,
  MessageSquare,
  Languages,
  Camera,
  ChevronDown,
} from "lucide-react";
import { TopHeader } from "@/components/divan/TopHeader";
import { Sidebar, type NavItem } from "@/components/divan/Sidebar";
import { TaskCard } from "@/components/divan/TaskCard";
import { AppFooter } from "@/components/divan/AppFooter";
import { COMPANIES, TODAY_TASKS_FOR_TEAM } from "@/lib/mock-data";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceMyDay,
  head: () => ({
    meta: [
      { title: "My day · Divan workspace" },
      {
        name: "description",
        content:
          "Today's tasks, AI quick tools, and the Divan morning brief — for the team.",
      },
    ],
  }),
});

const TILES = [
  { label: "Generate caption", desc: "Claude Haiku · brand voice", bg: "var(--color-tile-blue)", Icon: MessageSquare },
  { label: "Reply to DM", desc: "Drafts in your tone", bg: "var(--color-tile-pink)", Icon: MessageSquare },
  { label: "Translate FA ↔ EN", desc: "Persian ↔ English", bg: "var(--color-tile-green)", Icon: Languages },
  { label: "Upload from phone", desc: "QR to attach assets", bg: "var(--color-tile-amber)", Icon: Camera },
];

function WorkspaceMyDay() {
  const navItems: NavItem[] = [
    { icon: Home, label: "My day", route: "/workspace" },
    { icon: Clock, label: "Timesheet", route: "/workspace" },
    { icon: Sparkles, label: "AI tools", route: "/workspace" },
  ];

  const spaces = [
    { name: "Growth", icon: TrendingUp, expanded: false, children: [] as string[] },
    {
      name: "Delivery",
      icon: Package,
      expanded: true,
      children: COMPANIES.map((c) => c.name),
    },
    { name: "Operations", icon: Settings, expanded: false, children: [] },
    { name: "Process Library", icon: BookOpen, expanded: false, children: [] },
    { name: "CRM", icon: Users, expanded: false, children: [] },
  ];

  const hours = "5h 12m";
  const todayCount = TODAY_TASKS_FOR_TEAM.length;
  const companies = Array.from(
    new Set(
      TODAY_TASKS_FOR_TEAM.map(
        (t) => COMPANIES.find((c) => c.id === t.companyId)?.name,
      ).filter(Boolean) as string[],
    ),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader role="team" userName="Rahil Nemati" initials="RN" unread={3} />
      <div className="flex flex-1">
        {/* Custom sidebar with collapsible Spaces (still uses Sidebar wrapper for footer items) */}
        <aside
          className="hidden md:flex shrink-0 w-[240px] flex-col border-r border-border"
          style={{ background: "#F1EFE8" }}
        >
          <div className="px-5 py-4">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              Spaces
            </p>
            <ul className="space-y-0.5">
              {spaces.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 py-1.5 text-[13px] text-text-primary"
                    >
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          s.expanded ? "" : "-rotate-90"
                        }`}
                        strokeWidth={1.5}
                      />
                      <Icon className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
                      <span>{s.name}</span>
                    </button>
                    {s.expanded && s.children.length > 0 && (
                      <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
                        {s.children.map((c) => (
                          <li
                            key={c}
                            className="text-[12px] text-text-secondary py-1 cursor-pointer hover:text-text-primary"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="border-t border-border/60 px-5 py-4 mt-auto">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-2">
              My work
            </p>
            <ul className="space-y-0.5">
              {navItems.map((n) => {
                const Icon = n.icon;
                return (
                  <li
                    key={n.label}
                    className="flex items-center gap-2 text-[13px] py-1.5 cursor-pointer text-text-primary"
                    style={
                      n.label === "My day"
                        ? {
                            color: "var(--magenta)",
                            fontWeight: 500,
                          }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    {n.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="flex-1 px-5 md:px-10 py-8 max-w-[1200px]">
          <header className="mb-6">
            <h1 className="text-[18px] font-medium">Good morning, Rahil</h1>
          </header>

          {/* Morning brief */}
          <div
            className="rounded-xl p-5 mb-8 flex gap-4"
            style={{ background: "var(--magenta-soft)" }}
          >
            <div
              className="h-9 w-9 rounded-md grid place-items-center shrink-0"
              style={{ background: "white", color: "var(--magenta)" }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="text-[13px] text-text-primary leading-relaxed">
              <span className="font-medium">Morning brief · </span>
              <span className="text-text-secondary">
                {new Date().toLocaleDateString("en-CA", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <p className="mt-1">
                You have {todayCount} tasks due today across{" "}
                <span className="font-medium">{companies.join(", ")}</span>. Production day
                for Vivia Riu starts Tuesday at 10am. Remember: no work after 6 PM.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today */}
            <section className="lg:col-span-2">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[14px] font-medium">
                  Today · {todayCount} tasks
                </h2>
                <span className="text-[11px] text-text-secondary">
                  {hours} logged
                </span>
              </div>
              <div className="space-y-3">
                {TODAY_TASKS_FOR_TEAM.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    variant="team"
                    active={"active" in t ? (t as { active?: boolean }).active : false}
                    timer={"timer" in t ? (t as { timer?: string }).timer : undefined}
                  />
                ))}
              </div>
            </section>

            {/* AI tools */}
            <section>
              <h2 className="text-[14px] font-medium mb-3">AI quick tools</h2>
              <div className="space-y-3">
                {TILES.map((tile) => {
                  const Icon = tile.Icon;
                  return (
                    <button
                      key={tile.label}
                      type="button"
                      className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-transform hover:-translate-y-0.5"
                      style={{ background: tile.bg }}
                    >
                      <div className="h-9 w-9 rounded-md bg-white grid place-items-center">
                        <Icon
                          className="h-4 w-4 text-text-primary"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[13px] font-medium text-text-primary">
                          {tile.label}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          {tile.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
