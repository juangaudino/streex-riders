import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/streex/AdminPanel";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | Streex Admin" },
      { name: "description", content: "Internal Streex rate calculator and pricing settings." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminPanel initialTab="pricing" />,
});
