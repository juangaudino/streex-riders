-- STREEX Rides production schema for the new standalone Supabase project.
-- This is the clean baseline for leaving Lovable. Do not apply the old demo
-- migration history to the new project unless you intentionally want that history.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'streex',
  service_type text not null default 'ride'
    check (service_type in ('ride','hourly')),
  name text not null,
  phone text not null,
  email text not null,
  pickup text not null,
  destination text not null,
  date text not null,
  time text not null,
  start_at timestamptz,
  end_at timestamptz,
  estimated_duration_minutes integer not null default 60
    check (estimated_duration_minutes between 5 and 1440),
  passengers integer not null check (passengers between 1 and 8),
  notes text,
  price numeric(10,2),
  status text not null default 'pending'
    check (status in ('pending','quoted','confirmed','declined','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_availability (
  tenant_id text primary key,
  days_active integer[] not null default '{0,1,2,3,4,5,6}',
  start_time time not null default '00:00',
  end_time time not null default '23:59',
  min_notice_hours integer not null default 12 check (min_notice_hours between 0 and 720),
  slot_duration_minutes integer not null default 30 check (slot_duration_minutes between 5 and 240),
  default_ride_duration_minutes integer not null default 60
    check (default_ride_duration_minutes between 5 and 1440),
  timezone text not null default 'America/Denver',
  updated_at timestamptz not null default now()
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'streex',
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_slots_range_check check (end_at > start_at)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text,
  rating smallint not null check (rating between 1 and 5),
  message text not null,
  location text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.runner_scores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint runner_scores_name_length check (char_length(trim(name)) between 1 and 24),
  constraint runner_scores_score_range check (score >= 0 and score <= 999999),
  constraint runner_scores_status_check check (status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('ticker_style', 'boarding')
on conflict (key) do nothing;

insert into public.app_settings (key, value)
values ('site_config_v2', '{}')
on conflict (key) do nothing;

insert into public.tenant_availability (tenant_id)
values ('streex')
on conflict (tenant_id) do nothing;

create index if not exists idx_bookings_status_created
  on public.bookings(status, created_at desc);

create index if not exists idx_bookings_tenant_schedule
  on public.bookings(tenant_id, start_at, end_at, status);

create index if not exists idx_blocked_slots_tenant_range
  on public.blocked_slots(tenant_id, start_at, end_at);

create index if not exists idx_reviews_status_created_at
  on public.reviews(status, created_at desc);

create index if not exists runner_scores_public_leaderboard_idx
  on public.runner_scores(score desc, created_at asc)
  where status = 'approved';

create index if not exists runner_scores_admin_status_idx
  on public.runner_scores(status, created_at desc);

grant usage on schema public to anon, authenticated;
grant all on public.bookings to service_role;
grant all on public.reviews to service_role;
grant all on public.runner_scores to service_role;
grant all on public.app_settings to service_role;
grant all on public.tenant_availability to service_role;
grant all on public.blocked_slots to service_role;

alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.runner_scores enable row level security;
alter table public.app_settings enable row level security;
alter table public.tenant_availability enable row level security;
alter table public.blocked_slots enable row level security;

drop policy if exists "Service role can manage bookings" on public.bookings;
create policy "Service role can manage bookings"
on public.bookings
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role can manage reviews" on public.reviews;
create policy "Service role can manage reviews"
on public.reviews
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role can manage runner scores" on public.runner_scores;
create policy "Service role can manage runner scores"
on public.runner_scores
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role can manage app settings" on public.app_settings;
create policy "Service role can manage app settings"
on public.app_settings
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role can manage tenant availability" on public.tenant_availability;
create policy "Service role can manage tenant availability"
on public.tenant_availability
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role can manage blocked slots" on public.blocked_slots;
create policy "Service role can manage blocked slots"
on public.blocked_slots
for all
to service_role
using (true)
with check (true);
