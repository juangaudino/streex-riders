# STREEX Rides Project Context

## Purpose

STREEX Rides is the passenger-facing experience for Juan's premium private ride service. The product should feel elevated, trustworthy, personal, and hospitality-first rather than like a generic rideshare app.

Core brand colors:

- Deep black: `#0B0B0B`
- STREEX yellow: `#E6CE20`
- White: `#FFFFFF`

## Hosting And Backend

- The application is hosted in Lovable.
- The backend is managed by Lovable Cloud and is already integrated into the project.
- Database and storage behavior is Supabase-compatible, but the owner should not be asked to create or manage a separate external Supabase project unless the architecture intentionally changes later.
- Backend changes may be applied through Lovable Cloud and are also represented in `supabase/migrations/`.
- Sensitive values belong in Lovable secrets or local `.env`, never in Git.

Important secret:

- `ADMIN_ACCESS_KEY`: private key used to enter and authorize the Admin control center. It is not a public password or frontend environment variable.

## Main Routes

- `/`: passenger landing experience
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

Privileged Admin actions use server functions in `src/lib/admin.functions.ts` and require `ADMIN_ACCESS_KEY`.

### Data

Primary tables:

- `bookings`: passenger ride requests
- `reviews`: passenger reviews with moderation status
- `runner_scores`: Runner records with moderation status
- `app_settings`: non-sensitive public UI settings such as ticker style

Expected public behavior:

- Passengers may submit bookings.
- Passengers may submit reviews as `pending`.
- The landing page only shows approved reviews.
- Runner score submissions go through a server function and are moderated before appearing publicly.
- Public clients must not receive broad Admin read, update, or delete access.

### Storage

Lovable Cloud storage contains public image assets used by the landing experience. Existing storage URLs should be preserved unless assets are intentionally migrated.

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

## Environment Notes

See `.env.example` for supported variable names. The code accepts Lovable-style and common Supabase-style environment variable aliases where appropriate.

When debugging local versus Lovable behavior, check:

1. Whether Lovable secrets are configured.
2. Whether local `.env` values exist.
3. Whether the relevant migration has been applied in Lovable Cloud.
4. Whether RLS and server-function behavior match the intended public/Admin boundary.
