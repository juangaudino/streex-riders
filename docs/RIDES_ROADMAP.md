# STREEX Rides Roadmap

This is the canonical roadmap for the public STREEX Rides product: the landing, booking flow,
Admin, availability, reviews and operational integrations. It intentionally excludes the
in-vehicle Passenger Console, whose roadmap lives in `docs/PROJECT_CONTEXT.md` under
**Passenger Roadmap Order**.

## Current verified baseline

- Public landing, booking requests, reviews and protected Admin are active in this repository.
- Availability includes tenant-scoped windows, manual blocks and overlap protection.
- Google Calendar OAuth, busy-time blocking and confirmed-ride event synchronization are verified
  in production. The detailed operational phases remain in `docs/GOOGLE_CALENDAR_ROADMAP.md`.

## Next Rides work

1. **Pricing Engine release validation** — the Admin-only calculator, pricing profiles, zones,
   Flat Rates, promotions, referrals and immutable quote snapshots are implemented locally in
   `20260830015239_pricing_engine.sql`. Apply and verify the migration only with the authorized
   Supabase owner workflow, configure the restricted server-only Google Maps key with Routes,
   Places and Geocoding access, then run live route and quote-to-booking QA before calling it
   production-ready. Passenger and Horizon remain out of scope.
2. **Google Calendar Phase 3** — add push-notification reconciliation, incremental sync and an
   explicit recovery decision for manually moved or deleted Google events.
3. **Scheduling and Admin hardening** — retain overlap regression coverage, tenant authorization
   and generated-type discipline whenever availability or booking code changes.
4. **Owner-directed Rides imagery** — after the owner supplies an approved asset map, assess each
   image for surface, crop, weight and accessibility; optimize to WebP/AVIF where appropriate and
   use tenant-scoped Storage with stable fallbacks. Do not assume Passenger and Rides use the same
   image or seasonal mapping.
5. **STREEX Horizon** — keep `/runner-lab` isolated and no-index until a deliberate launch
   decision. Future rendering work must remain a scoped project, not incidental landing work.

## Separation rules

- Do not add Passenger Music, idle, weather, games, GPS, Fully Kiosk or Driver MC tasks here.
- Do not modify bookings, payments, Google Calendar or the landing while implementing Passenger
  work unless an explicit dependency requires it.
- Themes, modes and per-passenger personalization are Passenger product planning until a future
  decision explicitly maps a visual change to the public Rides landing.
