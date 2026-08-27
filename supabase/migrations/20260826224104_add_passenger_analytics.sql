-- Private, anonymous Passenger Console analytics. These tables deliberately do
-- not store passenger identity, addresses, GPS, user agents, or device serials.
create table if not exists public.passenger_analytics_sessions (
  id uuid primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  device_installation_id uuid not null,
  lifecycle text not null default 'tablet_unverified'
    check (lifecycle in ('tablet_unverified', 'driver_confirmed')),
  started_at timestamptz not null,
  last_active_at timestamptz not null,
  active_duration_ms bigint not null default 0
    check (active_duration_ms >= 0 and active_duration_ms <= 86400000),
  interaction_count integer not null default 0
    check (interaction_count >= 0 and interaction_count <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.passenger_analytics_events (
  id uuid primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  session_id uuid not null references public.passenger_analytics_sessions(id) on delete cascade,
  event_name text not null check (event_name in (
    'session_started',
    'first_interaction',
    'screen_viewed',
    'music_opened',
    'music_action',
    'game_opened',
    'game_started',
    'game_completed',
    'idle_entered',
    'idle_resumed',
    'logical_rest_entered',
    'logical_rest_resumed',
    'phone_continuation_opened'
  )),
  screen text not null check (screen in (
    'home', 'music', 'games', 'streex', 'meet_juan', 'services', 'contact',
    'reviews', 'tip', 'where_we_ride', 'around_you', 'idle'
  )),
  element text not null check (element in (
    'console', 'navigation', 'music', 'music_playback', 'game', 'idle',
    'logical_rest', 'phone_qr', 'streex_action'
  )),
  occurred_at timestamptz not null,
  duration_ms integer check (duration_ms is null or (duration_ms >= 0 and duration_ms <= 86400000)),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  received_at timestamptz not null default now()
);

create index if not exists passenger_analytics_sessions_tenant_started_idx
  on public.passenger_analytics_sessions(tenant_id, started_at desc);
create index if not exists passenger_analytics_events_tenant_occurred_idx
  on public.passenger_analytics_events(tenant_id, occurred_at desc);
create index if not exists passenger_analytics_events_session_occurred_idx
  on public.passenger_analytics_events(session_id, occurred_at asc);

alter table public.passenger_analytics_sessions enable row level security;
alter table public.passenger_analytics_events enable row level security;

-- Data is only written/read through authenticated server functions using the
-- service role. Do not expose either table to anon or authenticated clients.
revoke all on table public.passenger_analytics_sessions from anon, authenticated;
revoke all on table public.passenger_analytics_events from anon, authenticated;
grant all on table public.passenger_analytics_sessions to service_role;
grant all on table public.passenger_analytics_events to service_role;
