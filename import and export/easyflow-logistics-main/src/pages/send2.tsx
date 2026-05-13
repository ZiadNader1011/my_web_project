import { createFileRoute } from "@tanstack/react-router";
import { SendPage } from "@/components/pages/SendPage";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send Instruction — Modern Enterprise" },
      { name: "description", content: "Dispatch a new operational instruction to your team." },
    ],
  }),
  component: SendPage,
});
