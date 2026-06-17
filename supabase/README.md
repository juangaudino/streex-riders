# Supabase Migration Notes

This project is moving from Lovable-managed Supabase to a new standalone Supabase project.

For the new production project, use:

```txt
supabase/production_schema.sql
```

The files in `supabase/migrations/` are the historical Lovable-era migration trail. They are kept for reference, but they include demo/MVP iterations and should not be applied blindly to the new clean project.

Current baseline:

- `bookings`
- `reviews`
- `runner_scores`
- `app_settings`

`app_settings` currently stores:

- `ticker_style`: active public service ticker style.
- `site_config_v2`: JSON overrides for editable public landing configuration.

Admin access is still handled by `ADMIN_ACCESS_KEY` in server functions. Future product admin should move to Supabase Auth with explicit roles:

- `creator`
- `driver`
