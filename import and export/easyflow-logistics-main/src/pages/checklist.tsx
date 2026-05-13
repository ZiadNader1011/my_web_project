import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPage } from "@/components/pages/ChecklistPage";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Loading & Quality Check List — Modern Enterprise" },
      { name: "description", content: "Submit loading and quality inspection feedback." },
    ],
  }),
  component: ChecklistPage,
});
