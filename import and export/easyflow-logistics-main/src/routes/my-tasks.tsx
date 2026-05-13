import { createFileRoute } from "@tanstack/react-router";
import { MyTasksPage } from "@/components/pages/MyTasksPage";

export const Route = createFileRoute("/my-tasks")({
  head: () => ({
    meta: [
      { title: "My Instructions — Modern Enterprise" },
      { name: "description", content: "Today's instructions assigned to you." },
    ],
  }),
  component: MyTasksPage,
});
