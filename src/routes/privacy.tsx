import { createFileRoute, Link } from "@tanstack/react-router";
import { CONFIG } from "@/config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Streex Rides" },
      {
        name: "description",
        content: "How Streex Rides handles booking, website, and Google Calendar information.",
      },
    ],
    links: [{ rel: "canonical", href: "https://rides.getstreex.com/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-12 text-white">
      <article className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-[#E6CE20] hover:underline">
          ← Streex Rides
        </Link>
        <p className="mt-10 text-[11px] uppercase streex-tracking text-[#E6CE20] font-semibold">
          Privacy
        </p>
        <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-xs text-white/40">Last updated June 30, 2026</p>

        <div className="mt-10 space-y-9 text-sm leading-relaxed text-white/70">
          <PolicySection title="Information you provide">
            When you request a ride or submit feedback, Streex may collect information such as your
            name, phone number, email address, pickup and destination, requested date and time,
            passenger count, notes, rating, and message. This information is used to review, quote,
            coordinate, and provide the requested service.
          </PolicySection>

          <PolicySection title="Website analytics">
            Streex uses Google Analytics to understand visits and actions such as opening or
            submitting a booking request. Analytics events are designed not to include passenger
            names, phone numbers, email addresses, pickup addresses, or destinations.
          </PolicySection>

          <PolicySection title="Google Calendar data">
            If the owner connects Google Calendar from the protected Admin area, Streex accesses
            calendar names and free/busy time to prevent scheduling conflicts. Confirmed Streex
            rides may be created and maintained in the calendar selected by the owner. OAuth refresh
            tokens are encrypted before storage and are never exposed to passengers or public
            website visitors.
          </PolicySection>

          <PolicySection title="How information is shared">
            Streex does not sell personal information. Information may be processed by service
            providers needed to operate the website, scheduling, email, analytics, and hosting,
            subject to their applicable terms and privacy practices. Information may also be
            disclosed when required by law or necessary to protect the service and its users.
          </PolicySection>

          <PolicySection title="Retention and security">
            Information is retained only as reasonably needed for operations, records, security, and
            legal obligations. Streex uses access controls and reasonable technical safeguards, but
            no internet or storage system can be guaranteed completely secure.
          </PolicySection>

          <PolicySection title="Your choices">
            You may request access, correction, or deletion of personal information by contacting
            Streex. The owner may disconnect Google Calendar from Admin, which revokes the app's
            authorization and removes the stored connection.
          </PolicySection>

          <PolicySection title="Contact">
            Questions or privacy requests can be sent to{" "}
            <a className="text-[#E6CE20] hover:underline" href={"mailto:" + CONFIG.email}>
              {CONFIG.email}
            </a>
            .
          </PolicySection>
        </div>
      </article>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
