import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, MessageCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { TopHeader } from "@/components/divan/TopHeader";
import { Sidebar, type NavItem } from "@/components/divan/Sidebar";
import { AppFooter } from "@/components/divan/AppFooter";
import { MessageThread } from "@/components/divan/MessageThread";
import { listMessageCompanies, getMyDayTasks } from "@/lib/clickup.functions";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceMyDay,
  head: () => ({
    meta: [
      { title: "My day · Divan workspace" },
      {
        name: "description",
        content: "Today's tasks across all your clients.",
      },
    ],
  }),
});

interface MyDayTask {
  task_id: string;
  name: string | null;
  subject: string | null;
  status: string | null;
  due_date: string | null;
  company_id: string | null;
  company_name: string | null;
  list_name: string | null;
  url: string | null;
}

function WorkspaceMyDay() {
  useRequireAuth();
  const { user } = useAuth();
  const fetchMyDay = useServerFn(getMyDayTasks);
  const [tasks, setTasks] = useState<MyDayTask[]>([]);
  const [linked, setLinked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchMyDay();
        if (cancelled) return;
        setTasks((res.tasks ?? []) as MyDayTask[]);
        setLinked(res.linked);
      } catch (e) {
        console.error("my-day load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMyDay]);

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const navItems: NavItem[] = [
    { icon: Home, label: "My day", route: "/workspace" },
    { icon: MessageCircle, label: "Messages", route: "/workspace#messages-section" },
  ];

  // Group tasks by company
  const groups = new Map<string, MyDayTask[]>();
  for (const t of tasks) {
    const key = t.company_name ?? "Other";
    const cur = groups.get(key) ?? [];
    cur.push(t);
    groups.set(key, cur);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader role="team" userName={firstName} initials="RN" unread={tasks.length} />
      <div className="flex flex-1">
        <Sidebar role="team" items={navItems} />
        <main className="flex-1 px-5 md:px-10 py-8 max-w-[1200px]">
          <header className="mb-6">
            <h1 className="text-[18px] font-medium">Good morning, {firstName}</h1>
            <p className="text-[12px] text-text-secondary mt-0.5">
              Today's tasks across all your clients
            </p>
          </header>

          <section className="mb-10">
            {loading ? (
              <p className="text-[13px] text-text-secondary">Loading…</p>
            ) : !linked ? (
              <div
                className="rounded-xl border border-border bg-card text-center"
                style={{ padding: "40px 24px" }}
              >
                <p className="text-[14px] text-text-primary">
                  Your ClickUp user isn't linked yet.
                </p>
                <p className="text-[12px] text-text-secondary mt-1">
                  Ask an admin to set your ClickUp user ID in the users table.
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div
                className="rounded-xl border border-border bg-card text-center"
                style={{ padding: "40px 24px" }}
              >
                <p className="text-[14px] text-text-primary">No tasks due today.</p>
                <p className="text-[12px] text-text-secondary mt-1">Enjoy the breather.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(groups.entries()).map(([groupName, list]) => (
                  <div key={groupName}>
                    <h3 className="text-[12px] uppercase tracking-wider text-text-secondary mb-2">
                      {groupName} · {list.length}
                    </h3>
                    <ul className="rounded-xl border border-border bg-card divide-y divide-border">
                      {list.map((t) => (
                        <li key={t.task_id} className="p-4 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-text-primary truncate">
                              {t.subject || t.name || "Untitled"}
                            </p>
                            <p className="text-[11px] text-text-secondary truncate">
                              {t.list_name ?? ""}
                              {t.due_date
                                ? ` · due ${new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : ""}
                            </p>
                          </div>
                          <span className="text-[11px] text-text-secondary capitalize">
                            {t.status}
                          </span>
                          {t.url && (
                            <a
                              href={t.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px]"
                              style={{ color: "var(--magenta)" }}
                            >
                              Open
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="messages-section" className="scroll-mt-20">
            <h2 className="text-[14px] font-medium mb-3">Messages</h2>
            <MessagesInbox />
          </section>

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
    <div
      className="flex rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--card)", minHeight: 480 }}
    >
      <div
        className="w-[260px] shrink-0 overflow-y-auto"
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
                      <img src={c.logo_url} alt="" className="h-full w-full object-cover" />
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
  );
}
