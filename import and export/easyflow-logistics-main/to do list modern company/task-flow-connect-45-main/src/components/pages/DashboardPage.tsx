import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useStore, type Priority } from "@/store/tasks";
import { useAuth } from "@/auth/AuthProvider";
import { PriorityBadge, PriorityDot, StatusBadge } from "@/components/Badges";
import { useFormatters } from "@/lib/format";
import { cn } from "@/lib/utils";

type Filter = "all" | Priority;

export function DashboardPage() {
  const { t } = useI18n();
  const { tasks, employees, currentEmployeeId } = useStore();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const fmt = useFormatters();
  const [clock, setClock] = useState<string>("");
  const [tz, setTz] = useState<string>("");

  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const visibleTasks = useMemo(() => {
    const base = isAdmin
      ? tasks
      : tasks.filter((x) => x.assigneeId === currentEmployeeId || x.assigneeId === "all");
    return filter === "all" ? base : base.filter((tk) => tk.priority === filter);
  }, [tasks, filter, isAdmin, currentEmployeeId]);

  const total = tasks.length;
  const pending = tasks.filter((x) => x.status !== "completed").length;
  const completed = tasks.filter((x) => x.status === "completed").length;

  const teamProgress = employees.map((e) => {
    const mine = tasks.filter((t) => t.assigneeId === e.id);
    const done = mine.filter((t) => t.status === "completed").length;
    const pct = mine.length === 0 ? 0 : Math.round((done / mine.length) * 100);
    return { ...e, pct, total: mine.length, done };
  });

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-10 space-y-10 max-w-[1400px] mx-auto">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {t.dashboard.title}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight mt-1">
              {t.dashboard.subtitle}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <Link
                to="/send"
                className="inline-flex items-center gap-2 self-start rounded-full bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition"
              >
                <Plus className="size-4" />
                {t.dashboard.newInstruction}
              </Link>
            ) : (
              <Link
                to="/checklist"
                className="inline-flex items-center gap-2 self-start rounded-full bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition"
              >
                <ClipboardList className="size-4" />
                {t.nav.checklist}
              </Link>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KpiCard label={t.kpi.total} value={total} accent="text-foreground" sub={t.kpi.vsLast} />
          <KpiCard
            label={t.kpi.pending}
            value={pending}
            accent="text-urgent"
            sub={t.kpi.criticalPath}
          />
          <KpiCard
            label={t.kpi.completed}
            value={completed}
            accent="text-stable"
            sub={t.kpi.verified}
          />
          <KpiCard
            label={t.kpi.team}
            value={employees.length}
            accent="text-foreground"
            sub={`${employees.length} ${t.kpi.online}`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Instructions list */}
          <section className="xl:col-span-8 bg-surface rounded-3xl border border-border overflow-hidden shadow-soft">
            <div className="px-6 sm:px-8 py-6 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display font-bold text-xl text-foreground">{t.dashboard.subtitle}</h2>
              <div className="flex flex-wrap gap-2">
                {(["all", "urgent", "medium", "low"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition",
                      filter === f
                        ? f === "urgent"
                          ? "bg-urgent text-white border-urgent"
                          : f === "medium"
                            ? "bg-medium text-white border-medium"
                            : f === "low"
                              ? "bg-stable text-white border-stable"
                              : "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    {t.priority[f]}
                  </button>
                ))}
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-sm">
                {t.dashboard.empty}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleTasks.map((task) => {
                  const assignee =
                    task.assigneeId === "all"
                      ? { name: t.send.assignAll, role: "" }
                      : employees.find((e) => e.id === task.assigneeId);
                  return (
                    <article
                      key={task.id}
                      className="p-6 sm:p-7 flex items-start sm:items-center gap-4 sm:gap-6 hover:bg-surface-muted/60 transition group"
                    >
                      <PriorityDot priority={task.priority} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                            {task.ref}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium leading-snug text-foreground">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="text-[11px] text-muted-foreground mt-2">
                          {t.common.assignedTo}{" "}
                          <span className="text-foreground font-medium">{assignee?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <StatusBadge status={task.status} />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {t.common.issued} · {fmt.ago(task.createdAt)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Side panel */}
          <aside className="xl:col-span-4 space-y-6">
            <div className="bg-surface rounded-3xl border border-border p-7 shadow-soft">
              <h2 className="font-display font-bold text-xl text-foreground mb-5">
                {t.dashboard.teamProgress}
              </h2>
              <div className="space-y-5">
                {teamProgress.map((m) => (
                  <div key={m.id}>
                    <div className="flex justify-between mb-1.5 items-baseline">
                      <span className="text-xs font-semibold text-foreground">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {m.done}/{m.total} · {m.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/team"
                className="mt-7 w-full inline-flex items-center justify-center gap-2 py-3 bg-surface-muted hover:bg-accent transition-colors rounded-xl text-xs font-bold uppercase tracking-[0.15em] border border-border text-foreground"
              >
                {t.team.title} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-foreground to-foreground/85 rounded-3xl p-7 text-background shadow-elevated relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-60 font-bold mb-3">
                {t.dashboard.shiftSummary}
              </p>
              <p className="font-display text-lg font-medium leading-snug">
                {t.dashboard.shiftMessage}
              </p>
              <div className="flex justify-between items-end mt-6">
                <div>
                  <p className="text-3xl font-display font-bold tabular-nums" suppressHydrationWarning>
                    {clock || "—"}
                  </p>
                  <p className="text-[10px] uppercase opacity-60 tracking-widest" suppressHydrationWarning>
                    {tz}
                  </p>
                </div>
                <span className="size-2 rounded-full bg-background animate-pulse" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-soft hover:-translate-y-0.5 transition-transform">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
        {label}
      </p>
      <p className={cn("font-display font-bold text-5xl mt-2 tabular-nums tracking-tight", accent)}>
        {value.toString().padStart(2, "0")}
      </p>
      <p className="mt-3 text-[10px] text-muted-foreground uppercase tracking-widest">{sub}</p>
    </div>
  );
}
