import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/pages/ReportsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Inspection Reports — Modern Enterprise" },
      { name: "description", content: "All check lists submitted by the team." },
    ],
  }),
  component: ReportsPage,
});
