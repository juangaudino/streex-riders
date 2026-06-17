# Supabase Migration Notes

This project is moving from Lovable-managed Supabase to a new standalone Supabase project.

For the new production project, use:

```txt
supabase/production_schema.sql
```

The files in `supabase/migrations/` are the historical Lovable-era migration trail. They are kept for reference, but they include demo/MVP iterations and should not be applied blindly to the new clean project.

Current baseline:

- `bookings`
- `tenant_availability`
- `blocked_slots`
- `reviews`
- `runner_scores`
- `app_settings`

`app_settings` currently stores:

- `ticker_style`: active public service ticker style.
- `site_config_v2`: JSON overrides for editable public landing configuration.

Admin access is still handled by `ADMIN_ACCESS_KEY` in server functions. Future product admin should move to Supabase Auth with explicit roles:

- `creator`
- `driver`

## Incremental production updates

If the clean baseline was already applied before native availability existed, apply:

```txt
supabase/availability_phase_4_1.sql
supabase/booking_service_type_phase_4_2.sql
```

This adds:

- schedule fields to `bookings`: `tenant_id`, `start_at`, `end_at`, `estimated_duration_minutes`
- service fields to `bookings`: `service_type`
- `tenant_availability`: default availability window and booking rules
- `blocked_slots`: manual driver blocks

Availability Phase 4.1 intentionally does not include Google Calendar OAuth yet. The current blocking rules are:

- passenger requests can only select generated available slots
- pending requests do not block availability
- quoted and confirmed rides block availability
- default ride duration: 60 minutes
- slot duration: 30 minutes
- minimum notice: 12 hours
- timezone: `America/Denver`
