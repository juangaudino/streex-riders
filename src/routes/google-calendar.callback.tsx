import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { completeGoogleCalendarConnection } from "@/lib/calendar.functions";

const Search = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/google-calendar/callback")({
  head: () => ({
    meta: [
      { title: "Google Calendar Connection | Streex Rides" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search) => Search.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.error) return { state: "denied" as const };
    if (!deps.code || !deps.state) return { state: "invalid" as const };
    try {
      await completeGoogleCalendarConnection({ data: { code: deps.code, state: deps.state } });
      return { state: "connected" as const };
    } catch (error) {
      console.error("[Google Calendar callback] connection failed", error);
      return {
        state: "error" as const,
        message: error instanceof Error ? error.message : "Calendar connection failed.",
      };
    }
  },
  component: GoogleCalendarCallbackPage,
});

function GoogleCalendarCallbackPage() {
  const result = Route.useLoaderData();
  const connected = result.state === "connected";
  const title = connected
    ? "Google Calendar connected"
    : result.state === "denied"
      ? "Calendar access was cancelled"
      : "Google Calendar was not connected";
  const message = connected
    ? "Return to Admin Availability to select the calendars that block your schedule and choose the dedicated STREEX Rides calendar."
    : result.state === "error"
      ? result.message
      : "Return to Admin and start the connection again.";

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-6 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">
        <p className="text-[11px] uppercase streex-tracking text-[#E6CE20] font-semibold">
          STREEX Rides
        </p>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{message}</p>
        <Link
          to="/admin"
          className="mt-6 inline-flex rounded-full bg-[#E6CE20] px-6 py-3 text-sm font-semibold text-black"
        >
          Return to Admin
        </Link>
      </section>
    </main>
  );
}
