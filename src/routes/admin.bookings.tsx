import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/streex/AdminPanel";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Admin — Bookings | Streex Rides" },
      { name: "description", content: "Internal booking management panel." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminPanel initialTab="bookings" />,
});
