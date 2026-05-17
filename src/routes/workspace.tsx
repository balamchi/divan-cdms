import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  MessageCircle,
  Languages,
  Camera,
  ChevronDown,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { TopHeader } from "@/components/divan/TopHeader";
import { type NavItem } from "@/components/divan/Sidebar";
import { TaskCard } from "@/components/divan/TaskCard";
import { AppFooter } from "@/components/divan/AppFooter";
import { MessageThread } from "@/components/divan/MessageThread";
import { listMessageCompanies } from "@/lib/clickup.functions";
import { COMPANIES, TODAY_TASKS_FOR_TEAM } from "@/lib/mock-data";
import { useRequireAuth } from "@/lib/require-auth";

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
  { label: "Generate caption", desc: "Claude Haiku · brand voice", Icon: MessageSquare },
  { label: "Reply to DM", desc: "Drafts in your tone", Icon: MessageSquare },
  { label: "Translate FA ↔ EN", desc: "Persian ↔ English", Icon: Languages },
  { label: "Upload from phone", desc: "QR to attach assets", Icon: Camera },
];

type View = "my-day" | "messages";

function WorkspaceMyDay() {
  useRequireAuth();
  const [view, setView] = useState<View>("my-day");

  const navItems: NavItem[] = [
    { icon: Home, label: "My day", route: "/workspace" },
    { icon: Clock, label: "Timesheet", route: "/workspace" },
    { icon: Sparkles, label: "AI tools", route: "/workspace" },
    { icon: MessageCircle, label: "Messages", route: "/workspace" },
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

  const [briefDate, setBriefDate] = useState("");
  useEffect(() => {
    setBriefDate(
      new Date().toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader role="team" userName="Rahil Nemati" initials="RN" unread={3} />
      <div className="flex flex-1">
        <aside
          className="hidden md:flex shrink-0 w-[240px] flex-col"
          style={{ background: "var(--background)" }}
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
                      className="w-full flex items-center gap-2 py-1.5 text-[13px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          s.expanded ? "" : "-rotate-90"
                        }`}
                        strokeWidth={1.5}
                      />
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      <span>{s.name}</span>
                    </button>
                    {s.expanded && s.children.length > 0 && (
                      <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
                        {s.children.map((c) => (
                          <li
                            key={c}
                            className="text-[12px] py-1 cursor-pointer hover:text-text-primary"
                            style={{ color: "var(--text-muted)" }}
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
                const target: View = n.label === "Messages" ? "messages" : "my-day";
                const active =
                  (n.label === "Messages" && view === "messages") ||
                  (n.label === "My day" && view === "my-day");
                return (
                  <li
                    key={n.label}
                    onClick={() => setView(target)}
                    className="flex items-center gap-2 text-[13px] py-1.5 cursor-pointer"
                    style={{
                      color: active ? "var(--foreground)" : "var(--text-secondary)",
                      fontWeight: active ? 500 : 400,
                    }}
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
          {view === "messages" ? (
            <MessagesInbox />
          ) : (
            <>
              <header className="mb-6">
                <h1 className="text-[18px] font-medium">Good morning, Rahil</h1>
              </header>

              <div
                className="rounded-xl p-5 mb-8 flex gap-4"
                style={{
                  background: "var(--background)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  className="h-9 w-9 rounded-md grid place-items-center shrink-0"
                  style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="text-[13px] text-text-primary leading-relaxed">
                  <span className="font-medium">Morning brief · </span>
                  <span className="text-text-secondary">{briefDate}</span>
                  <p className="mt-1">
                    You have {todayCount} tasks due today across{" "}
                    <span className="font-medium">{companies.join(", ")}</span>. Production
                    day for Vivia Riu starts Tuesday at 10am. Remember: no work after 6 PM.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <section>
                  <h2 className="text-[14px] font-medium mb-3">AI quick tools</h2>
                  <div className="space-y-3">
                    {TILES.map((tile) => {
                      const Icon = tile.Icon;
                      return (
                        <button
                          key={tile.label}
                          type="button"
                          className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-colors hover:bg-secondary"
                          style={{
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            className="grid place-items-center shrink-0"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              background: "var(--secondary)",
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: "var(--text-secondary)" }}
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
            </>
          )}
          <AppFooter />
        </main>
      </div>
    </div>
  );
}

interface CompanyRow {
  id: string;
  name: string;
  logo_url: string | null;
}

function MessagesInbox() {
  const fetchCompanies = useServerFn(listMessageCompanies);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchCompanies({});
        if (cancelled) return;
        setCompanies((res.companies ?? []) as CompanyRow[]);
      } catch (e) {
        console.error("listMessageCompanies failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchCompanies]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[18px] font-medium">Messages</h1>
        <p className="text-[12px] text-text-secondary mt-0.5">
          Conversations with active clients.
        </p>
      </header>
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--card)", minHeight: 520 }}
      >
        {/* Left: company list */}
        <div
          className="w-[320px] shrink-0 overflow-y-auto"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          {loading ? (
            <p className="text-[12px] text-text-secondary p-4">Loading…</p>
          ) : companies.length === 0 ? (
            <p className="text-[12px] text-text-secondary p-4">No active clients.</p>
          ) : (
            <ul>
              {companies.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      background: isActive ? "var(--secondary)" : "transparent",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="h-9 w-9 rounded-full grid place-items-center shrink-0 text-[11px] font-medium overflow-hidden"
                      style={{ background: "var(--teal-soft)", color: "var(--teal)" }}
                    >
                      {c.logo_url ? (
                        <img
                          src={c.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        c.name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() ?? "")
                          .join("")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-primary truncate">
                        {c.name}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right: thread */}
        <div className="flex-1 min-w-0 p-4">
          {activeId ? (
            <MessageThread companyId={activeId} currentUserRole="team" />
          ) : (
            <div className="h-full grid place-items-center">
              <p className="text-[13px] text-text-secondary">
                Select a conversation to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
