# STREEX Rides

**A modular operating system for a premium private ride service.**

STREEX connects the public ride experience with the operational tools behind it: service pages, booking requests, availability, rule-based pricing, admin workflows, calendar synchronization, and a bilingual passenger console designed for the vehicle tablet.

I built the product as a single modular ecosystem rather than a collection of disconnected demos. The result combines customer-facing booking, tenant-scoped operations, pricing and scheduling logic, private analytics, and an in-ride entertainment layer while preserving clear boundaries between public, admin, passenger, and experiential surfaces.

> This repository contains an active product with implemented capabilities and documented validation boundaries. Some workflows are implemented in code but still require authenticated, production, or physical-device QA before they can be described as fully release-ready.

## Product preview

![STREEX private rides product preview](public/images/streex/streex-og-preview.jpg)

Representative product visuals from the repository:

<table>
  <tr>
    <td width="33%"><img src="public/images/streex/slc.webp" alt="STREEX Rides landing service-area visual in Salt Lake City" /></td>
    <td width="33%"><img src="src/assets/streex-gallery/passenger-home-airport.webp" alt="Passenger airport arrival experience" /></td>
    <td width="33%"><img src="src/features/runner/assets/quick-action/horizon_quick_action_card.webp" alt="Horizon interactive experience preview" /></td>
  </tr>
  <tr>
    <td align="center">Rides landing and service experience</td>
    <td align="center">Passenger journey</td>
    <td align="center">Horizon experiential layer</td>
  </tr>
</table>

The visual assets above are product imagery, not substitutes for authenticated operational evidence. Admin and Pricing screenshots should be captured with controlled data before publishing them as portfolio material.

## What I built

STREEX is organized around six connected product surfaces:

| Surface | Purpose |
| --- | --- |
| **Rides** | Public brand, service areas, driver profiles, reviews and customer trust layer |
| **Booking** | Ride requests, availability checks, quotes and deliberate quote responses |
| **Pricing Engine** | Zone-based pricing, route inputs, quote snapshots and lifecycle rules |
| **Admin** | Authenticated bookings, calendar, availability, reviews, settings and operations |
| **Passenger** | Bilingual, landscape-first tablet experience for the ride itself |
| **Horizon** | Lightweight Canvas 2D interactive experience connected to the STREEX ecosystem |

The goal is operational continuity: a request can move from a public service page into an internal workflow, receive a controlled quote, interact with availability and calendar rules, and continue into a branded passenger experience.

## Core capabilities

### Customer and booking experience

- Public STREEX landing page and tenant-aware driver/service pages.
- Dedicated request flow at `/request-a-ride`.
- Service pages for Salt Lake City Airport, Park City and Las Vegas.
- Availability checks with schedule-conflict protection.
- Quote response pages with neutral read-only loading and deliberate accept/decline actions.
- Reviews, service areas, payment continuation and contact flows.

### Admin and operations

- Authenticated Admin at `/admin` with tenant-scoped workspaces.
- Booking operations, status changes, availability, blocked slots and reviews.
- FullCalendar-based calendar views and operational event handling.
- Driver/workspace configuration with database-backed memberships.
- Pricing configuration at `/admin/pricing`.

### Pricing and integrations

- Modular pricing engine with zone-first Flat Rate logic.
- Route, place and geocoding inputs through Google Maps services.
- Quote snapshots that preserve pricing inputs, rules, recommendation, final price, discounts and commission context.
- Google Calendar OAuth, free-busy checks and synchronization for confirmed bookings.
- Resend transactional email and signed inbound webhook handling.
- Spotify pairing for the current personal/driver-mediated passenger music flow.

### Passenger experience

- Bilingual English/Spanish tablet console at `/passenger`.
- Music-first idle experience with STREEX-owned UI and Spotify as a playback/metadata source.
- Climate Premium with current conditions, hourly and daily forecasts, atmospheric states and stale/offline fallback behavior.
- Around You local recommendations with transient location use and no persisted raw GPS history.
- Offline-friendly local games: Utah Trivia, Higher or Lower and This or That.
- QR-based continuation to booking, contact and payment actions.
- Private semantic engagement analytics that avoid passenger identity, addresses, raw GPS and touch-coordinate collection.

## Architecture and stack

The application is a modular monolith with separate route and data boundaries for public Rides, Admin, Passenger and Horizon.

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS, Radix UI, Recharts |
| Application | TanStack Start, TanStack Router, React Query, Vite |
| Backend | Supabase Auth, Postgres, Row Level Security and server-side functions |
| Scheduling | FullCalendar, timezone-aware availability and conflict checks |
| Integrations | Google Maps, Google Calendar, Resend, Spotify and NWS weather data |
| Tooling | Bun, TypeScript checks, ESLint, Prettier and focused test suites |
| Deployment | Vercel with a standalone Supabase project for STREEX Rides |

## Technical highlights

- Tenant authorization is based on Supabase Auth plus database memberships rather than browser-provided tenant claims or mutable user metadata.
- Privileged reads and writes stay server-side; public access is constrained by RLS and route-level authorization contracts.
- Pricing data is snapshot-oriented so later configuration changes do not silently rewrite an existing quote.
- Booking response actions use signed, expiring capabilities and compare-and-set transitions to prevent accidental or concurrent double processing.
- Calendar credentials and OAuth state are protected and bound to the initiating tenant; private event details are not exposed to Passenger or analytics.
- Passenger analytics use allowlisted semantic actions and separate technical sessions from meaningful engagement.
- Passenger and Admin have separate manifests/service-worker boundaries; browser code is not presented as proof of Android or kiosk hardware control.
- The product preserves a clear distinction between automated checks, authenticated browser QA, production verification and physical-tablet validation.

## Demo and deployment

- **Live Rides product:** [rides.getstreex.com](https://rides.getstreex.com)
- **Public entry:** [getstreex.com](https://getstreex.com) redirects to the Rides deployment while preserving the path.
- **Booking entry:** [`/request-a-ride`](https://rides.getstreex.com/request-a-ride)
- **Admin:** [`/admin`](https://rides.getstreex.com/admin) — authenticated operational surface
- **Passenger:** [`/passenger`](https://rides.getstreex.com/passenger) — no-index tablet surface
- **Horizon:** [`/runner-lab`](https://rides.getstreex.com/runner-lab) — no-index interactive surface

The public Rides surface is available for browsing. Admin, Pricing and operational workflows should be evaluated with authorized access and controlled data rather than by treating a public build as production certification.

## Implementation status

### Implemented in the current product baseline

- Public Rides experience, service pages, tenant-aware pages and booking entry points.
- Admin authentication, tenant memberships, booking operations, reviews and availability tooling.
- Pricing Engine code and database migration, including zone/pricing entities and quote snapshots.
- Google Calendar OAuth, free-busy and confirmed-booking synchronization baseline.
- Passenger console, Music, Climate Premium, local games, Around You and privacy-oriented engagement analytics.
- Spotify pairing and server-side credential handling for the current Passenger workflow.
- PWA manifests and offline/static-asset recovery boundaries for Admin and Passenger.

### Still requiring validation or follow-up work

- End-to-end authenticated QA for Pricing zones, routes, quotes and quote-to-booking behavior.
- Remaining controlled acceptance/rejection and Calendar evidence for quote responses.
- Additional RLS, suspension/archival and permission hardening identified in the current audit.
- Responsive, accessibility and operational UX refinement across Rides and Admin.
- Further accuracy and ingestion validation for aggregated Passenger analytics.
- Full physical-tablet validation for the current Passenger deployment and kiosk workflow.

This distinction is intentional: implemented code, automated tests, historical production evidence and release readiness are different levels of evidence.

## Technical documentation

- [Technical context](docs/PROJECT_CONTEXT.md) — current contracts and system boundaries.
- [Google Calendar](docs/GOOGLE_CALENDAR.md) — OAuth, free-busy, sync and recovery rules.
- [Around You](docs/AROUND_YOU.md) — transient location, catalog and field-QA boundaries.
- [Multi-tenant Admin](docs/MULTI_TENANT_ADMIN.md) — authorization, memberships and tenant isolation.
- [Horizon](docs/RUNNER_CONTEXT.md) — Canvas 2D architecture and product boundaries.
- [Supabase](supabase/README.md) — migration history and database discipline.
- [Preserved audit](docs/audits/2026-09-05-audit.md) and [audit reading guide](docs/audits/README.md).
- [Image optimization notes](docs/IMAGE_OPTIMIZATION.md) and [Rides image optimization](docs/RIDES_IMAGE_OPTIMIZATION.md).

## Local development

The project uses Bun and the committed `bun.lock` file:

```sh
bun install --frozen-lockfile
bun run dev
```

Useful checks:

```sh
bun run typecheck
bun run lint
bun test tests/*.test.mjs
bun run build
```

`bun run check` runs typecheck and build. `bun run check:full` also includes lint. The repository currently carries known historical formatting/lint debt, so a green build should not be described as complete production QA.

## Project continuity

The repository also contains operational documentation used to continue development safely:

1. [AGENTS.md](AGENTS.md) — repository rules and scope boundaries.
2. [HANDOFF.md](docs/HANDOFF.md) — current checkpoint and next authorized task.
3. [ROADMAP.md](docs/ROADMAP.md) — single priority order and status model.
4. [EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) — task contracts and verification protocol.

Secrets remain in local or deployment environments and are never committed, placed in screenshots, or documented as values. See [.env.example](.env.example) for supported configuration names.
