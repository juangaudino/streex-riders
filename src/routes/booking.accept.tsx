import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { acceptBooking } from "@/lib/booking.functions";
import { BookingResponseShell } from "@/components/streex/BookingResponseShell";

const Search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/booking/accept")({
  head: () => ({
    meta: [
      { title: "Ride Confirmed | Streex Rides" },
      { name: "description", content: "Your Streex ride has been confirmed." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s) => Search.parse(s),
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps }) => {
    if (!deps.id) return { state: "not_found" as const };
    try {
      const result = await acceptBooking({ data: { id: deps.id } });
      if (result.status === "not_found") return { state: "not_found" as const };
      if (result.status === "already_processed")
        return { state: "already" as const };
      return { state: "ok" as const };
    } catch {
      return { state: "error" as const };
    }
  },
  component: AcceptPage,
});

function AcceptPage() {
  const { state } = Route.useLoaderData();
  return <BookingResponseShell variant={state === "ok" ? "accepted" : state} />;
}