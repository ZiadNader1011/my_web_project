export const RATING_GROUPS = [
  {
    key: "product",
    title: "Product Quality",
    fields: [
      { key: "quality", label: "Product quality (taste / appearance / color)" },
      { key: "compliance", label: "Compliance with specifications" },
      { key: "freshness", label: "Freshness" },
      { key: "damage", label: "Damage or spoilage level" },
      { key: "satisfaction", label: "Overall satisfaction with product" },
    ],
  },
  {
    key: "packaging",
    title: "Packaging",
    fields: [
      { key: "outer", label: "Outer packaging quality" },
      { key: "protection", label: "Product protection during shipping" },
      { key: "appearance", label: "Packaging appearance" },
      { key: "label", label: "Label clarity" },
      { key: "market", label: "Suitability for market requirements" },
    ],
  },
  {
    key: "shipping",
    title: "Shipping & Delivery",
    fields: [
      { key: "ontime", label: "On-time delivery" },
      { key: "condition", label: "Condition upon arrival" },
      { key: "carrier", label: "Shipping company performance" },
      { key: "documents", label: "Accuracy of documents" },
    ],
  },
  {
    key: "service",
    title: "Service & Communication",
    fields: [
      { key: "response", label: "Response time" },
      { key: "professionalism", label: "Professionalism" },
      { key: "resolution", label: "Problem resolution" },
      { key: "flexibility", label: "Flexibility" },
      { key: "overallService", label: "Overall service satisfaction" },
    ],
  },
] as const;

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  client: {
    company: string;
    country: string;
    contact: string;
    email: string;
    orderNumber: string;
  };
  ratings: Record<string, Record<string, number>>;
  priceSuitability: "Excellent" | "Good" | "Fair" | "Poor" | "";
  overallRating: number;
  comments: {
    liked: string;
    improve: string;
    suggestions: string;
  };
  workAgain: "Yes" | "Maybe" | "No" | "";
  recommend: "Yes" | "No" | "";
};

const KEY = "modern_feedback_entries_v1";

export function loadEntries(): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEntry(entry: FeedbackEntry) {
  const list = loadEntries();
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteEntry(id: string) {
  const list = loadEntries().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function newId() {
  return `FB-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}
