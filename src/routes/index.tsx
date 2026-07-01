import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/brand/streex-rides-transparent.webp";
import { CONFIG, type AppConfig } from "@/config";
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
import { getPublicSiteConfig } from "@/lib/site-config.functions";
import { ServiceAreas } from "@/components/streex/ServiceAreas";
import { FrequentlyAskedQuestions } from "@/components/streex/FrequentlyAskedQuestions";

const SPLASH_SESSION_KEY = "streex_splash_seen_v1";

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
    links: [{ rel: "canonical", href: "https://rides.getstreex.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "TaxiService"],
          name: CONFIG.brandName,
          description: CONFIG.seoDescription,
          url: CONFIG.seoUrl,
          logo: `${CONFIG.website}${CONFIG.logoSrc}`,
          image: CONFIG.ogImage,
          telephone: CONFIG.phone,
          email: CONFIG.email,
          founder: {
            "@type": "Person",
            name: CONFIG.ownerName,
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Salt Lake City",
            addressRegion: "UT",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 40.7608,
            longitude: -111.891,
          },
          areaServed: [
            {
              "@type": "City",
              name: "Salt Lake City",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Park City",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "Airport",
              name: "Salt Lake City International Airport",
              iataCode: "SLC",
            },
            {
              "@type": "City",
              name: "Ogden",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Farmington",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Layton",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Clearfield",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "South Salt Lake",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Sandy",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Draper",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Provo",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Lehi",
              containedInPlace: { "@type": "State", name: "Utah" },
            },
            {
              "@type": "City",
              name: "Las Vegas",
              containedInPlace: { "@type": "State", name: "Nevada" },
            },
            {
              "@type": "State",
              name: "Idaho",
            },
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "06:00",
              closes: "22:00",
            },
          ],
          serviceType: [
            "Airport Transfers",
            "SLC Airport Private Rides",
            "Park City Private Transportation",
            "Ski Resort Transportation",
            "Scheduled Rides",
            "Hourly Service",
            "Corporate Travel",
            "Private Events",
            "Long Distance",
            "Las Vegas Private Rides",
            "Idaho Private Rides",
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
  const [siteConfig, setSiteConfig] = useState<AppConfig>(CONFIG);

  useEffect(() => {
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // The splash still works when browser storage is unavailable.
    }

    const fadeT = setTimeout(() => setFadingOut(true), 1250);
    const hideT = setTimeout(() => setShowSplash(false), 1700);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const result = await getPublicSiteConfig();
        if (!cancelled) setSiteConfig(result.config);
      } catch (error) {
        console.warn("[Index] Using fallback config.", error);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen text-white streex-frame">
      {showSplash && (
        <div data-streex-splash className={fadingOut ? "streex-fade-out" : ""}>
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
            alt={siteConfig.brandName}
            className="h-auto streex-logo-glow"
            style={{ width: 192, display: "block", marginBottom: 12 }}
          />
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {(() => {
              const words = siteConfig.tagline.trim().split(/\s+/);
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
            {siteConfig.subheadline}
          </p>
        </section>

        {/* SERVICE TICKER */}
        <div className="mt-3">
          <ServiceTicker config={siteConfig} />
        </div>

        {/* QUICK ACTIONS */}
        <QuickActions config={siteConfig} />

        {/* PAYMENT OPTIONS */}
        {siteConfig.sections.paymentOptions && (
          <Reveal>
            <PaymentOptions config={siteConfig} />
          </Reveal>
        )}

        {/* FIND US */}
        {siteConfig.sections.findUs && <FindUsSection config={siteConfig} />}

        {/* EXPERIENCE GALLERY */}
        {siteConfig.sections.experienceGallery && (
          <Reveal>
            <ExperienceGallery />
          </Reveal>
        )}

        {/* OUR SERVICES */}
        {siteConfig.sections.servicesGrid && <ServicesSection config={siteConfig} />}

        {/* SERVICE AREAS */}
        {siteConfig.sections.serviceAreas && <ServiceAreas />}

        {/* REVIEWS */}
        {siteConfig.sections.reviews && (
          <Reveal>
            <Reviews />
          </Reveal>
        )}

        {/* ABOUT */}
        {siteConfig.sections.whyStreex && (
          <Reveal as="section" className="px-6 mt-16">
            <div className="streex-divider w-16 mb-5" />
            <h2 className="text-2xl font-bold mb-5">{siteConfig.whyStreexTitle}</h2>
            {siteConfig.whyStreexBody.map((p, i) => (
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

        {/* MEET JUAN */}
        {siteConfig.sections.meetJuan && <MeetJuan config={siteConfig} />}

        {/* FEEDBACK FORM */}
        {siteConfig.sections.feedbackForm && (
          <Reveal>
            <FeedbackForm />
          </Reveal>
        )}

        {/* FAQ */}
        {siteConfig.sections.faq && <FrequentlyAskedQuestions />}

        {/* FOOTER */}
        <footer className="px-6 mt-20 pt-10 pb-8 flex flex-col items-center text-center border-t border-white/5">
          <img src={logo} alt={siteConfig.brandName} className="h-10 w-auto mb-3 opacity-90" />
          <p className="text-[11px] uppercase streex-tracking text-white/60">
            {siteConfig.tagline}
          </p>
          <p className="mt-4 text-xs text-white/30">© 2026 {siteConfig.brandName}</p>
          <Link to="/privacy" className="mt-3 text-xs text-white/40 hover:text-white/70">
            Privacy Policy
          </Link>
        </footer>
      </main>
    </div>
  );
}
