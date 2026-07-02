# STREEX Rides

Passenger-facing web application for STREEX Rides, a premium private ride service built around a quiet, hospitality-first experience.

The app combines:

- A premium passenger landing page.
- Ride request and review submission flows.
- A protected Admin control center.
- Driver availability and calendar management.
- Moderated passenger reviews and STREEX Horizon records.
- A hidden experiential game route, STREEX Horizon, at `/runner-lab`.

## Product principles

STREEX should feel elevated, trustworthy, personal, and useful. Keep the design restrained and premium:

- Deep black: `#0B0B0B`
- STREEX yellow: `#E6CE20`
- White: `#FFFFFF`

Avoid loud arcade, casino, crypto-app, generic SaaS, or generic rideshare styling.

## Tech stack

- React 19
- TanStack Start and TanStack Router
- TypeScript
- Vite
- Tailwind CSS
- FullCalendar for Admin calendar views
- Lovable Cloud / Supabase-compatible backend
- Bun package manager

## Main routes

| Route                                  | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `/`                                    | Passenger landing page                     |
| `/admin`                               | Protected Admin control center             |
| `/admin/bookings`                      | Admin booking view                         |
| `/admin/reviews`                       | Admin review view                          |
| `/runner-lab`                          | Hidden, no-index STREEX Horizon game route |
| `/booking.accept` / `/booking.decline` | Booking response routes                    |

## Core systems

### Passenger landing

The landing page is composed in `src/routes/index.tsx` with components under `src/components/streex/`.

Key sections include:

- Header and hero
- Service ticker
- Quick Actions
- Payment options
- More ways to connect
- Experience gallery
- Services
- Approved reviews
- Meet Juan
- Review submission
- Booking flow

### Booking and availability

Passenger ride requests are stored in `bookings`.

Current availability rules:

- Passenger requests can only select generated available slots.
- Pending requests do not block availability.
- Quoted and confirmed rides block availability.
- Manual blocked slots also block availability.
- Default ride duration is 60 minutes.
- Slot duration is 30 minutes.
- Minimum notice is 12 hours.
- Timezone is `America/Denver`.
- Database triggers reject overlapping quoted/confirmed rides and manual blocks.

Relevant files:

- `src/components/streex/BookingFormModal.tsx`
- `src/lib/booking.functions.ts`
- `src/lib/availability.functions.ts`
- `src/lib/availability.server.ts`
- `src/lib/schedule-conflicts.ts`
- `tests/schedule-conflicts.test.mjs`
- `supabase/migrations/20260619035636_prevent_schedule_overlaps.sql`

### Admin

The Admin control center lives primarily in `src/components/streex/AdminPanel.tsx`.

Current Admin areas:

- Bookings
- Reviews
- STREEX Horizon records
- Display themes
- Site configuration
- Availability and driver calendar

Privileged actions use server functions and require `ADMIN_ACCESS_KEY`.

Relevant files:

- `src/components/streex/AdminPanel.tsx`
- `src/components/streex/admin/AdminCalendar.tsx`
- `src/components/streex/admin/AdminCalendarEventSheet.tsx`
- `src/lib/admin.functions.ts`
- `src/lib/admin-auth.server.ts`

### Reviews

Passenger reviews are submitted as `pending`. Only `approved` reviews are shown publicly.

Relevant files:

- `src/components/streex/FeedbackForm.tsx`
- `src/components/streex/Reviews.tsx`
- `src/lib/review.functions.ts`

### STREEX Horizon

STREEX Horizon is a hidden experiential feature inside STREEX Rides. It is not a separate brand and should not disrupt the production booking flow.

Current flow:

1. Intro
2. Transition
3. Gameplay
4. Results, score saving, card saving, and sharing

Records use `runner_scores` and start as `pending`; Admin approval is required before public leaderboard visibility.

Relevant files:

- `src/routes/runner-lab.tsx`
- `src/features/runner/RunnerApp.tsx`
- `src/features/runner/components/RunnerCanvas.tsx`
- `src/features/runner/components/RunnerResults.tsx`
- `src/features/runner/engine/`
- `src/lib/runner-score.functions.ts`
- `docs/RUNNER_CONTEXT.md`

## Backend and database

The app is built around Lovable Cloud with Supabase-compatible database and storage behavior. Backend schema and migration notes live under `supabase/`.

Primary tables:

- `bookings`
- `tenant_availability`
- `blocked_slots`
- `reviews`
- `runner_scores`
- `app_settings`

Important files:

- `supabase/production_schema.sql`
- `supabase/README.md`
- `supabase/availability_phase_4_1.sql`
- `supabase/booking_service_type_phase_4_2.sql`
- `supabase/migrations/`

Do not commit secrets. Sensitive values belong in Lovable secrets or local `.env`.

## Environment variables

See `.env.example` for the supported variable names.

Common groups:

- Supabase/Lovable database keys
- Google Maps browser key
- Google Analytics measurement ID
- Google Calendar OAuth credentials and token-encryption key
- Email/Resend settings
- `SITE_URL`
- `ADMIN_ACCESS_KEY`

`ADMIN_ACCESS_KEY` is private and authorizes the Admin control center. It must not be treated as a public frontend value.

### Analytics

Google Analytics 4 is initialized only in production on public passenger routes. Admin and
STREEX Horizon are excluded. The implementation intentionally avoids sending passenger names,
email addresses, phone numbers, pickup addresses, or destinations.

Primary commercial events include booking funnel activity, successful ride requests, contact
clicks, social clicks, service selection, and review submissions. `booking_submitted` is the
recommended GA4 key event.

Relevant file: `src/lib/analytics.ts`.

## Development

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Build:

```bash
bun run build
```

Typecheck:

```bash
bun run typecheck
```

Full project check:

```bash
bun run check
```

Useful tests:

```bash
node tests/schedule-conflicts.test.mjs
node tests/fullcalendar-intl-timezone.test.mjs
```

Image optimization:

```bash
bun run optimize:images
```

## Documentation

- `docs/PROJECT_CONTEXT.md` — broad product, architecture, routes, and guardrails.
- `docs/RUNNER_CONTEXT.md` — STREEX Horizon goals, flow, guardrails, records, and sharing.
- `docs/GOOGLE_CALENDAR_ROADMAP.md` — planned Google Calendar integration.
- `docs/IMAGE_OPTIMIZATION.md` — image optimization report.
- `supabase/README.md` — database baseline and migration notes.
- `AGENTS.md` — repository instructions for AI/code agents.

## Current roadmap / pending work

### Google Calendar integration

Status: production OAuth and read-only availability blocking are implemented. Writing confirmed
rides to Google Calendar is the next phase.

Planned phases:

1. Completed: OAuth plus Google busy-time blocking in passenger and Admin calendars.
2. Next: create/update/delete Google events for confirmed STREEX rides.
3. Add near-real-time sync via Google push notifications and reconciliation jobs.

Open product decisions:

- Private Google event title and description format.
- Admin warning/recovery behavior when Google events are moved or deleted.

See `docs/GOOGLE_CALENDAR_ROADMAP.md`.

### Admin and scheduling hardening

- Continue regression testing for overlap protection and manual blocked slots.
- Keep checking Lovable/Supabase type drift when availability tables change.
- Eventually replace `ADMIN_ACCESS_KEY` with Supabase Auth and explicit roles such as `creator` and `driver`.

### STREEX Horizon

- Keep `/runner-lab` isolated and no-index until intentionally launched.
- Continue mobile performance testing for canvas rendering and large assets.
- Treat future major rendering upgrades, such as PixiJS, as deliberate projects rather than small polish tasks.
- Keep new visual work aligned with the premium STREEX brand, not loud arcade styling.

### Documentation cleanup

- Keep `docs/PROJECT_CONTEXT.md`, `docs/RUNNER_CONTEXT.md`, and `supabase/README.md` synchronized when backend ownership, routes, or product decisions change.

## Validation expectations

Before merging meaningful changes:

```bash
bun run typecheck
bun run build
```

For larger changes, run:

```bash
bun run check:full
```

For booking/calendar logic, also run the focused schedule and timezone tests.

## Deployment

The application is hosted through Lovable and backed by Lovable Cloud / Supabase-compatible services. Production-sensitive configuration should be managed in Lovable secrets or the hosting provider’s environment settings, not committed to the repo.
