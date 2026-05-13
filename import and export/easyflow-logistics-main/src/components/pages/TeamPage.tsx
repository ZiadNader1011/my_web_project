import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useStore } from "@/store/tasks";
import { useAuth } from "@/auth/AuthProvider";

export function TeamPage() {
  const { t } = useI18n();
  const { employees, tasks, addEmployee, removeEmployee } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/" });
  }, [isAdmin, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addEmployee({ name, role: role || "Operator" });
    setName("");
    setRole("");
    setOpen(false);
  };

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {t.nav.team}
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight mt-1">
              {t.team.title}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg">{t.team.subtitle}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition"
          >
            <Plus className="size-4" /> {t.team.add}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((e) => {
            const assigned = tasks.filter((x) => x.assigneeId === e.id).length;
            const done = tasks.filter((x) => x.assigneeId === e.id && x.status === "completed")
              .length;
            return (
              <div
                key={e.id}
                className="bg-surface border border-border rounded-3xl p-6 shadow-soft relative"
              >
                <button
                  onClick={() => {
                    if (confirm(t.team.confirmRemove)) removeEmployee(e.id);
                  }}
                  className="absolute top-4 end-4 inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-urgent-soft text-urgent border border-urgent/30 hover:bg-urgent hover:text-white transition text-[10px] font-bold uppercase tracking-widest"
                  aria-label={t.team.remove}
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline">{t.team.remove}</span>
                </button>
                <div
                  className="size-14 rounded-full bg-gradient-to-br from-brand-blue via-brand-purple to-brand-orange p-[2px]"
                  aria-hidden
                >
                  <div className="size-full rounded-full bg-surface flex items-center justify-center text-foreground font-bold">
                    {e.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">{e.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {e.role}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-surface-muted rounded-xl p-3">
                    <div className="font-display font-bold text-xl text-foreground">{assigned}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {t.team.assigned}
                    </div>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-3">
                    <div className="font-display font-bold text-xl text-stable">{done}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {t.team.done}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {open && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={submit}
              className="bg-surface border border-border rounded-3xl p-7 max-w-md w-full shadow-elevated"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-xl text-foreground">{t.team.add}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="size-9 rounded-full hover:bg-accent flex items-center justify-center"
                  aria-label={t.team.cancel}
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.team.newName}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={t.team.newRole}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 transition"
              >
                {t.team.save}
              </button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
