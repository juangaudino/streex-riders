import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/streex/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Streex Rides" },
      { name: "description", content: "Internal Streex admin control center." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminPanel />,
});
