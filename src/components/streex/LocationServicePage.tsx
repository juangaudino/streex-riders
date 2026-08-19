import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Check, Phone } from "lucide-react";
import { useState } from "react";
import type { AppConfig } from "@/config";
import { trackEvent } from "@/lib/analytics";
import type { LocationPageContent } from "@/lib/location-pages";
import { BookingFormModal } from "./BookingFormModal";
import { TenantProvider } from "./TenantContext";

type TenantContext = {
  id: string;
  slug: string;
  previewToken?: string;
};

export function LocationServicePage({
  config,
  tenant,
  page,
}: {
  config: AppConfig;
  tenant: TenantContext;
  page: LocationPageContent;
}) {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <TenantProvider
      value={{ tenantId: tenant.id, tenantSlug: tenant.slug, previewToken: tenant.previewToken }}
    >
      <div className="min-h-screen text-white streex-frame">
        <main className="mx-auto max-w-md px-6 pb-16 pt-7">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Streex Rides
          </Link>

          <section className="mt-10">
            <img src={config.logoSrc} alt={config.brandName} className="h-10 w-auto" />
            <div className="streex-divider mt-10 w-16" />
            <p className="mt-5 text-[11px] font-semibold uppercase streex-tracking text-[#E6CE20]">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">{page.serviceName}</h1>
            <p className="mt-5 text-[16px] leading-relaxed text-white/75">{page.intro}</p>
          </section>

          <section className="streex-glass mt-8 p-5" aria-label="Route served">
            <p className="text-[10px] font-semibold uppercase streex-tracking text-white/45">Route</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{page.route}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Planned around your ride.</h2>
            <ul className="mt-5 space-y-4">
              {page.details.map((detail) => (
                <li key={detail} className="flex gap-3 text-sm leading-relaxed text-white/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E6CE20]" aria-hidden="true" />
                  {detail}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">A good fit for</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {page.bestFor.map((item) => (
                <div key={item} className="streex-glass p-4 text-sm leading-snug text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 border-t border-white/10 pt-9">
            <h2 className="text-2xl font-bold">Request your ride</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Submit the route and timing you need. Streex will review availability and send a
              personal quote before the ride is confirmed.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  trackEvent("location_page_booking_opened", { location: page.slug });
                  setBookingOpen(true);
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#E6CE20] px-4 text-sm font-semibold text-black transition-transform active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Request ride
              </button>
              <a
                href={`tel:${config.phone}`}
                onClick={() => trackEvent("location_page_call_clicked", { location: page.slug })}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:border-white/50"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call Streex
              </a>
            </div>
          </section>

          <section className="mt-14 border-t border-white/10 pt-9">
            <p className="text-[11px] font-semibold uppercase streex-tracking text-[#E6CE20]">FAQs</p>
            <div className="mt-5 space-y-6">
              {page.questions.map(({ question, answer }) => (
                <div key={question}>
                  <h2 className="text-base font-semibold text-white">{question}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-16 border-t border-white/10 pt-8 text-center">
            <p className="text-[11px] uppercase streex-tracking text-white/55">{config.tagline}</p>
            <p className="mt-3 text-xs text-white/35">© 2026 {config.brandName}</p>
            <Link to="/privacy" className="mt-3 inline-block text-xs text-white/45 hover:text-white/70">
              Privacy Policy
            </Link>
          </footer>
        </main>
      </div>
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </TenantProvider>
  );
}
