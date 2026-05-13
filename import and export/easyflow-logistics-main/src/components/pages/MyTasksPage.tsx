import { CheckCircle2, Eye, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useStore } from "@/store/tasks";
import { PriorityBadge, PriorityDot, StatusBadge } from "@/components/Badges";
import { useFormatters } from "@/lib/format";

export function MyTasksPage() {
  const { t } = useI18n();
  const { tasks, employees, currentEmployeeId, updateTaskStatus } = useStore();
  const fmt = useFormatters();

  const me = employees.find((e) => e.id === currentEmployeeId);
  const myTasks = tasks.filter(
    (x) => x.assigneeId === currentEmployeeId || x.assigneeId === "all",
  );

  return (
    // ✅ استخدمنا Fragment <> بدلاً من AppShell لمنع تكرار الهيدر والسايدبار
    <>
      <div className="px-6 lg:px-10 py-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            {me?.name ?? t.nav.myTasks}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight mt-1">
            {t.myTasks.title}
          </h1>
          <p className="text-muted-foreground mt-3">{t.myTasks.subtitle}</p>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-16 text-center shadow-soft">
            <div className="font-display font-semibold text-2xl text-foreground">{t.myTasks.empty}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <article
                key={task.id}
                className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <PriorityDot priority={task.priority} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                        {task.ref}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                    <h3 className="text-lg font-medium text-foreground leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
                      {t.common.issued} · {fmt.ago(task.createdAt)}
                      {task.dueDate ? ` · ${t.common.due} ${fmt.date(task.dueDate)}` : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {task.status === "pending" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, "acknowledged")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-medium-soft text-medium border border-medium/30 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-medium hover:text-white transition"
                    >
                      <Eye className="size-3.5" /> {t.myTasks.acknowledge}
                    </button>
                  )}
                  {task.status !== "completed" ? (
                    <button
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stable text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition"
                    >
                      <CheckCircle2 className="size-3.5" /> {t.myTasks.complete}
                    </button>
                  ) : (
                    <button
                      onClick={() => updateTaskStatus(task.id, "pending")}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition"
                    >
                      <RotateCcw className="size-3.5" /> {t.myTasks.reopen}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default MyTasksPage;