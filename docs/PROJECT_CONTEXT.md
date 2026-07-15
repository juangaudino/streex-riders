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

### Admin

The Admin control center is implemented primarily in `src/components/streex/AdminPanel.tsx`.

Current Admin areas:

- Bookings
- Reviews
- Runner records
- Display themes

Privileged Admin actions use server functions, Supabase Auth and tenant membership checks. Juan is
both Super Admin and owner of the primary `streex` workspace. See `docs/MULTI_TENANT_ADMIN.md`.

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
- Analytics loads only in production and excludes `/admin` and `/runner-lab`.
- `booking_submitted` is the primary conversion/key event.
- Funnel and contact events are centralized through `src/lib/analytics.ts`.

## Environment Notes

See `.env.example` for supported variable names. The code accepts Lovable-style and common Supabase-style environment variable aliases where appropriate.

When debugging local versus Lovable behavior, check:

1. Whether Lovable secrets are configured.
2. Whether local `.env` values exist.
3. Whether the relevant migration has been applied in Lovable Cloud.
4. Whether RLS and server-function behavior match the intended public/Admin boundary.
