import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/streex-logo.png";
import { Splash } from "@/components/streex/Splash";
import { Header } from "@/components/streex/Header";
import { QuickActions } from "@/components/streex/QuickActions";
import { ExperienceGallery } from "@/components/streex/ExperienceGallery";
import { ServicesSection } from "@/components/streex/ServicesSection";
import { Reviews } from "@/components/streex/Reviews";
import { FeedbackForm } from "@/components/streex/FeedbackForm";
import { MeetJuan } from "@/components/streex/MeetJuan";
import { PaymentOptions } from "@/components/streex/PaymentOptions";
import { FindUsSection } from "@/components/streex/FindUsSection";
import { ServiceTicker } from "@/components/streex/ServiceTicker";
import { Reveal } from "@/components/streex/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Streex Rides — Private rides. Elevated." },
      {
        name: "description",
        content:
          "Premium private transportation across Salt Lake City & Park City. Airport rides, ski trips, scheduled rides and more.",
      },
      { property: "og:title", content: "Streex Rides — Private rides. Elevated." },
      {
        property: "og:description",
        content:
          "Premium private transportation across Salt Lake City & Park City. Airport rides, ski trips, scheduled rides and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://streexrides.lovable.app" },
      { property: "og:site_name", content: "Streex Rides" },
      { property: "og:image", content: "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/streex-og-preview.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Streex Rides — Private rides. Elevated." },
      { name: "twitter:description", content: "Premium private transportation across Salt Lake City & Park City. Airport rides, ski trips, scheduled rides and more." },
      { name: "twitter:image", content: "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/streex-og-preview.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "TaxiService"],
          name: "Streex Rides",
          description:
            "Premium private transportation across Salt Lake City and Park City. Airport rides, ski trips, scheduled rides and hourly service.",
          url: "https://streex-riders.lovable.app",
          telephone: "+18017974971",
          email: "streex.rides@gmail.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Salt Lake City",
            addressRegion: "UT",
            addressCountry: "US",
          },
          areaServed: [
            "Salt Lake City",
            "Park City",
            "Salt Lake City International Airport",
            "Utah",
          ],
          serviceType: [
            "Airport Transfers",
            "Scheduled Rides",
            "Hourly Service",
            "Corporate Travel",
            "Private Events",
            "Long Distance",
          ],
          priceRange: "$$",
          availableLanguage: ["English", "Spanish"],
          sameAs: ["https://instagram.com/streex.rides"],
        }),
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
    <div className="min-h-screen text-white streex-frame">
      {showSplash && (
        <div className={fadingOut ? "streex-fade-out" : ""}>
          <Splash />
        </div>
      )}

      <Header />

      <main className="mx-auto max-w-md pb-16">
        {/* HERO */}
        <section className="relative px-6 pb-6 flex flex-col items-center text-center" style={{ paddingTop: 16 }}>
          <img
            src={logo}
            alt="Streex"
            className="h-auto streex-logo-glow"
            style={{ width: 192, display: "block", marginBottom: 12 }}
          />
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
        </section>

        {/* SERVICE TICKER */}
        <div className="mt-3">
          <ServiceTicker />
        </div>

        {/* QUICK ACTIONS */}
        <QuickActions />

        {/* PAYMENT OPTIONS */}
        <Reveal><PaymentOptions /></Reveal>

        {/* FIND US */}
        <FindUsSection />

        {/* EXPERIENCE GALLERY */}
        <Reveal><ExperienceGallery /></Reveal>

        {/* OUR SERVICES */}
        <ServicesSection />

        {/* REVIEWS */}
        <Reveal><Reviews /></Reveal>

        {/* ABOUT */}
        <Reveal as="section" className="px-6 mt-16">
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
        </Reveal>

        {/* WHERE WE RIDE — hidden for now, restore when needed */}
        {/* <section className="px-6 mt-16">
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
        </section> */}

        {/* MEET JUAN */}
        <MeetJuan />

        {/* FEEDBACK FORM */}
        <Reveal><FeedbackForm /></Reveal>

        {/* FOOTER */}
        <footer className="px-6 mt-20 pt-10 pb-8 flex flex-col items-center text-center border-t border-white/5">
          <img src={logo} alt="Streex" className="h-10 w-auto mb-3 opacity-90" />
          <p className="text-[11px] uppercase streex-tracking text-white/60">
            Private rides. Elevated.
          </p>
          <p className="mt-4 text-xs text-white/30">© 2026 Streex Rides</p>
        </footer>
      </main>
    </div>
  );
}
