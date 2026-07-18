import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { completePersonalSpotifyConnection } from "@/lib/spotify.functions";

const Search = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/spotify/callback")({
  head: () => ({
    meta: [
      { title: "Spotify Connection | STREEX Rides" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search) => Search.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.error) return { state: "denied" as const };
    if (!deps.code || !deps.state) return { state: "invalid" as const };
    try {
      await completePersonalSpotifyConnection({ data: { code: deps.code, state: deps.state } });
      return { state: "connected" as const };
    } catch (error) {
      console.error("[Spotify callback] connection failed", error);
      return {
        state: "error" as const,
        message: error instanceof Error ? error.message : "Spotify connection failed.",
      };
    }
  },
  component: SpotifyCallbackPage,
});

function SpotifyCallbackPage() {
  const result = Route.useLoaderData();
  const connected = result.state === "connected";
  const title = connected
    ? "Spotify connected"
    : result.state === "denied"
      ? "Spotify access was cancelled"
      : "Spotify was not connected";
  const message = connected
    ? "The personal Spotify connection is ready. Return to the Passenger Console."
    : result.state === "error"
      ? result.message
      : "Return to the driver setup screen and start again.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
          STREEX Rides
        </p>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{message}</p>
        <Link
          to="/passenger"
          className="mt-6 inline-flex rounded-full bg-[#E6CE20] px-6 py-3 text-sm font-semibold text-black"
        >
          Return to Passenger Console
        </Link>
      </section>
    </main>
  );
}
