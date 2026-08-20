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

The two initial identities are intentionally separate:

- `juangaudino@gmail.com`: platform Super Admin only. It can manage every workspace.
- `streex.rides@gmail.com`: owner of the primary `streex` driver workspace.

Both identities sign in at `/admin`; the database role determines which controls and workspaces are
visible. STREEX Horizon remains global.

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

Draft preview links carry a signed, short-lived token. The landing loader and every tenant-aware
public server action (availability, booking, ticker and reviews) must revalidate that token and
confirm that the requested tenant matches it. Never authorize a draft action from a browser-supplied
`tenant_id` alone.

## Production migration

Apply `supabase/migrations/20260715035104_multi_tenant_super_admin.sql` with a Supabase account that
has Owner/Administrator database privileges. This migration is additive and backfills current
global records to the `streex` tenant.

The initial bootstrap and recovery sequence below has been completed in production. Current Admin
authorization is Supabase Auth only; the temporary emergency key has been removed.

After applying it:

1. In Supabase Auth URL Configuration, keep `https://rides.getstreex.com` as Site URL.
2. Add `https://rides.getstreex.com/admin` to allowed redirect URLs.
3. Configure `TENANT_PREVIEW_SECRET` with at least 32 random characters (it may initially reuse the existing Calendar token-encryption secret).
4. Deploy the application.
5. Enter Admin as the platform Super Admin using `juangaudino@gmail.com`.
6. In Drivers, use **Assign driver owner** on the primary STREEX workspace and assign
   `streex.rides@gmail.com`. Existing Auth users are reused; otherwise the system sends an invitation.
7. Accept or reset access for `streex.rides@gmail.com`, then verify it sees only `streex`.
8. Create a test tenant and validate booking, email, availability, assets and Google Calendar
   isolation.
9. Verify both account logins in production and keep the emergency bypass disabled.

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
