import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/streex-logo.png";
import { Splash } from "@/components/streex/Splash";
import { Header } from "@/components/streex/Header";
import { QuickActions } from "@/components/streex/QuickActions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Streex Rides — Private rides. Elevated." },
      {
        name: "description",
        content:
          "Premium private rides across Salt Lake City & Park City. Reliable, comfortable and personalized transportation.",
      },
      { property: "og:title", content: "Streex Rides — Private rides. Elevated." },
      {
        property: "og:description",
        content:
          "Premium private rides across Salt Lake City & Park City. Reliable, comfortable and personalized transportation.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeT = setTimeout(() => setFadingOut(true), 1800);
    const hideT = setTimeout(() => setShowSplash(false), 2300);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {showSplash && (
        <div className={fadingOut ? "streex-fade-out" : ""}>
          <Splash />
        </div>
      )}

      <Header />

      <main className="mx-auto max-w-md pb-16">
        {/* HERO */}
        <section className="relative px-6 pb-6 flex flex-col items-center text-center overflow-hidden" style={{ paddingTop: 32 }}>
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(230,206,32,0.10) 0%, transparent 65%)",
            }}
          />
          <img src={logo} alt="Streex" className="h-auto" style={{ width: 192, marginBottom: 24 }} />
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Private rides.
            <br />
            <span className="text-[#E6CE20]">Elevated.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-xs">
            Premium private rides across Salt Lake City & Park City. Reliable,
            comfortable and personalized transportation — designed to elevate
            your journey.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-xs">
            {["Airport Rides", "Park City", "Ski Trips", "Scheduled Rides"].map((c) => (
              <span key={c} className="streex-chip">{c}</span>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <QuickActions />

        {/* ABOUT */}
        <section className="px-6 mt-16">
          <div className="streex-divider w-16 mb-5" />
          <h2 className="text-2xl font-bold mb-5">Why Streex</h2>
          <p className="text-[15px] leading-relaxed text-white/75">
            Streex was created to offer something different — a more thoughtful,
            comfortable and elevated transportation experience in Utah. Every
            ride is designed around you: your schedule, your comfort, your
            experience.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            Built by someone with a background in branding and technology,
            Streex is more than a ride. It's the beginning of a better way to
            move.
          </p>
        </section>

        {/* AREAS SERVED */}
        <section className="px-6 mt-16">
          <h2 className="text-[11px] uppercase streex-tracking text-white/50 font-semibold mb-4">
            Where We Ride
          </h2>
          <div className="space-y-2">
            {["Salt Lake City", "Park City", "SLC Airport", "Surrounding Utah Areas"].map((a) => (
              <div
                key={a}
                className="streex-glass px-5 py-4 flex items-center justify-between"
              >
                <span className="text-[15px] font-medium">{a}</span>
                <span className="h-2 w-2 rounded-full bg-[#E6CE20]" />
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-6 mt-20 pt-10 pb-8 flex flex-col items-center text-center border-t border-white/5">
          <img src={logo} alt="Streex" className="h-10 w-auto mb-3 opacity-90" />
          <p className="text-[11px] uppercase streex-tracking text-white/60">
            Private rides. Elevated.
          </p>
          <p className="mt-4 text-xs text-white/30">© 2025 Streex Rides</p>
        </footer>
      </main>
    </div>
  );
}
