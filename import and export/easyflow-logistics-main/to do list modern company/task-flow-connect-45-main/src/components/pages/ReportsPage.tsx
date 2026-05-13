import { useState } from "react";
import { ClipboardList, Printer, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/i18n/I18nProvider";
import { useStore, type InspectionReport } from "@/store/tasks";
import { useFormatters } from "@/lib/format";

export function ReportsPage() {
  const { t } = useI18n();
  const { reports, employees, deleteReport } = useStore();
  const fmt = useFormatters();
  const [open, setOpen] = useState<InspectionReport | null>(null);

  const nameFor = (id: string) =>
    employees.find((e) => e.id === id)?.name ?? id;

  return (
    <AppShell>
      <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-10 max-w-6xl mx-auto">
        <div className="flex items-start gap-4 mb-8">
          <div className="size-12 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {t.nav.reports}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-1">
              {t.checklist.reportsTitle}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{t.checklist.reportsSubtitle}</p>
          </div>
        </div>

        <div className="print:hidden">
          {reports.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-16 text-center shadow-soft">
              <p className="text-muted-foreground">{t.checklist.noReports}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((r) => (
                <article
                  key={r.id}
                  className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base uppercase tracking-widest text-muted-foreground font-bold">
                        {t.checklist.jobNumber} · {r.jobNumber || "—"}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-foreground mt-1.5 truncate">
                        {r.stationName || r.inspectorName || "Inspection Report"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {t.checklist.submittedBy}{" "}
                        <span className="text-foreground font-semibold">{nameFor(r.submittedById)}</span>{" "}
                        · {fmt.ago(r.submittedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(t.common.delete + "?")) deleteReport(r.id);
                      }}
                      className="size-9 rounded-full text-muted-foreground hover:bg-urgent-soft hover:text-urgent flex items-center justify-center"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <Mini label={t.checklist.productQuality} value={r.productQuality} />
                    <Mini label={t.checklist.caliper} value={r.caliper} />
                    <Mini label={t.checklist.temperature} value={r.temperatureC ? `${r.temperatureC}°C` : "—"} />
                  </div>
                  <button
                    onClick={() => setOpen(r)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90"
                  >
                    {t.checklist.open}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {open && <ReportModal report={open} onClose={() => setOpen(null)} nameFor={nameFor} />}
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-surface-muted rounded-xl p-2">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">{label}</div>
      <div className="text-xs font-bold text-foreground capitalize mt-0.5 truncate">
        {value ?? "—"}
      </div>
    </div>
  );
}

function ReportModal({
  report,
  onClose,
  nameFor,
}: {
  report: InspectionReport;
  onClose: () => void;
  nameFor: (id: string) => string;
}) {
  const { t } = useI18n();
  const fmt = useFormatters();
  const r = report;

  const Row = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/50 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground capitalize text-end">{value || "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-4 print:absolute print:inset-0 print:bg-white print:block print:p-0">
      <div className="bg-surface w-full max-w-3xl sm:rounded-3xl border border-border shadow-elevated overflow-hidden flex flex-col max-h-dvh print:max-h-none print:shadow-none print:border-0 print:block print:overflow-visible">
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border print:hidden">
          <h2 className="font-display text-lg font-bold text-foreground">{t.checklist.reportsTitle}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-accent"
            >
              <Printer className="size-3.5" /> {t.checklist.print}
            </button>
            <button
              onClick={onClose}
              className="size-9 rounded-full hover:bg-accent flex items-center justify-center"
              aria-label={t.checklist.close}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 text-sm print:overflow-visible print:h-auto print:p-0 print:block">
          <header className="flex flex-col items-start gap-4">
            <img src="https://i.postimg.cc/N0VY5rgN/logo-for-blal.jpg" alt="Company Logo" className="h-16 object-contain" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                MODERN ENTERPRISE — Loading & Quality Check List
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {t.checklist.submittedBy}: <strong>{nameFor(r.submittedById)}</strong> · {fmt.datetime(r.submittedAt)}
              </p>
            </div>
          </header>

          <Section title={t.checklist.jobInfo}>
            <Row label={t.checklist.jobNumber} value={r.jobNumber} />
            <Row label={t.checklist.date} value={fmt.date(r.date) || r.date} />
            <Row label={t.checklist.supervisor} value={r.supervisor} />
            <Row label={t.checklist.arrivalTime} value={r.arrivalTime} />
            <Row label={t.checklist.departureTime} value={r.departureTime} />
          </Section>

          <Section title={t.checklist.stationDetails}>
            <Row label={t.checklist.stationName} value={r.stationName} />
            <Row label={t.checklist.stationManager} value={r.stationManager} />
            <Row label={t.checklist.orderSummary} value={r.orderSummary} />
          </Section>

          <Section title={t.checklist.productInspection}>
            <Row label={t.checklist.productQuality} value={r.productQuality} />
            <Row label={`${t.checklist.productQuality} ${t.checklist.notes}`} value={r.productQualityNotes} />
            <Row label={t.checklist.caliper} value={r.caliper} />
            <Row label={`${t.checklist.caliper} ${t.checklist.notes}`} value={r.caliperNotes} />
            <Row label={t.checklist.washing} value={r.washing} />
            <Row label={`${t.checklist.washing} ${t.checklist.notes}`} value={r.washingNotes} />
            <Row label={t.checklist.packingMaterial} value={r.packingMaterial} />
            <Row label={`${t.checklist.packingMaterial} ${t.checklist.notes}`} value={r.packingMaterialNotes} />
            <Row label={t.checklist.temperatureTreatment} value={r.temperatureTreatment} />
            <Row label={t.checklist.temperature} value={r.temperatureC ? `${r.temperatureC}°C` : "—"} />
            <Row label={`${t.checklist.temperatureTreatment} ${t.checklist.notes}`} value={r.temperatureNotes} />
            <Row label={t.checklist.packingWeightSize} value={r.packingWeightSize} />
            <Row label={`${t.checklist.packingWeightSize} ${t.checklist.notes}`} value={r.packingWeightSizeNotes} />
          </Section>

          <Section title={t.checklist.palletsInspection}>
            <Row label={t.checklist.palletsCheck} value={r.palletsCheck?.replace("_", " ")} />
            <Row label={`${t.checklist.palletsCheck} ${t.checklist.notes}`} value={r.palletsCheckNotes} />
            <Row label={t.checklist.palletsCondition} value={r.palletsConditionType} />
            <Row label={`${t.checklist.palletsCondition} (${t.checklist.strong})`} value={r.palletsConditionStrength} />
            <Row label={`${t.checklist.palletsCondition} ${t.checklist.notes}`} value={r.palletsConditionNotes} />
            <Row label={`${t.checklist.palletsPrepared} — ${t.checklist.weight}`} value={r.palletsPreparedWeight ? `${r.palletsPreparedWeight} kg` : "—"} />
            <Row label={t.checklist.wrapping} value={r.palletsPreparedWrapping} />
            <Row label={`${t.checklist.palletsPrepared} ${t.checklist.notes}`} value={r.palletsPreparedNotes} />
            <Row label={t.checklist.fitting} value={r.fitting?.replace("_", " ")} />
            <Row label={`${t.checklist.fitting} ${t.checklist.notes}`} value={r.fittingNotes} />
          </Section>

          <Section title={t.checklist.storageLoading}>
            <Row label={t.checklist.storageCondition} value={r.storageCondition} />
            <Row label={t.checklist.startAt} value={r.loadingStart} />
            <Row label={t.checklist.endAt} value={r.loadingEnd} />
            <Row label={t.checklist.containerWashed} value={r.containerWashed} />
            <Row label={`${t.checklist.containerWashed} ${t.checklist.notes}`} value={r.containerWashedNotes} />
            <Row label={t.checklist.testingTempCondition} value={r.testingTempCondition} />
            <Row label={t.checklist.finalLoadingDetails} value={r.finalLoadingDetails} />
          </Section>

          <Section title={t.checklist.signature}>
            <Row label={t.checklist.inspectorName} value={r.inspectorName} />
            <Row label={t.checklist.signatureField} value={r.signature} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground border-b-2 border-foreground/80 pb-1 mb-2">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
