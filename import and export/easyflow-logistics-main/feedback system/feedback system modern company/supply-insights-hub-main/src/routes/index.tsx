import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { RatingScale } from "@/components/RatingScale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Send, Star, Lock } from "lucide-react";
import {
  RATING_GROUPS,
  newId,
  saveEntry,
  type FeedbackEntry,
} from "@/lib/feedback-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Client Feedback — Modern Enterprise" },
      {
        name: "description",
        content:
          "Share your feedback with Modern Enterprise. Your insights help us serve you better.",
      },
      { property: "og:title", content: "Client Feedback — Modern Enterprise" },
      {
        property: "og:description",
        content: "Share your feedback with Modern Enterprise.",
      },
    ],
  }),
  component: ClientForm,
});

function emptyRatings() {
  const r: Record<string, Record<string, number>> = {};
  RATING_GROUPS.forEach((g) => {
    r[g.key] = {};
    g.fields.forEach((f) => (r[g.key][f.key] = 0));
  });
  return r;
}

function ClientForm() {
  const [client, setClient] = useState({
    company: "",
    country: "",
    contact: "",
    email: "",
    orderNumber: "",
  });
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>(
    emptyRatings()
  );
  const [priceSuitability, setPriceSuitability] =
    useState<FeedbackEntry["priceSuitability"]>("");
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState({
    liked: "",
    improve: "",
    suggestions: "",
  });
  const [workAgain, setWorkAgain] = useState<FeedbackEntry["workAgain"]>("");
  const [recommend, setRecommend] = useState<FeedbackEntry["recommend"]>("");
  const [submitted, setSubmitted] = useState(false);

  const totalRatings = useMemo(() => {
    let total = 0;
    let filled = 0;
    RATING_GROUPS.forEach((g) =>
      g.fields.forEach((f) => {
        total++;
        if (ratings[g.key][f.key] > 0) filled++;
      })
    );
    return { total, filled };
  }, [ratings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating === 0) {
      toast.error("Please give an overall rating before submitting.");
      return;
    }
    const entry: FeedbackEntry = {
      id: newId(),
      createdAt: new Date().toISOString(),
      client,
      ratings,
      priceSuitability,
      overallRating,
      comments,
      workAgain,
      recommend,
    };
    saveEntry(entry);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader subtitle="Client Feedback" variant="white" />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Thank you for your feedback!
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            We sincerely appreciate the time you took to share your experience.
            Your insights help us continue to deliver excellence.
          </p>
          <Button
            className="mt-8"
            onClick={() => {
              setSubmitted(false);
              setClient({ company: "", country: "", contact: "", email: "", orderNumber: "" });
              setRatings(emptyRatings());
              setPriceSuitability("");
              setOverallRating(0);
              setComments({ liked: "", improve: "", suggestions: "" });
              setWorkAgain("");
              setRecommend("");
            }}
          >
            Submit another response
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader subtitle="Client Feedback Form" variant="white" />

      <section
        className="border-b border-border text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 text-left">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            We value your feedback
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Dear valued client, please take a moment to share your experience
            with us. Your honest feedback helps us improve our products and
            service.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name">
              <Input
                value={client.company}
                onChange={(e) => setClient({ ...client, company: e.target.value })}
                maxLength={120}
              />
            </Field>
            <Field label="Country">
              <Input
                value={client.country}
                onChange={(e) => setClient({ ...client, country: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Contact person">
              <Input
                value={client.contact}
                onChange={(e) => setClient({ ...client, contact: e.target.value })}
                maxLength={120}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                maxLength={150}
              />
            </Field>
            <Field label="Shipment / Order number" className="sm:col-span-2">
              <Input
                value={client.orderNumber}
                onChange={(e) => setClient({ ...client, orderNumber: e.target.value })}
                maxLength={80}
              />
            </Field>
          </CardContent>
        </Card>

        {RATING_GROUPS.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <CardTitle className="text-lg">{group.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Rate from 1 (poor) to 5 (excellent)
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {group.fields.map((field) => (
                <div
                  key={field.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <Label className="text-sm font-medium leading-snug">
                    {field.label}
                  </Label>
                  <RatingScale
                    name={field.label}
                    value={ratings[group.key][field.key]}
                    onChange={(v) =>
                      setRatings((r) => ({
                        ...r,
                        [group.key]: { ...r[group.key], [field.key]: v },
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price vs Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-sm font-medium">Price suitability</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["Excellent", "Good", "Fair", "Poor"] as const).map((opt) => (
                <Chip
                  key={opt}
                  active={priceSuitability === opt}
                  onClick={() => setPriceSuitability(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Rating</CardTitle>
            <p className="text-xs text-muted-foreground">Your overall experience</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setOverallRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="touch-manipulation rounded-full p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={
                      n <= overallRating
                        ? "h-9 w-9 fill-warning text-warning"
                        : "h-9 w-9 text-muted-foreground/40"
                    }
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comments & Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="What did you like most?">
              <Textarea
                rows={3}
                value={comments.liked}
                onChange={(e) => setComments({ ...comments, liked: e.target.value })}
                maxLength={1000}
              />
            </Field>
            <Field label="What can be improved?">
              <Textarea
                rows={3}
                value={comments.improve}
                onChange={(e) => setComments({ ...comments, improve: e.target.value })}
                maxLength={1000}
              />
            </Field>
            <Field label="Additional suggestions">
              <Textarea
                rows={3}
                value={comments.suggestions}
                onChange={(e) =>
                  setComments({ ...comments, suggestions: e.target.value })
                }
                maxLength={1000}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Future Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-sm font-medium">
                Would you like to work with us again?
              </Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Yes", "Maybe", "No"] as const).map((opt) => (
                  <Chip
                    key={opt}
                    active={workAgain === opt}
                    onClick={() => setWorkAgain(opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Would you recommend us?</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Yes", "No"] as const).map((opt) => (
                  <Chip
                    key={opt}
                    active={recommend === opt}
                    onClick={() => setRecommend(opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg sm:w-auto"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit feedback
          </Button>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin access
          </Link>
        </div>
      </form>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Modern Enterprise — 8 Ibn El Garah St, Cleopatra, Alexandria, Egypt</p>
        <p className="mt-1">info@modernsupplyeg.com · www.modernsupplyeg.com</p>
      </footer>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "min-h-11 touch-manipulation rounded-full border px-5 text-sm font-medium transition-all " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-background text-foreground hover:border-primary/50")
      }
    >
      {children}
    </button>
  );
}
