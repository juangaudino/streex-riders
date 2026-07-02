# Google Calendar Roadmap

Status: production OAuth, free/busy blocking, and confirmed-ride event synchronization are
implemented. Production behavior still needs an end-to-end confirmation/cancellation test after
deployment.

## Product rules already agreed

- STREEX remains the source of truth for ride status.
- Google busy time blocks passenger availability.
- Create a Google event when a ride becomes `confirmed`, not while it is `pending` or `quoted`.
- Updating or cancelling a confirmed ride updates its Google event.
- Deleting or moving a Google event must not silently cancel a STREEX booking.
- Do not invite the passenger automatically in the first version.
- Keep passenger details private and request the least Google access needed.
- Read busy time from the primary personal calendar and a dedicated `STREEX Rides` calendar.
- Write only to the dedicated `STREEX Rides` calendar.

## Phase 1: connection and read-only blocking

- [x] Create/configure the Google Cloud project and enable Calendar API.
- [x] Configure the OAuth consent screen and production redirect URL on `rides.getstreex.com`.
- [x] Add Google client ID, client secret, token-encryption key, and callback URL to production secrets.
- [x] Add a migration for `calendar_connections` with encrypted refresh-token storage.
- [x] Add Connect, Disconnect, and calendar-selection controls in Admin Availability.
- [x] Apply the migration and verify the first production OAuth connection.
- [x] Query Google `freeBusy` server-side and merge those intervals into STREEX slot calculation.
- [x] Render Google busy intervals in the Admin calendar without exposing private event details.
- [x] Define timeout, cache, token refresh, revoked-access, and Google-outage behavior.

Operational behavior: requests time out after five seconds, successful free/busy results are cached
for 60 seconds, access tokens refresh server-side, sync errors appear in Admin, and passenger
availability fails closed while a connected Google Calendar cannot be checked.

## Phase 2: write confirmed STREEX rides

- [x] Add `google_calendar_id`, `google_event_id`, and sync state to bookings.
- [x] Create an idempotent Google event when a ride becomes confirmed.
- [x] Update event time, duration, title, and location whenever a confirmed ride is resynchronized.
- [x] Delete the Google event when STREEX cancels the ride.
- [x] Store a private STREEX booking identifier in Google event extended properties.
- [x] Surface per-booking sync health and a manual retry action in Admin.
- [ ] Add scheduled reconciliation for partial failures in Phase 3.

Event format: private, opaque event titled `STREEX Ride — Passenger Name`, with pickup as the Google
location and operational ride/contact details in the description. Passengers are not invited.

## Phase 3: near-real-time synchronization

- Add an HTTPS webhook for Google Calendar push notifications.
- Store and renew expiring watch channels.
- Use incremental sync tokens to reconcile changes efficiently.
- Add a scheduled reconciliation job for missed notifications and expired channels.
- Surface connection health and last successful sync in Admin.

## Decisions required before Phase 3

1. Whether a Google event moved or deleted manually should only be restored with Admin retry or by
   automatic reconciliation.

## Acceptance tests

- Google busy time removes every overlapping passenger slot, including hourly rides.
- Adjacent intervals that only touch at an endpoint remain valid.
- Confirming the same booking twice never creates duplicate Google events.
- Moving, cancelling, and completing rides produce the agreed Google behavior.
- Token expiry and revocation produce a recoverable Admin state.
- A Google outage never creates a silent double booking.
