import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  LogOut,
  Lock,
  Search,
  Trash2,
  Star,
  Inbox,
  Printer,
} from "lucide-react";
import {
  loadEntries,
  deleteEntry,
  type FeedbackEntry,
  RATING_GROUPS,
} from "@/lib/feedback-store";
import { toast } from "sonner";

const ADMIN_PASSWORD = "Modern@2026$";
const SESSION_KEY = "modern_admin_session_v1";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Modern Enterprise Feedback" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FeedbackEntry | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) setEntries(loadEntries());
  }, [authed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [
        e.client.company,
        e.client.country,
        e.client.contact,
        e.client.email,
        e.client.orderNumber,
        e.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [entries, query]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader subtitle="Admin area" />
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-semibold">Admin access</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter the admin password to view client feedback responses.
          </p>
          <form
            className="mt-8 w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd === ADMIN_PASSWORD) {
                sessionStorage.setItem(SESSION_KEY, "1");
                setAuthed(true);
                toast.success("Welcome back");
              } else {
                toast.error("Incorrect password");
              }
            }}
          >
            <div>
              <Label htmlFor="pwd">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-primary touch-manipulation"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate({ to: "/" })}
            >
              Back to feedback form
            </Button>
          </form>
        </main>
      </div>
    );
  }

  if (selected) {
    return (
      <FeedbackDetail
        entry={selected}
        onBack={() => setSelected(null)}
        onDelete={() => {
          deleteEntry(selected.id);
          setEntries(loadEntries());
          setSelected(null);
          toast.success("Response deleted");
        }}
      />
    );
  }

  const totalResponses = entries.length;
  const avgRating =
    totalResponses === 0
      ? "—"
      : (
        entries.reduce((s, e) => s + (e.overallRating || 0), 0) /
        totalResponses
      ).toFixed(1);
  const recommendCount = entries.filter((e) => e.recommend === "Yes").length;
  const recommendPct =
    totalResponses === 0
      ? "—"
      : `${Math.round((recommendCount / totalResponses) * 100)}%`;

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader subtitle="Admin · Feedback responses" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Feedback Submissions
            </h2>
            <p className="text-sm text-muted-foreground">
              All client responses, organized in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthed(false);
                setPwd("");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard label="Total responses" value={String(totalResponses)} />
          <StatCard label="Average rating" value={String(avgRating)} />
          <StatCard label="Would recommend" value={recommendPct} />
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, country, email, order #…"
            className="pl-9"
          />
        </div>

        <div className="mt-5 grid gap-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">No responses yet</p>
                <p className="text-sm text-muted-foreground">
                  Share the feedback link with your clients to start collecting
                  responses.
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((e) => (
              <Card
                key={e.id}
                className="transition-shadow hover:shadow-md"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">
                        {e.client.company || "Anonymous client"}
                      </p>
                      {e.client.country && (
                        <Badge variant="secondary">{e.client.country}</Badge>
                      )}
                      <span className="flex items-center gap-0.5 text-warning">
                        {Array.from({ length: e.overallRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {e.client.contact && <>{e.client.contact} · </>}
                      {e.client.email && <>{e.client.email} · </>}
                      {e.client.orderNumber && <>Order {e.client.orderNumber} · </>}
                      {new Date(e.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      ID: {e.id}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(e)}
                      aria-label="View"
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this response permanently?")) {
                          deleteEntry(e.id);
                          setEntries(loadEntries());
                          toast.success("Response deleted");
                        }
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FeedbackDetail({
  entry,
  onBack,
  onDelete,
}: {
  entry: FeedbackEntry;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="no-print">
        <BrandHeader subtitle="Feedback response" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="no-print mb-5 flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            ← Back to list
          </Button>
          <div className="ml-auto flex gap-2">
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (confirm("Delete this response permanently?")) onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card className="print-page">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Client Feedback</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted {new Date(entry.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">ID: {entry.id}</p>
              </div>
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: entry.overallRating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Section title="Client Information">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Info label="Company" value={entry.client.company} />
                <Info label="Country" value={entry.client.country} />
                <Info label="Contact person" value={entry.client.contact} />
                <Info label="Email" value={entry.client.email} />
                <Info
                  label="Order number"
                  value={entry.client.orderNumber}
                  full
                />
              </dl>
            </Section>

            {RATING_GROUPS.map((g) => (
              <Section key={g.key} title={g.title}>
                <ul className="divide-y divide-border rounded-md border">
                  {g.fields.map((f) => (
                    <li
                      key={f.key}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-semibold tabular-nums">
                        {entry.ratings[g.key]?.[f.key] || "—"}
                        <span className="text-muted-foreground"> / 5</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            ))}

            <Section title="Price vs Quality">
              <p className="text-sm">
                Price suitability:{" "}
                <span className="font-semibold">
                  {entry.priceSuitability || "—"}
                </span>
              </p>
            </Section>

            <Section title="Comments & Suggestions">
              <div className="space-y-3 text-sm">
                <Comment label="Liked most" value={entry.comments.liked} />
                <Comment label="To improve" value={entry.comments.improve} />
                <Comment
                  label="Suggestions"
                  value={entry.comments.suggestions}
                />
              </div>
            </Section>

            <Section title="Future Business">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Info label="Work with us again?" value={entry.workAgain} />
                <Info label="Would recommend?" value={entry.recommend} />
              </dl>
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Info({
  label,
  value,
  full,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ boxShadow: "var(--shadow-card)" }}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-primary tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Comment({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 p-3">
        {value || <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  );
}
