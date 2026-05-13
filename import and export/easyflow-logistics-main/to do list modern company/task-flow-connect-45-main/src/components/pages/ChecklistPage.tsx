import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Send, Thermometer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useAuth } from "@/auth/AuthProvider";
import {
  useStore,
  type Caliper,
  type FittingT,
  type InspectionReport,
  type PalletNew,
  type PalletStrength,
  type Rating3,
  type StampedT,
  type YesNo,
} from "@/store/tasks";
import { cn } from "@/lib/utils";

type FormState = Omit<InspectionReport, "id" | "submittedAt">;

const empty: FormState = {
  jobNumber: "",
  date: new Date().toISOString().slice(0, 10),
  supervisor: "",
  arrivalTime: "",
  departureTime: "",
  stationName: "",
  stationManager: "",
  orderSummary: "",
  productQualityNotes: "",
  caliperNotes: "",
  washingNotes: "",
  packingMaterialNotes: "",
  temperatureC: "",
  temperatureNotes: "",
  packingWeightSizeNotes: "",
  palletsCheckNotes: "",
  palletsConditionNotes: "",
  palletsPreparedWeight: "",
  palletsPreparedNotes: "",
  fittingNotes: "",
  storageCondition: "",
  loadingStart: "",
  loadingEnd: "",
  containerWashedNotes: "",
  testingTempCondition: "",
  finalLoadingDetails: "",
  inspectorName: "",
  signature: "",
  submittedById: "",
};

export function ChecklistPage() {
  const { t } = useI18n();
  const { addReport, currentEmployeeId, employees } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ ...empty, submittedById: currentEmployeeId });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Admins should review reports, not submit them
  useEffect(() => {
    if (isAdmin) {
      navigate({ to: "/reports" });
    }
  }, [isAdmin, navigate]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.jobNumber.trim() || !form.inspectorName.trim()) {
      setError(t.checklist.validation);
      return;
    }
    addReport({ ...form, submittedById: currentEmployeeId });
    setSuccess(true);
    setTimeout(() => navigate({ to: "/my-tasks" }), 1100);
  };

  const me = employees.find((e) => e.id === currentEmployeeId);

  return (
    <AppShell>
      <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-4xl mx-auto">
        <div className="flex items-start gap-4 mb-8">
          <div className="size-12 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {t.nav.checklist}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-1">
              {t.checklist.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {t.checklist.subtitle}
              {me ? ` · ${me.name}` : ""}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Job Information */}
          <Section title={t.checklist.jobInfo}>
            <Grid>
              <Text label={t.checklist.jobNumber} value={form.jobNumber} onChange={(v) => set("jobNumber", v)} required />
              <DateInput label={t.checklist.date} value={form.date} onChange={(v) => set("date", v)} />
              <Text label={t.checklist.supervisor} value={form.supervisor} onChange={(v) => set("supervisor", v)} />
              <TimeInput label={t.checklist.arrivalTime} value={form.arrivalTime} onChange={(v) => set("arrivalTime", v)} />
              <TimeInput label={t.checklist.departureTime} value={form.departureTime} onChange={(v) => set("departureTime", v)} />
            </Grid>
          </Section>

          {/* Station Details */}
          <Section title={t.checklist.stationDetails}>
            <Grid>
              <Text label={t.checklist.stationName} value={form.stationName} onChange={(v) => set("stationName", v)} />
              <Text label={t.checklist.stationManager} value={form.stationManager} onChange={(v) => set("stationManager", v)} />
            </Grid>
            <Field label={t.checklist.orderSummary}>
              <textarea
                rows={3}
                value={form.orderSummary}
                onChange={(e) => set("orderSummary", e.target.value)}
                className="textarea"
              />
            </Field>
          </Section>

          {/* Product Inspection */}
          <Section title={t.checklist.productInspection}>
            <Rating
              label={t.checklist.productQuality}
              options={[["fair", t.checklist.fair], ["good", t.checklist.good], ["excellent", t.checklist.excellent]]}
              value={form.productQuality}
              onChange={(v) => set("productQuality", v as Rating3)}
              notes={form.productQualityNotes}
              onNotes={(v) => set("productQualityNotes", v)}
              notesLabel={t.checklist.notes}
            />
            <Rating
              label={t.checklist.caliper}
              options={[["fair", t.checklist.fair], ["fit", t.checklist.fit], ["perfect", t.checklist.perfect]]}
              value={form.caliper}
              onChange={(v) => set("caliper", v as Caliper)}
              notes={form.caliperNotes}
              onNotes={(v) => set("caliperNotes", v)}
              notesLabel={t.checklist.notes}
            />
            <Rating
              label={t.checklist.washing}
              options={[["fair", t.checklist.fair], ["good", t.checklist.good], ["excellent", t.checklist.excellent]]}
              value={form.washing}
              onChange={(v) => set("washing", v as Rating3)}
              notes={form.washingNotes}
              onNotes={(v) => set("washingNotes", v)}
              notesLabel={t.checklist.notes}
            />
            <Rating
              label={t.checklist.packingMaterial}
              options={[["fair", t.checklist.fair], ["good", t.checklist.good], ["excellent", t.checklist.excellent]]}
              value={form.packingMaterial}
              onChange={(v) => set("packingMaterial", v as Rating3)}
              notes={form.packingMaterialNotes}
              onNotes={(v) => set("packingMaterialNotes", v)}
              notesLabel={t.checklist.notes}
            />
            <Rating
              label={
                <span className="inline-flex items-center gap-2">
                  <Thermometer className="size-4 text-urgent" /> {t.checklist.temperatureTreatment}
                </span>
              }
              options={[["fair", t.checklist.fair], ["good", t.checklist.good], ["excellent", t.checklist.excellent]]}
              value={form.temperatureTreatment}
              onChange={(v) => set("temperatureTreatment", v as Rating3)}
              notes={form.temperatureNotes}
              onNotes={(v) => set("temperatureNotes", v)}
              notesLabel={t.checklist.notes}
              extra={
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.checklist.temperature}
                    value={form.temperatureC}
                    onChange={(e) => set("temperatureC", e.target.value)}
                    className="w-40 input"
                  />
                  <span className="text-xs text-muted-foreground font-bold">°C</span>
                </div>
              }
            />
            <Rating
              label={t.checklist.packingWeightSize}
              options={[["fair", t.checklist.fair], ["good", t.checklist.good], ["excellent", t.checklist.excellent]]}
              value={form.packingWeightSize}
              onChange={(v) => set("packingWeightSize", v as Rating3)}
              notes={form.packingWeightSizeNotes}
              onNotes={(v) => set("packingWeightSizeNotes", v)}
              notesLabel={t.checklist.notes}
            />
          </Section>

          {/* Pallets */}
          <Section title={t.checklist.palletsInspection}>
            <Rating
              label={t.checklist.palletsCheck}
              options={[["stamped", t.checklist.stamped], ["not_stamped", t.checklist.notStamped]]}
              value={form.palletsCheck}
              onChange={(v) => set("palletsCheck", v as StampedT)}
              notes={form.palletsCheckNotes}
              onNotes={(v) => set("palletsCheckNotes", v)}
              notesLabel={t.checklist.notes}
            />

            <div className="space-y-3">
              <Rating
                label={t.checklist.palletsCondition}
                options={[["new", t.checklist.new], ["used", t.checklist.used]]}
                value={form.palletsConditionType}
                onChange={(v) => set("palletsConditionType", v as PalletNew)}
                notesLabel={t.checklist.notes}
              />
              <Rating
                label={`${t.checklist.palletsCondition} — ${t.checklist.fair}/${t.checklist.strong}/${t.checklist.excellent}`}
                options={[["fair", t.checklist.fair], ["strong", t.checklist.strong], ["excellent", t.checklist.excellent]]}
                value={form.palletsConditionStrength}
                onChange={(v) => set("palletsConditionStrength", v as PalletStrength)}
                notes={form.palletsConditionNotes}
                onNotes={(v) => set("palletsConditionNotes", v)}
                notesLabel={t.checklist.notes}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                {t.checklist.palletsPrepared}
              </p>
              <Grid>
                <Text
                  label={t.checklist.weight}
                  type="number"
                  value={form.palletsPreparedWeight}
                  onChange={(v) => set("palletsPreparedWeight", v)}
                />
                <Field label={t.checklist.wrapping}>
                  <Choice
                    value={form.palletsPreparedWrapping}
                    onChange={(v) => set("palletsPreparedWrapping", v as YesNo)}
                    options={[["yes", t.checklist.yes], ["no", t.checklist.no]]}
                  />
                </Field>
              </Grid>
              <Field label={t.checklist.notes}>
                <textarea
                  rows={2}
                  value={form.palletsPreparedNotes}
                  onChange={(e) => set("palletsPreparedNotes", e.target.value)}
                  className="textarea"
                />
              </Field>
            </div>

            <Rating
              label={t.checklist.fitting}
              options={[["strong", t.checklist.strong], ["not_strong", t.checklist.notStrong]]}
              value={form.fitting}
              onChange={(v) => set("fitting", v as FittingT)}
              notes={form.fittingNotes}
              onNotes={(v) => set("fittingNotes", v)}
              notesLabel={t.checklist.notes}
            />
          </Section>

          {/* Storage & Loading */}
          <Section title={t.checklist.storageLoading}>
            <Field label={t.checklist.storageCondition}>
              <textarea
                rows={2}
                value={form.storageCondition}
                onChange={(e) => set("storageCondition", e.target.value)}
                className="textarea"
              />
            </Field>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                {t.checklist.loadingTime}
              </p>
              <Grid>
                <TimeInput label={t.checklist.startAt} value={form.loadingStart} onChange={(v) => set("loadingStart", v)} />
                <TimeInput label={t.checklist.endAt} value={form.loadingEnd} onChange={(v) => set("loadingEnd", v)} />
              </Grid>
            </div>
            <Rating
              label={t.checklist.containerWashed}
              options={[["yes", t.checklist.yes], ["no", t.checklist.no]]}
              value={form.containerWashed}
              onChange={(v) => set("containerWashed", v as YesNo)}
              notes={form.containerWashedNotes}
              onNotes={(v) => set("containerWashedNotes", v)}
              notesLabel={t.checklist.notes}
            />
            <Field label={t.checklist.testingTempCondition}>
              <textarea
                rows={2}
                value={form.testingTempCondition}
                onChange={(e) => set("testingTempCondition", e.target.value)}
                className="textarea"
              />
            </Field>
            <Field label={t.checklist.finalLoadingDetails}>
              <textarea
                rows={3}
                value={form.finalLoadingDetails}
                onChange={(e) => set("finalLoadingDetails", e.target.value)}
                className="textarea"
              />
            </Field>
          </Section>

          {/* Signature */}
          <Section title={t.checklist.signature}>
            <Grid>
              <Text label={t.checklist.inspectorName} value={form.inspectorName} onChange={(v) => set("inspectorName", v)} required />
              <Text label={t.checklist.signatureField} value={form.signature} onChange={(v) => set("signature", v)} />
            </Grid>
          </Section>

          {error && (
            <div className="text-sm text-urgent bg-urgent-soft border border-urgent/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={success}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.15em] hover:opacity-90 transition shadow-elevated disabled:opacity-60"
          >
            {success ? (
              <>
                <CheckCircle2 className="size-4" /> {t.checklist.submitted}
              </>
            ) : (
              <>
                <Send className="size-4" /> {t.checklist.submit}
              </>
            )}
          </button>
        </form>

        <style>{`
          .input { width: 100%; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--color-foreground); outline: none; }
          .input:focus { box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 25%, transparent); border-color: var(--color-primary); }
          .textarea { width: 100%; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--color-foreground); outline: none; resize: vertical; }
          .textarea:focus { box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 25%, transparent); border-color: var(--color-primary); }
          input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        `}</style>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-3xl p-5 sm:p-7 shadow-soft space-y-5">
      <h2 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </Field>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: ReactNode;
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
        className="input"
      />
    </Field>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  const timePart = value.replace(/\s*(AM|PM)$/i, "").trim();
  const periodMatch = value.match(/\s*(AM|PM)$/i);
  const period = periodMatch ? periodMatch[1].toUpperCase() : "AM";

  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="00:00"
          value={timePart}
          onChange={(e) => onChange(e.target.value ? `${e.target.value} ${period}` : "")}
          className="input flex-1"
        />
        <div className="flex border border-border rounded-[0.75rem] p-1 gap-1 shrink-0 bg-background">
          <button
            type="button"
            onClick={() => onChange(timePart ? `${timePart} AM` : "")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
              period === "AM"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => onChange(timePart ? `${timePart} PM` : "12:00 PM")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
              period === "PM"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            PM
          </button>
        </div>
      </div>
    </Field>
  );
}

function Choice<T extends string>({
  value,
  onChange,
  options,
}: {
  value?: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<readonly [T, string]>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, label]) => {
        const active = value === k;
        return (
          <button
            type="button"
            key={k}
            onClick={() => onChange(k)}
            className={cn(
              "min-h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition flex items-center gap-2",
              active
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40",
            )}
          >
            <span
              className={cn(
                "size-3.5 rounded border-2 flex items-center justify-center",
                active ? "bg-background border-background" : "border-muted-foreground/40",
              )}
            >
              {active && <span className="size-1.5 rounded-sm bg-foreground" />}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Rating<T extends string>({
  label,
  options,
  value,
  onChange,
  notes,
  onNotes,
  notesLabel,
  extra,
}: {
  label: ReactNode;
  options: ReadonlyArray<readonly [T, string]>;
  value?: T;
  onChange: (v: T) => void;
  notes?: string;
  onNotes?: (v: string) => void;
  notesLabel: string;
  extra?: ReactNode;
}) {
  return (
    <div className="space-y-2 border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
      <p className="text-xs font-bold uppercase tracking-widest text-foreground">{label}</p>
      <Choice value={value} onChange={onChange} options={options} />
      {extra}
      {onNotes && (
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5 block mt-2">
            📝 {notesLabel}
          </span>
          <textarea
            rows={2}
            value={notes ?? ""}
            onChange={(e) => onNotes(e.target.value)}
            className="textarea"
          />
        </div>
      )}
    </div>
  );
}
