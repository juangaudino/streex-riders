create table if not exists public.spotify_connections (
  id text primary key,
  encrypted_refresh_token text not null,
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_error text
);

alter table public.spotify_connections enable row level security;

revoke all on table public.spotify_connections from anon, authenticated;

comment on table public.spotify_connections is
  'Server-only personal Spotify OAuth connection. Refresh tokens are encrypted before storage and never exposed to the browser.';
