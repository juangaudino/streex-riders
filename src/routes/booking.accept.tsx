import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  acceptBooking,
  getBookingResponseState,
  type BookingResponseState,
} from "@/lib/booking.functions";
import { BookingResponseShell } from "@/components/streex/BookingResponseShell";

const Search = z.object({
  id: z.string().optional(),
  token: z.string().trim().max(4096).optional(),
});

export const Route = createFileRoute("/booking/accept")({
  head: () => ({
    meta: [
      { title: "Confirm Your Ride | Streex Rides" },
      { name: "description", content: "Confirm your Streex ride when you are ready." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s) => Search.parse(s),
  loaderDeps: ({ search: { id, token } }) => ({ id, token }),
  loader: async ({ deps }) => {
    if (!deps.token) return { state: deps.id ? ("legacy" as const) : ("not_found" as const) };
    try {
      return {
        state: await getBookingResponseState({ data: { token: deps.token, action: "accept" } }),
      };
    } catch {
      return { state: "error" as const };
    }
  },
  component: AcceptPage,
});

function AcceptPage() {
  const { state: initialState } = Route.useLoaderData();
  const { token } = Route.useSearch();
  const [state, setState] = useState<
    BookingResponseState | "accepted" | "legacy" | "not_found" | "error"
  >(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const respond = async () => {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await acceptBooking({ data: { token } });
      setState(
        result.status === "confirmed"
          ? "accepted"
          : result.status === "already_processed"
            ? "already"
            : "expired",
      );
    } catch {
      setState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingResponseShell
      variant={state}
      action="accept"
      isSubmitting={isSubmitting}
      onRespond={state === "ready" ? respond : undefined}
    />
  );
}
