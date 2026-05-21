import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { declineBooking } from "@/lib/booking.functions";
import { BookingResponseShell } from "@/components/streex/BookingResponseShell";

const Search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/booking/decline")({
  validateSearch: (s) => Search.parse(s),
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps }) => {
    if (!deps.id) return { state: "not_found" as const };
    try {
      const result = await declineBooking({ data: { id: deps.id } });
      if (result.status === "not_found") return { state: "not_found" as const };
      if (result.status === "already_processed")
        return { state: "already" as const };
      return { state: "ok" as const };
    } catch {
      return { state: "error" as const };
    }
  },
  component: DeclinePage,
});

function DeclinePage() {
  const { state } = Route.useLoaderData();
  return <BookingResponseShell variant={state === "ok" ? "declined" : state} />;
}