import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/streex-logo.webp";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";
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
      { title: CONFIG.seoTitle },
      { name: "description", content: CONFIG.seoDescription },
      { property: "og:title", content: CONFIG.seoTitle },
      { property: "og:description", content: CONFIG.seoDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CONFIG.seoUrl },
      { property: "og:site_name", content: CONFIG.brandName },
      { property: "og:image", content: CONFIG.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: CONFIG.seoTitle },
      { name: "twitter:description", content: CONFIG.seoDescription },
      { name: "twitter:image", content: CONFIG.ogImage },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "TaxiService"],
          name: CONFIG.brandName,
          description: CONFIG.seoDescription,
          url: CONFIG.seoUrl,
          telephone: CONFIG.phone,
          email: CONFIG.email,
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
          sameAs: [CONFIG.instagramUrl],
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
        <section
          className="relative px-6 pb-6 flex flex-col items-center text-center"
          style={{ paddingTop: 16 }}
        >
          <img
            src={logo}
            alt={CONFIG.brandName}
            className="h-auto streex-logo-glow"
            style={{ width: 192, display: "block", marginBottom: 12 }}
          />
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {(() => {
              const words = CONFIG.tagline.trim().split(/\s+/);
              const last = words.pop() ?? "";
              const first = words.join(" ");
              return (
                <>
                  {first}
                  <br />
                  <span className="text-[#E6CE20]">{last}</span>
                </>
              );
            })()}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-xs">
            {CONFIG.subheadline}
          </p>
        </section>

        {/* SERVICE TICKER */}
        <div className="mt-3">
          <ServiceTicker />
        </div>

        {/* QUICK ACTIONS */}
        <QuickActions />

        {/* PAYMENT OPTIONS */}
        {CONFIG.sections.paymentOptions && (
          <Reveal>
            <PaymentOptions />
          </Reveal>
        )}

        {/* FIND US */}
        {CONFIG.sections.findUs && <FindUsSection />}

        {/* EXPERIENCE GALLERY */}
        {CONFIG.sections.experienceGallery && (
          <Reveal>
            <ExperienceGallery />
          </Reveal>
        )}

        {/* OUR SERVICES */}
        {CONFIG.sections.servicesGrid && <ServicesSection />}

        {/* REVIEWS */}
        {CONFIG.sections.reviews && (
          <Reveal>
            <Reviews />
          </Reveal>
        )}

        {/* ABOUT */}
        {CONFIG.sections.whyStreex && (
          <Reveal as="section" className="px-6 mt-16">
            <div className="streex-divider w-16 mb-5" />
            <h2 className="text-2xl font-bold mb-5">{CONFIG.whyStreexTitle}</h2>
            {CONFIG.whyStreexBody.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[15px] leading-relaxed text-white/75"
                    : "mt-4 text-[15px] leading-relaxed text-white/75"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
        )}

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
        {CONFIG.sections.meetJuan && <MeetJuan />}

        {/* FEEDBACK FORM */}
        {CONFIG.sections.feedbackForm && (
          <Reveal>
            <FeedbackForm />
          </Reveal>
        )}

        {/* FOOTER */}
        <footer className="px-6 mt-20 pt-10 pb-8 flex flex-col items-center text-center border-t border-white/5">
          <img src={logo} alt={CONFIG.brandName} className="h-10 w-auto mb-3 opacity-90" />
          <p className="text-[11px] uppercase streex-tracking text-white/60">{CONFIG.tagline}</p>
          <p className="mt-4 text-xs text-white/30">© 2026 {CONFIG.brandName}</p>
        </footer>
      </main>
    </div>
  );
}
