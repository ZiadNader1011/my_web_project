import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/components/pages/TeamPage";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Modern Enterprise" },
      { name: "description", content: "Manage your global operations team." },
    ],
  }),
  component: TeamPage,
});
