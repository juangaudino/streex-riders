# Multi-tenant and Super Admin

## Architecture

STREEX Rides is one application and one Supabase project shared by isolated driver workspaces. The
primary workspace is `streex`; additional public pages use `/{slug}`, for example `/driver2`.

Supabase Auth owns identities. Authorization comes from database memberships, never from mutable
Auth user metadata:

- `tenants`: driver workspace and publication state.
- `user_profiles`: user profile linked to `auth.users`.
- `tenant_memberships`: `owner` or `admin` access to a tenant.
- `platform_admins`: Super Admin authority.
- `audit_log`: sensitive platform actions.

Juan can be both a platform Super Admin and owner of `streex`. STREEX Horizon remains global.

## Driver onboarding

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

## Production migration

Apply `supabase/migrations/20260715035104_multi_tenant_super_admin.sql` with a Supabase account that
has Owner/Administrator database privileges. This migration is additive and backfills current
global records to the `streex` tenant.

After applying it:

1. In Supabase Auth URL Configuration, keep `https://rides.getstreex.com` as Site URL.
2. Add `https://rides.getstreex.com/admin` to allowed redirect URLs.
3. Configure `TENANT_PREVIEW_SECRET` with at least 32 random characters (it may initially reuse the existing Calendar token-encryption secret).
4. Deploy the application while retaining `ADMIN_ACCESS_KEY` temporarily.
5. Enter Admin with the emergency key, open Drivers and create Juan's Super Admin account.
6. Accept the invitation, set a password and verify Juan can access `streex` plus another test tenant.
7. Validate booking, email, availability, assets and Google Calendar isolation.
8. Remove `ADMIN_ACCESS_KEY` only after recovery and Super Admin login are verified in production.

The `tenant-assets` public bucket accepts only images under `{tenant-id}/brand`,
`{tenant-id}/profile` and `{tenant-id}/gallery`. Upload/update/delete policies require membership in
that tenant or platform Super Admin authority.

## Required release checks

- Driver 2 cannot read or mutate Juan's bookings, reviews, settings or availability.
- Changing `x-streex-tenant` does not grant a non-member access.
- A suspended tenant is hidden publicly and its owner cannot enter it; Super Admin retains access.
- OAuth state is single-use and binds Google Calendar to the initiating tenant.
- Confirmed rides write only to that tenant's selected calendar.
- Public configuration, areas, photos, reviews and email identity do not cross tenants.
- `/` remains the primary STREEX page and Horizon remains global.
