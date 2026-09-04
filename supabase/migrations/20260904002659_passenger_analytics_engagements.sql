-- A browser load is useful operational telemetry, but it is not a reliable
-- proxy for a passenger. An engagement begins when a passenger interacts
-- with Passenger and closes when the console returns to idle. It contains no
-- identity, route, GPS, user agent, screen coordinates or device serial.
create table public.passenger_analytics_engagements (
  id uuid primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  device_installation_id uuid not null,
  lifecycle text not null default 'tablet_unverified'
    check (lifecycle in ('tablet_unverified', 'driver_confirmed')),
  entry_screen text not null check (entry_screen in (
    'home', 'music', 'games', 'streex', 'meet_juan', 'services', 'contact',
    'reviews', 'tip', 'where_we_ride', 'around_you', 'idle'
  )),
  entry_source text not null check (entry_source in (
    'initial_interaction', 'idle_resume', 'test_control'
  )),
  started_at timestamptz not null,
  last_active_at timestamptz not null,
  ended_at timestamptz,
  ended_by text check (ended_by in ('idle', 'logical_rest', 'pagehide')),
  active_duration_ms bigint not null default 0
    check (active_duration_ms >= 0 and active_duration_ms <= 86400000),
  interaction_count integer not null default 0
    check (interaction_count >= 0 and interaction_count <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((ended_at is null and ended_by is null) or (ended_at is not null and ended_by is not null))
);

alter table public.passenger_analytics_events
  add column engagement_id uuid references public.passenger_analytics_engagements(id) on delete set null;

create index passenger_analytics_engagements_tenant_started_idx
  on public.passenger_analytics_engagements(tenant_id, started_at desc);
create index passenger_analytics_engagements_device_started_idx
  on public.passenger_analytics_engagements(device_installation_id, started_at desc);
create index passenger_analytics_events_tenant_engagement_occurred_idx
  on public.passenger_analytics_events(tenant_id, engagement_id, occurred_at asc)
  where engagement_id is not null;

alter table public.passenger_analytics_engagements enable row level security;

-- Keep the new episode table private like the existing Passenger analytics
-- tables. Only the server-side broker and authenticated Admin summary read it.
revoke all on table public.passenger_analytics_engagements from anon, authenticated;
grant all on table public.passenger_analytics_engagements to service_role;
