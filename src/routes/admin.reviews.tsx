import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/streex/AdminPanel";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Admin — Reviews | Streex Rides" },
      { name: "description", content: "Internal review moderation panel." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminPanel initialTab="reviews" />,
});
