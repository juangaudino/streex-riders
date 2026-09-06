# Multi-tenant and Super Admin

Technical reference updated 2026-09-05, not a separate roadmap. Resume from [HANDOFF](HANDOFF.md); [ROADMAP](ROADMAP.md) and [EXECUTION_PLAN](EXECUTION_PLAN.md) own priority and verification. Current authorization/isolation is S05; new-driver commercialization is standby C01. Do not provision another driver as part of a routine checkpoint.

## Architecture

STREEX Rides is one application and one Supabase project with tenant-scoped driver workspaces. The
primary workspace is `streex`; additional public pages use `/{slug}`, for example `/driver2`.

Supabase Auth owns identities. Authorization comes from database memberships, never from mutable
Auth user metadata:

- `tenants`: driver workspace and publication state.
- `user_profiles`: user profile linked to `auth.users`.
- `tenant_memberships`: `owner` or `admin` access to a tenant.
- `platform_admins`: Super Admin authority.
- `audit_log`: sensitive platform actions.

The two initial identities are intentionally separate:

- `juangaudino@gmail.com`: platform Super Admin only. It can manage every workspace.
- `streex.rides@gmail.com`: owner of the primary `streex` driver workspace.

Both identities sign in at `/admin`; the database role determines which controls and workspaces are
visible. STREEX Horizon remains global.

## Driver onboarding — existing capability, commercial use in standby

The sequence below describes the implemented UI, not authorization to run it or proof of commercial readiness. C01 must first close neutral defaults/payment ownership and publication gates. S05 must independently close current RLS/suspension differences even while commercialization is deferred.

1. Sign in at `/admin` as Super Admin.
2. Open **Drivers** and choose **Add driver**.
3. Enter service name, driver name, email, phone and an unreserved slug.
4. The system creates a private `draft` tenant and sends a Supabase Auth invitation.
5. The driver opens the link, signs in and sets a password in Admin.
6. Complete Config, Photos, Availability and Google Calendar in that workspace.
7. Use the workspace selector to review the driver context.
8. Change the tenant from `draft` to `active`. Only active tenants resolve publicly or appear in the sitemap.

Super Admin can resend an access link, change the owner, suspend/archive a tenant and manage any
workspace. The active workspace is always visible in the Admin header; there is no silent
impersonation.

Draft preview links carry a signed, short-lived token. The landing loader and every tenant-aware
public server action (availability, booking, ticker and reviews) must revalidate that token and
confirm that the requested tenant matches it. Never authorize a draft action from a browser-supplied
`tenant_id` alone.

## Production migration — completed bootstrap, do not replay

`supabase/migrations/20260715035104_multi_tenant_super_admin.sql` is part of the existing production history. It introduced the tenant model and backfilled original records to `streex`. Do not apply it again or run migration repair without proving the actual schema/history difference.

The initial bootstrap and recovery sequence below has been completed in production. Current Admin
authorization is Supabase Auth only; the temporary emergency key has been removed.

Auth redirects, tenant-preview signing and the two account roles have historical setup evidence. Do not rotate secrets, reassign owners, resend invitations or redeploy just to resume documentation. Any future setup/recovery operation requires its own authorized scope. Test isolation with controlled fixtures, not newly activated commercial tenants.

The `tenant-assets` public bucket accepts only images under `{tenant-id}/brand`,
`{tenant-id}/profile` and `{tenant-id}/gallery`. Upload/update/delete policies require membership in
that tenant or platform Super Admin authority.

## Required release checks

These are target checks, not a claim that every path currently passes. The 2026-09-05 audit identified a difference between server suspension checks and direct Data API policies, plus preview-state and inherited payment-default risks. S05/R04/C01 identify their current versus standby scopes.

- Driver 2 cannot read or mutate Juan's bookings, reviews, settings or availability.
- Changing `x-streex-tenant` does not grant a non-member access.
- A suspended tenant is hidden publicly and its owner cannot enter it; Super Admin retains access.
- OAuth state is single-use and binds Google Calendar to the initiating tenant.
- Confirmed rides write only to that tenant's selected calendar.
- Public configuration, areas, photos, reviews and email identity do not cross tenants.
- `/` remains the primary STREEX page and Horizon remains global.
