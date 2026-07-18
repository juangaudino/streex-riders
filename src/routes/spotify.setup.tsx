import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pairPassengerConsole, startPersonalSpotifyConnection } from "@/lib/spotify.functions";

export const Route = createFileRoute("/spotify/setup")({
  head: () => ({
    meta: [
      { title: "Spotify Driver Setup | STREEX Rides" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SpotifySetupPage,
});

function SpotifySetupPage() {
  const [code, setCode] = useState("");
  const [paired, setPaired] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pair = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await pairPassengerConsole({ data: { code } });
      setCode("");
      setPaired(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not pair this console.");
    } finally {
      setBusy(false);
    }
  };

  const connect = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { authorizationUrl } = await startPersonalSpotifyConnection({ data: {} });
      window.location.assign(authorizationUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start Spotify connection.");
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
          Driver only
        </p>
        <h1 className="mt-3 text-2xl font-bold">Connect personal Spotify</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          This pairs only this tablet. Your Spotify credentials and tokens are never stored in the browser.
        </p>

        {!paired ? (
          <form className="mt-6 space-y-4" onSubmit={pair}>
            <label className="block text-sm font-medium text-white/80" htmlFor="driver-pairing-code">
              Driver pairing code
            </label>
            <input
              id="driver-pairing-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoComplete="one-time-code"
              className="h-12 w-full rounded-xl border border-white/15 bg-black/20 px-4 text-white outline-none focus:ring-2 focus:ring-[#E6CE20]/60"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#E6CE20] px-5 py-3 text-sm font-semibold text-black disabled:opacity-55"
            >
              {busy ? "Pairing…" : "Pair this tablet"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#E6CE20]/25 bg-[#E6CE20]/10 p-4">
            <p className="font-semibold text-[#E6CE20]">Tablet paired</p>
            <p className="mt-1 text-sm text-white/60">Continue to Spotify and approve access with your personal account.</p>
            <button
              type="button"
              disabled={busy}
              onClick={connect}
              className="mt-4 w-full rounded-full bg-[#E6CE20] px-5 py-3 text-sm font-semibold text-black disabled:opacity-55"
            >
              Continue to Spotify
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-red-300">{message}</p>}
        <Link to="/passenger" className="mt-6 inline-flex text-sm text-white/55 underline underline-offset-4">
          Return to Passenger Console
        </Link>
      </section>
    </main>
  );
}
