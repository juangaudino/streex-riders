# STREEX Rides Project Context

## Purpose

STREEX Rides is the passenger-facing experience for Juan's premium private ride service. The product should feel elevated, trustworthy, personal, and hospitality-first rather than like a generic rideshare app.

Core brand colors:

- Deep black: `#0B0B0B`
- STREEX yellow: `#E6CE20`
- White: `#FFFFFF`

## Hosting And Backend

- The application deploys on Vercel at `https://rides.getstreex.com`.
- The backend is the standalone Supabase project already configured for STREEX Rides.
- Database changes are represented in `supabase/migrations/` and require a privileged Supabase account to apply.
- Sensitive values belong in Lovable secrets or local `.env`, never in Git.

Important temporary secret:

- `ADMIN_ACCESS_KEY`: emergency migration access only. Normal Admin access uses Supabase Auth plus database roles.

## Main Routes

- `/`: passenger landing experience
- `/{driver-slug}`: active driver landing page, such as `/driver2`
- `/admin`: internal control center
- `/admin/bookings`: Admin bookings view
- `/admin/reviews`: Admin reviews view
- `/runner-lab`: hidden, no-index STREEX Runner development route
- `/passenger`: no-index, in-vehicle Passenger Console for a vertically mounted tablet

## Main Systems

### Landing

The landing page is composed in `src/routes/index.tsx` using components under `src/components/streex/`.

Important areas include:

- Header and STREEX hero
- Service ticker with selectable theme
- Quick Actions
- Payment options
- More Ways to Connect
- Experience gallery
- Services
- Public approved reviews
- Meet Juan
- Passenger review submission

### Passenger Console

`/passenger` is an in-repo, tablet-first companion experience for passengers. It shares the
public STREEX configuration and brand assets, but is isolated from the booking landing and Admin
surfaces. Its Home, Music, Games and STREEX views are bilingual (English/Español) and must never
show passenger data.

- Music remains provider-neutral at the UI boundary. The optional personal Spotify POC is selected
  by public config, but remains disabled until `SPOTIFY_PERSONAL_INTEGRATION_ENABLED=true` is set
  server-side.
- The Spotify POC is intentionally personal and driver-mediated: its OAuth refresh token is
  AES-GCM encrypted in the private `spotify_connections` table (RLS enabled, no `anon` or
  `authenticated` grants), while the tablet receives only a signed HTTP-only session after a
  driver pairing code. Playback controls use the active Spotify Connect device and expose only
  sanitized track metadata; no Spotify credentials, account details, device name, or tokens reach
  the browser. Driver setup is at `/spotify/setup` and its OAuth callback is `/spotify/callback`.
- Utah Trivia and This or That are real bilingual, offline-capable Passenger games. Utah Trivia
  draws 10-question rounds from a bundled local question bank, gives immediate explanations and a
  final score. This or That presents 10 local preference choices and derives a playful ride vibe
  from that round only. Neither game stores passenger data or uses a backend. Their public
  activation switches live under `CONFIG.passengerConsole.games`.
- The STREEX actions reuse the real Rides experience: `BookingFormModal` for ride requests,
  `FeedbackForm` for passenger reviews, and shared public config for services. Contact details are
  informational on the shared tablet and never launch phone apps. Tips remain optional and use
  large QR codes so payment is completed on the passenger's own phone through configured public
  Venmo, Cash App or Stripe-hosted links. Apple Pay, Google Pay and cards share one clearly labeled
  Stripe-hosted checkout because Apple Pay has no direct public payment URL comparable to Venmo or
  Cash App. Never place tokens, PINs, credentials or personal data in Passenger config.
- Passenger has an isolated PWA manifest and service worker: it installs into `/passenger` in
  standalone portrait mode, caches only static UI assets, and has an offline recovery screen.
  It does not enforce Android kiosk mode, cache API data, or store passenger details.
- Passenger automatically resets transient UI and language after the CONFIG-driven idle interval,
  then remains on a bilingual branded attract screen until touched. The screen presents current
  Spotify artwork and track details, local time, dual-unit temperature and a compact host identity
  without altering the driver's connection or playback.
  Elapsed-time checks on visibility/focus recovery make the reset reliable after Android suspends
  the browser. The operational interval is two minutes on the official tablet.
- Passenger weather uses the public National Weather Service API through a fixed server function.
  Salt Lake City coordinates and refresh cadence are CONFIG-driven; sanitized hourly forecasts
  are cached server-side and the last successful snapshot is retained locally for hotspot outages.
  English displays Fahrenheit and Spanish displays Celsius. No API credential is required.
- Passenger Around You is a client-only local context engine under
  `src/features/passenger/around-you/`. It watches the tablet's browser geolocation only while the
  Passenger Console is mounted and the public feature flag is enabled, matches accepted positions
  against a bundled bilingual POI catalog, and exposes a stable featured place plus nearby places.
  Raw GPS coordinates are transient React/ref state only: they are never persisted, added to URLs,
  logged intentionally, sent to analytics, or transmitted to the server. The Luna product pass
  adds bilingual presentation, a bundled verified Utah catalog, local assets and offline-safe
  browsing without adding a map, provider, backend or analytics. It remains intentionally disabled
  until location permission and GPS behavior are validated on the Galaxy Tab A9+ in the vehicle.
  See `docs/AROUND_YOU_LUNA_HANDOFF.md` for the feature boundary and field-test requirements.
- Android kiosk enforcement belongs to Android/MDM/launcher. The web app may later add PWA cache
  and recovery behavior, but must not claim to enforce kiosk mode.
- Do not modify the Google Calendar integration for Passenger Console work.

### Admin

The Admin control center is implemented primarily in `src/components/streex/AdminPanel.tsx`.

Current Admin areas:

- Bookings
- Reviews
- Runner records
- Display themes

Privileged Admin actions use server functions, Supabase Auth and tenant membership checks.
`juangaudino@gmail.com` is the platform-only Super Admin, while `streex.rides@gmail.com` owns the
primary `streex` workspace. Both identities use `/admin`; their database roles determine the visible
workspaces and controls. See `docs/MULTI_TENANT_ADMIN.md`.

### Data

Primary tables:

- `bookings`: passenger ride requests
- `reviews`: passenger reviews with moderation status
- `runner_scores`: Runner records with moderation status
- `app_settings`: non-sensitive public UI settings such as ticker style
- `tenants`, `tenant_memberships`, `platform_admins`: workspace identity and authorization
- `calendar_connections`: encrypted per-tenant Google Calendar connections
- `audit_log`: sensitive platform actions

Expected public behavior:

- Passengers may submit bookings.
- Passengers may submit reviews as `pending`.
- The landing page only shows approved reviews.
- Runner score submissions go through a server function and are moderated before appearing publicly.
- Public clients must not receive broad Admin read, update, or delete access.

### Storage

Supabase Storage contains the public `tenant-assets` image bucket. Writes are isolated by tenant;
existing static assets remain valid fallbacks.

## Technical Stack

- React 19
- TanStack Start and TanStack Router
- TypeScript
- Vite
- Tailwind CSS
- Lovable Cloud / Supabase-compatible backend
- Bun package manager

## Product Guardrails

- Do not redesign STREEX during feature work.
- Keep the landing page focused on real passenger needs: booking, trust, contact, and discovery.
- Runner and future experiments must integrate into the STREEX ecosystem rather than compete with it.
- Prefer premium restraint over loud arcade, casino, crypto-app, or generic SaaS styling.
- Preserve mobile-first usability and safe-area behavior.
- Keep analytics limited to public passenger flows; never send booking contact details or ride
  addresses to third-party analytics.

## Analytics

- Google Analytics 4 measurement ID: `G-1WJPHXQKSN`.
- Analytics loads only in production and excludes `/admin`, `/passenger`, `/runner-lab` and
  `/spotify`. The permanently mounted tablet must not distort public Rides traffic.
- `booking_submitted` is the primary conversion/key event.
- Funnel and contact events are centralized through `src/lib/analytics.ts`.

## Automated Quality Checks

- GitHub Actions runs on pushes to `main` and pull requests.
- CI installs from `bun.lock` with Bun 1.3.14, then runs TypeScript, ESLint, the Bun test suite and
  the production build.

## Passenger Roadmap Order

1. Present Apple Pay, Google Pay and cards as payment methods within one Stripe-hosted Passenger
   checkout; do not duplicate that link as separate payment choices.
2. Apply the next visual improvements supplied and approved by the user.
3. Complete Passenger hardening in this order: restrict `/passenger` to the paired tablet, replace
   sample Meet Juan reviews with approved live reviews, run a full in-vehicle field test, and add
   Passenger UI end-to-end regression coverage.
4. Purchase Fully Kiosk PLUS and verify the permanent license on the Galaxy Tab A9+.
5. Run a small live Stripe tip and confirm the charge and payout path end to end.
6. Optionally test importing the saved Fully settings backup when a spare device or reinstall is
   available; do not risk the only configured tablet solely for this drill.

## Environment Notes

See `.env.example` for supported variable names. The code accepts Lovable-style and common Supabase-style environment variable aliases where appropriate.

When debugging local versus Lovable behavior, check:

1. Whether Lovable secrets are configured.
2. Whether local `.env` values exist.
3. Whether the relevant migration has been applied in Lovable Cloud.
4. Whether RLS and server-function behavior match the intended public/Admin boundary.
