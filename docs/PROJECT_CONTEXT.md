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

Admin access uses Supabase Auth plus database roles. Production has no emergency Admin bypass key.

## Main Routes

- `/`: passenger landing experience
- `/request-a-ride`: direct, no-index booking entry point for business profiles, ads and QR codes
- `/slc-airport-private-rides`: SLC Airport service page
- `/park-city-private-transportation`: Park City service page
- `/las-vegas-private-rides`: Las Vegas long-distance service page
- `/{driver-slug}`: active driver landing page, such as `/driver2`
- `/admin`: internal control center
- `/admin/bookings`: Admin bookings view
- `/admin/reviews`: Admin reviews view
- `/runner-lab`: hidden, no-index STREEX Runner development route
- `/passenger`: no-index, landscape-first in-vehicle Passenger Console for the mounted tablet

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
- Utah Trivia, This or That and Utah: Higher or Lower are bilingual, offline-capable Passenger
  games. Utah Trivia and Higher or Lower each use 10-question local rounds, visible 10-second
  timers, immediate explanations and final scores; timed-out questions advance automatically.
  This or That deliberately remains untimed and derives a playful ride vibe from 10 local
  preferences. The games store only a local recent-question cycle to reduce repetition; none use
  passenger data or a backend. Their public activation switches live under
  `CONFIG.passengerConsole.games`.
- The STREEX actions reuse the real Rides experience: `BookingFormModal` for ride requests,
  `FeedbackForm` for passenger reviews, and shared public config for services. Contact details are
  informational on the shared tablet and never launch phone apps. Tips remain optional and use
  large QR codes so payment is completed on the passenger's own phone through configured public
  Venmo, Cash App or Stripe-hosted links. Apple Pay, Google Pay and cards share one clearly labeled
  Stripe-hosted checkout because Apple Pay has no direct public payment URL comparable to Venmo or
  Cash App. Never place tokens, PINs, credentials or personal data in Passenger config.
- Passenger has an isolated PWA manifest and service worker: it installs into `/passenger` in
  standalone mode with no forced orientation, caches only static UI assets, and has an offline
  recovery screen. Product validation currently prioritizes landscape; portrait is deferred until
  explicitly resumed.
  It does not enforce Android kiosk mode, cache API data, or store passenger details.
- Passenger automatically resets transient UI and language after the CONFIG-driven idle interval,
  then remains on a bilingual branded attract screen until touched. The screen presents current
  Spotify artwork and track details, local time, dual-unit temperature and a compact host identity
  without altering the driver's connection or playback.
  Elapsed-time checks on visibility/focus recovery make the reset reliable after Android suspends
  the browser. RELOAD 1.0 Lite beta uses a 90-second inactivity cadence; its lower rail rotates
  every 30 seconds through current weather plus the next four hours, current weather plus the
  next four days, one rotating active game, the
  `rides.getstreex.com` QR and useful Streex calls. The selected game changes only on the next
  complete rail cycle, never as consecutive game panels.
  In Lite, Music is the only published idle hero; Around You remains intentionally unpublished as an idle variant until its
  compact companion layout is redesigned.
- Passenger is currently configured as `experienceMode: "lite"`: its primary navigation shows
  Home, Music, Games and STREEX. Around You remains available from its Home card and all of its
  privacy-preserving local engine code remains intact, but it is not a first-level navigation
  destination. The persistent Lite/Complete switch belongs in authenticated Admin configuration;
  a future Driver MC may later activate a session-specific Complete experience without changing
  the global default.
- Passenger Lite supports the color-only `Original` and `STREEX Accent` launch themes through
  `CONFIG.passengerConsole.liteTheme`. Accent is the launch default; changing that one public
  config value restores Original. This is the current launch mechanism. It will be migrated later
  into the approved `visualTheme` registry; it must not coexist indefinitely as a second theme
  system.
- Planned, not yet implemented, Passenger experience model: three independent layers. `experienceMode`
  selects `lite`, future `complete`, or future `kids`; session personalization can add a bounded
  greeting/context only after a trusted Driver MC signal; and `visualTheme` controls presentation
  tokens only. Quiet, Guest and Test are future Driver MC session controls, not experience modes.
  The current Lite/Accent behavior remains unchanged until that roadmap item begins.
- The approved Passenger Music Reload visual pass is implemented: Music has the restored hierarchy,
  artwork-led now playing, dynamic album glow, stage-light accents and the approved idle treatment.
  Spotify remains the source of truth for playback and metadata.
- Passenger weather uses the public National Weather Service API through a fixed server function.
  Salt Lake City coordinates and refresh cadence are CONFIG-driven; sanitized hourly forecasts
  are cached server-side and the last successful snapshot is retained locally for hotspot outages.
  English displays Fahrenheit and Spanish displays Celsius. No API credential is required.
- The approved Passenger Climate Premium visual pass is implemented: the weather detail surface,
  Home companion and idle weather rail share the atmospheric states and test override. Future work
  is hardening and tuning, not a new first-pass weather redesign.
- Passenger Around You is a client-only local context engine under
  `src/features/passenger/around-you/`. It takes a low-power browser location snapshot only while
  Home or Around You is visible (never in Music, Games, STREEX or idle), then at most every five
  minutes. It matches accepted positions against a bundled bilingual POI catalog and exposes a
  stable featured place plus nearby places. The last usable position remains in memory only for a
  short, five-minute cache window, avoiding repeated GPS wake-ups when the passenger returns to
  Home.
  Raw GPS coordinates are transient React/ref state only: they are never persisted, added to URLs,
  logged intentionally, sent to analytics, or transmitted to the server. The Luna product pass
  adds bilingual presentation, a bundled verified Utah catalog, local assets and offline-safe
  browsing without adding a map, provider, backend or analytics. It is enabled on the official
  Galaxy Tab A9+ after browser GPS permission validation. The local catalog includes broad but
  clearly labeled regions so a useful story can appear between individual landmarks.
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

### Email

Resend handles transactional sending and inbound receiving for `rides.getstreex.com`. The inbound
address `juan@rides.getstreex.com` is received by Resend and forwarded to the configured
`INBOUND_FORWARD_TO` address through the signed webhook at `/api/resend/inbound`. The production
environment must contain `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `INBOUND_FORWARD_TO`, and a
verified-domain sender in `INBOUND_FORWARD_FROM`. The webhook validates Resend/Svix signatures,
retrieves the received message, forwards its content, and preserves the original sender as
`Reply-To`; it does not expose inbound email data to the browser.

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
- Passenger has separate internal analytics in `passenger_analytics_sessions` and
  `passenger_analytics_events`; it never uses GA. The browser keeps only an opaque random
  installation id, a bounded 24-hour/100-event offline queue, and no passenger identity, address,
  GPS, raw device identifier, user agent or secret.
- Passenger events are server-allowlisted semantic actions only. Both tables have RLS and no
  `anon`/`authenticated` grants; only server functions using the service role can write them, and
  the authenticated Admin summary enforces tenant membership server-side.
- All current Passenger sessions are `tablet_unverified`. A session becomes `driver_confirmed`
  only through a future trusted Driver MC signal; tablet activity is never called a real ride.
- Admin can start Passenger beta measurement without deleting data. The timestamp becomes the
  dashboard's reporting baseline, excluding earlier engineering sessions while retaining them for
  technical verification. Starting a beta baseline is tenant-scoped and admin-authenticated.

## Automated Quality Checks

- GitHub Actions runs on pushes to `main` and pull requests.
- CI installs from `bun.lock` with Bun 1.3.14, then runs TypeScript, ESLint, the Bun test suite and
  the production build.

## Passenger Roadmap Order

This is the canonical roadmap for the in-vehicle Passenger Console only. Rides landing, booking,
Admin and Google Calendar planning belong in `docs/RIDES_ROADMAP.md` and
`docs/GOOGLE_CALENDAR_ROADMAP.md`.

1. Complete the current Passenger beta stabilization: validate the approved idle cadence, GPS/battery
   behavior and landscape tablet layout without disturbing Music, Clima, Streex, booking or payments.
2. Complete Point 1 / Fully Remote setup and verify the permanent Fully Kiosk configuration on the
   Galaxy Tab A9+.
3. Complete Reload 1.0.4 test controls, keeping physical brightness and kiosk actions in Fully Kiosk.
4. Complete Point 0 internal Passenger analytics and start the approved beta measurement baseline.
5. Complete Reload 1.0.5 by publishing Lite for daily use and validating it in real rides.
6. After Lite is published and stable, implement the approved visual-theme architecture and a
   Halloween pilot. Migrate `liteTheme` into `visualTheme`; keep Original and Accent, ship
   Halloween first, and defer Night Out, Winter/Park City and Holiday until the tablet pilot is
   validated. Themes are presentation tokens only: they cannot change navigation, feature logic,
   Music/Spotify, Games, Around You, GPS, booking, payments or Calendar behavior. Activation is
   Admin-only in v1, with America/Denver scheduling and whole-theme fallback to Original for any
   unknown, invalid or expired selection. Do not begin Lovable visual execution for this item yet.
7. Build Streex Driver MC as the private operational/session control surface.
8. Expand Around You to 100 verified places, then build the category-first local/offline browser.
9. Develop additional Passenger games only after Around You is stable. Streex Horizon remains a
   non-interactive tablet teaser with a phone QR.
10. Evaluate a voluntary, privacy-safe Passenger feedback pulse before implementation. It should
    avoid tablet keyboards, raw GPS, and third-party tracking.
11. Present Apple Pay, Google Pay and cards as payment methods within one Stripe-hosted Passenger
    checkout; do not duplicate that link as separate payment choices.
12. Complete Passenger hardening: paired-tablet restriction, approved live reviews, in-vehicle
    field test and Passenger UI end-to-end regression coverage.
13. Run a small live Stripe tip and confirm the charge and payout path end to end.
14. Optionally test importing the saved Fully settings backup when a spare device or reinstall is
    available; do not risk the only configured tablet solely for this drill.
15. **Owner-directed Passenger/Rides imagery (deferred)** — the owner will generate or select the
    final artwork and decide which surface each image replaces. Once the assets are approved,
    perform the technical handoff: inspect composition and orientation, crop or request a
    landscape regeneration when needed, optimize to an appropriate WebP/AVIF size, upload through
    the tenant-scoped Storage path, and connect stable per-surface config slots with safe fallbacks.
    Keep Passenger and Rides image mappings separate; do not assume that seasonal fields such as
    `theme.default`, `theme.winter`, `heroImage` or `landingHeroImage` already exist in this source.
    This is intentionally outside the current RELOAD work and must not start until the owner
    supplies the final asset map.

### Approved planning record — modes, personalization and themes

- `experienceMode` has three independent values: `lite`, future `complete`, and future `kids`.
  Kids is not a Lite/Complete overlay: its navigation, content and restrictions require a separate
  design item before implementation. A future Driver MC Kids control is a temporary session switch;
  Quiet, Guest and Test remain session controls only.
- Session personalization is not a mode. A future trusted Driver MC confirmation may add a
  time-bounded greeting and contextual content on Lite or Complete; rich reservation/route context
  remains Complete-only. It is off by default for Kids until an explicit privacy review approves it.
- `visualTheme` is independent of mode. The first registry will contain Original, Accent and
  Halloween. Themes may supply palette, CTA, background/gradient, optional per-surface imagery,
  minimal bilingual seasonal copy and subtle decorative motion. They never contain routes, flags,
  APIs, GPS, booking, payment, Music, Games or Around You references.
- The theme registry must be complete and validated as a unit: incomplete/unknown values resolve to
  Original, never to a mixed partial theme. Optional images fall back to that theme's own palette
  or gradient. Admin manual activation overrides a scheduled theme; otherwise scheduling falls
  back to Original. Schedule datetimes use America/Denver.
- Every theme must meet WCAG AA contrast, honor `prefers-reduced-motion`, and avoid strobing or
  flashing. Theme motion is decorative only and cannot disable or alter approved Music/Climate
  effects. Kids may resolve only themes explicitly marked safe; Original and Accent are the only
  initially safe themes.
- Before implementation, add contract tests for token completeness/types, contrast pairs,
  `kidsSafe`, allowed motion intensity, unknown fallback, Kids rejection, activation precedence,
  schedule expiry and reduced-motion behavior.

### Reload 1.0.4 test controls

- Fully Kiosk Remote/Admin owns physical tablet controls. A validated remote brightness change is
  reversible by clearing the Fully `Screen Brightness` value back to the system default.
- Passenger's unlinked `?passenger-test=1` owner tool exposes only a logical-rest test button. It
  resets to the Music-first idle screen, dims the web UI visually, and any touch returns to the
  normal console. It never attempts to control physical brightness or send Fully credentials from
  browser code.

## Approved Passenger Experience Backlog

The following product directions were reviewed and approved as part of the Passenger Console
roadmap. They are intentionally separated from the launch-stability work above and should be
implemented incrementally without replacing the current Passenger architecture.

1. **Streex Driver MC (driver control panel)** — the next strategic feature after launch
   stabilization. It will be a private, authenticated phone-side control surface in this same
   repository, never exposed to passengers. It should provide fast session controls (Kids, Quiet,
   Guest and Test), content toggles (Games, Around You, payments, contact, Jam and language),
   session actions (Home, reset, idle and refresh music), and tablet telemetry (battery, charging,
   temperature, Wi-Fi, GPS and Spotify status). Its future role is operational/session control;
   the global Lite/Complete default remains an Admin setting. Browser code must not receive raw
   coordinates or secrets. Brightness, battery and kiosk controls require a supported Fully Kiosk
   Remote Admin or device bridge; they cannot be assumed to be controllable from ordinary PWA
   JavaScript.
2. **Category-first Around You discovery** — continue the approved local/offline browser direction
   with curated categories (restaurants, hotels, cafés, supermarkets, parks, attractions, museums
   and bookstores), transient GPS ordering and no live business scraping.
3. **Smart attract-screen refinement** — keep the current approved Music-led idle experience and
   only reintroduce additional Around You or game protagonists after their landscape layouts are
   stable. Portrait validation is deferred by product direction.
4. **Around You content depth** — expand the verified catalog and use richer bilingual editorial
   detail in the featured panel while keeping concise secondary cards and local image fallbacks.
5. **Contextual Quick Access** — preserve the current session-stable rotation and direct-to-game
   behavior; future changes should be tested as guardrails, not as a new navigation model.
6. **Accessibility and premium readability** — larger type options, high contrast, reduced motion,
   stable 48–56px touch targets and color-independent states. Tablet QA remains landscape-first;
   portrait work is deferred until explicitly resumed.
7. **Future Now Playing refinements** — optional improvements beyond the approved Music Reload pass;
   the existing Spotify controls remain the source of truth.
8. **Remember STREEX / end-of-ride handoff** — do not infer passenger departure from GPS. Use the
   driver/session reset signal and the existing idle flow to surface QR, contact, review and tip
   continuation naturally and optionally.
9. **Offline resilience** — retain local games, Around You catalog and assets; communicate stale or
   unavailable weather, GPS, Spotify and realtime state clearly without blocking the experience.
10. **Passenger feedback pulse** — deferred for a later decision. If approved, prefer an optional
    QR/mobile follow-up or anonymous reason codes over a tablet keyboard, raw GPS or third-party
    tracking.

The language-model guidance agreed for this backlog is pragmatic: Terra Medium for bounded visual
polish and copy/layout work, Terra High for architecture, security, device-control boundaries,
accessibility and the Driver MC, and image generation only when a real asset gap cannot be solved
with verified local photography or appropriately licensed sources.

## Environment Notes

See `.env.example` for supported variable names. The code accepts Lovable-style and common Supabase-style environment variable aliases where appropriate.

When debugging local versus Lovable behavior, check:

1. Whether Lovable secrets are configured.
2. Whether local `.env` values exist.
3. Whether the relevant migration has been applied in Lovable Cloud.
4. Whether RLS and server-function behavior match the intended public/Admin boundary.
