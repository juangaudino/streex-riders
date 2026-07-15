create table if not exists public.tenants (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  display_name text not null,
  owner_name text not null,
  owner_email text not null,
  owner_phone text,
  status text not null default 'draft' check (status in ('draft', 'active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.tenants (id, slug, display_name, owner_name, owner_email, owner_phone, status)
values ('streex', 'streex', 'Streex Rides', 'Juan', 'streex.rides@gmail.com', '+18017974971', 'active')
on conflict (id) do nothing;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  tenant_id text not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id text references public.tenants(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_oauth_states (
  nonce text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reviews add column if not exists tenant_id text not null default 'streex';
alter table public.app_settings add column if not exists tenant_id text not null default 'streex';
alter table public.calendar_connections add column if not exists tenant_id text not null default 'streex';

alter table public.app_settings drop constraint if exists app_settings_pkey;
alter table public.app_settings add primary key (tenant_id, key);
alter table public.calendar_connections drop constraint if exists calendar_connections_pkey;
alter table public.calendar_connections add primary key (tenant_id, id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_fk') then
    alter table public.bookings add constraint bookings_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'availability_tenant_fk') then
    alter table public.tenant_availability add constraint availability_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'blocked_slots_tenant_fk') then
    alter table public.blocked_slots add constraint blocked_slots_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_tenant_fk') then
    alter table public.reviews add constraint reviews_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'app_settings_tenant_fk') then
    alter table public.app_settings add constraint app_settings_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'calendar_connections_tenant_fk') then
    alter table public.calendar_connections add constraint calendar_connections_tenant_fk foreign key (tenant_id) references public.tenants(id);
  end if;
end $$;

create index if not exists tenant_memberships_user_idx on public.tenant_memberships(user_id, status);
create index if not exists reviews_tenant_status_idx on public.reviews(tenant_id, status, created_at desc);
create index if not exists audit_log_tenant_created_idx on public.audit_log(tenant_id, created_at desc);
create index if not exists calendar_oauth_states_expiry_idx on public.calendar_oauth_states(expires_at);

alter table public.tenants enable row level security;
alter table public.user_profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.audit_log enable row level security;
alter table public.calendar_oauth_states enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.app_settings enable row level security;
alter table public.tenant_availability enable row level security;
alter table public.blocked_slots enable row level security;

grant select on public.tenants, public.user_profiles, public.tenant_memberships, public.platform_admins, public.audit_log to authenticated;
grant update on public.user_profiles to authenticated;
grant select, update, delete on public.bookings, public.reviews to authenticated;
grant select, insert, update, delete on public.app_settings, public.tenant_availability, public.blocked_slots to authenticated;
grant all on public.tenants, public.user_profiles, public.tenant_memberships, public.platform_admins, public.audit_log, public.calendar_oauth_states to service_role;

drop policy if exists "Users can read own platform role" on public.platform_admins;
create policy "Users can read own platform role" on public.platform_admins for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read authorized memberships" on public.tenant_memberships;
create policy "Users can read authorized memberships" on public.tenant_memberships for select to authenticated
using (
  (select auth.uid()) = user_id
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Users can read authorized tenants" on public.tenants;
create policy "Users can read authorized tenants" on public.tenants for select to authenticated
using (
  exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = tenants.id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended'
  )
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Users can read own profiles" on public.user_profiles;
create policy "Users can read own profiles" on public.user_profiles for select to authenticated
using (
  (select auth.uid()) = user_id
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);
drop policy if exists "Users can update own profiles" on public.user_profiles;
create policy "Users can update own profiles" on public.user_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Members can read tenant audit" on public.audit_log;
create policy "Members can read tenant audit" on public.audit_log for select to authenticated
using (
  exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = audit_log.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended'
  )
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Members can manage tenant bookings" on public.bookings;
create policy "Members can manage tenant bookings" on public.bookings for all to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = bookings.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = bookings.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Members can manage tenant reviews" on public.reviews;
create policy "Members can manage tenant reviews" on public.reviews for all to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = reviews.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = reviews.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Members can manage tenant settings" on public.app_settings;
create policy "Members can manage tenant settings" on public.app_settings for all to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = app_settings.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = app_settings.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Members can manage tenant availability" on public.tenant_availability;
create policy "Members can manage tenant availability" on public.tenant_availability for all to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = tenant_availability.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = tenant_availability.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

drop policy if exists "Members can manage tenant blocks" on public.blocked_slots;
create policy "Members can manage tenant blocks" on public.blocked_slots for all to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = blocked_slots.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = blocked_slots.tenant_id and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
  or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tenant-assets', 'tenant-assets', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tenant members upload assets" on storage.objects;
create policy "Tenant members upload assets" on storage.objects for insert to authenticated
with check (
  bucket_id = 'tenant-assets' and (
    exists (
      select 1 from public.tenant_memberships tm
      where tm.tenant_id = (storage.foldername(name))[1]
        and tm.user_id = (select auth.uid()) and tm.status <> 'suspended'
    )
    or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
  )
);

drop policy if exists "Tenant members update assets" on storage.objects;
create policy "Tenant members update assets" on storage.objects for update to authenticated
using (
  bucket_id = 'tenant-assets' and (
    exists (select 1 from public.tenant_memberships tm where tm.tenant_id = (storage.foldername(name))[1] and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
    or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
  )
)
with check (
  bucket_id = 'tenant-assets' and (
    exists (select 1 from public.tenant_memberships tm where tm.tenant_id = (storage.foldername(name))[1] and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
    or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
  )
);

drop policy if exists "Tenant members delete assets" on storage.objects;
create policy "Tenant members delete assets" on storage.objects for delete to authenticated
using (
  bucket_id = 'tenant-assets' and (
    exists (select 1 from public.tenant_memberships tm where tm.tenant_id = (storage.foldername(name))[1] and tm.user_id = (select auth.uid()) and tm.status <> 'suspended')
    or exists (select 1 from public.platform_admins pa where pa.user_id = (select auth.uid()))
  )
);
