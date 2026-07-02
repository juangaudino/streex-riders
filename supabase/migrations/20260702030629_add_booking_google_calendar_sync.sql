alter table public.bookings
  add column if not exists google_calendar_id text,
  add column if not exists google_event_id text,
  add column if not exists google_sync_status text not null default 'not_synced',
  add column if not exists google_sync_error text,
  add column if not exists google_synced_at timestamptz;

alter table public.bookings
  drop constraint if exists bookings_google_sync_status_check;

alter table public.bookings
  add constraint bookings_google_sync_status_check
  check (google_sync_status in ('not_synced', 'pending', 'synced', 'deleted', 'error'));

create unique index if not exists bookings_google_event_id_unique
  on public.bookings (google_event_id)
  where google_event_id is not null;

create index if not exists bookings_google_sync_attention_idx
  on public.bookings (google_sync_status, created_at desc)
  where google_sync_status in ('pending', 'error');

comment on column public.bookings.google_event_id is
  'Deterministic Google Calendar event id used to make synchronization idempotent.';
comment on column public.bookings.google_sync_status is
  'Server-managed Google Calendar synchronization state.';
