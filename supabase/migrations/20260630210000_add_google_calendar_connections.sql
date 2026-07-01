create table if not exists public.calendar_connections (
  id text primary key,
  provider text not null default 'google' check (provider = 'google'),
  account_email text,
  encrypted_refresh_token text not null,
  scopes text[] not null default '{}',
  busy_calendar_ids jsonb not null default '[]'::jsonb,
  write_calendar_id text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_error text,
  constraint calendar_connections_busy_ids_array
    check (jsonb_typeof(busy_calendar_ids) = 'array')
);

alter table public.calendar_connections enable row level security;

revoke all on table public.calendar_connections from anon, authenticated;

comment on table public.calendar_connections is
  'Server-only OAuth connection metadata. Refresh tokens are encrypted before storage.';

