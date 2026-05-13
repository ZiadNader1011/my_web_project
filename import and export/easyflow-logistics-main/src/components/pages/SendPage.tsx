import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useStore, type Priority } from "@/store/tasks";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function SendPage() {
  const { t } = useI18n();
  const { employees, addTask } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("all");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/" });
  }, [isAdmin, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t.send.validation);
      return;
    }
    addTask({ title, description, assigneeId, priority, dueDate: dueDate || undefined });
    setSuccess(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            {t.nav.send}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight mt-1">
            {t.send.title}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg">{t.send.subtitle}</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft"
        >
          <Field label={t.send.titleLabel}>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder={t.send.titlePh}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </Field>

          <Field label={t.send.descLabel}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.send.descPh}
              rows={5}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label={t.send.assignLabel}>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">{t.send.assignAll}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.role}
                  </option>
                ))}
              </select>
            </Field>

            <DateInput label={t.send.dueLabel} value={dueDate} onChange={setDueDate} />
          </div>

          <Field label={t.send.priorityLabel}>
            <div className="grid grid-cols-3 gap-3">
              {(["urgent", "medium", "low"] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition",
                    priority === p
                      ? p === "urgent"
                        ? "bg-urgent text-white border-urgent"
                        : p === "medium"
                          ? "bg-medium text-white border-medium"
                          : "bg-stable text-white border-stable"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                  )}
                >
                  {t.priority[p]}
                </button>
              ))}
            </div>
          </Field>

          {error && (
            <div className="text-sm text-urgent bg-urgent-soft border border-urgent/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={success}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] hover:opacity-90 transition shadow-elevated disabled:opacity-60"
          >
            {success ? (
              <>
                <CheckCircle2 className="size-4" /> {t.send.sent}
              </>
            ) : (
              <>
                <Send className="size-4" /> {t.send.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const displayValue = value
    ? value.split("-").length === 3
      ? `${value.split("-")[2]}/${value.split("-")[1]}/${value.split("-")[0]}`
      : value
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parts = val.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      onChange(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      onChange(val);
    }
  };

  return (
    <Field label={label}>
      <input
        type="text"
        placeholder="dd/mm/yyyy"
        value={displayValue}
        onChange={handleChange}
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </Field>
  );
}
