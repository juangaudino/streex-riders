alter table public.bookings
  add column if not exists tenant_id text not null default 'streex',
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists estimated_duration_minutes integer not null default 60;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_estimated_duration_minutes_check') then
    alter table public.bookings add constraint bookings_estimated_duration_minutes_check check (estimated_duration_minutes between 5 and 1440);
  end if;
end $$;

update public.bookings
set
  tenant_id = coalesce(nullif(tenant_id, ''), 'streex'),
  estimated_duration_minutes = coalesce(estimated_duration_minutes, 60),
  start_at = ((date || ' ' || time)::timestamp at time zone 'America/Denver'),
  end_at = (((date || ' ' || time)::timestamp + make_interval(mins => coalesce(estimated_duration_minutes, 60))) at time zone 'America/Denver')
where start_at is null
  and date ~ '^\d{4}-\d{2}-\d{2}$'
  and time ~ '^\d{2}:\d{2}';

create table if not exists public.tenant_availability (
  tenant_id text primary key,
  days_active integer[] not null default '{0,1,2,3,4,5,6}',
  start_time time not null default '00:00',
  end_time time not null default '23:59',
  min_notice_hours integer not null default 12 check (min_notice_hours between 0 and 720),
  slot_duration_minutes integer not null default 30 check (slot_duration_minutes between 5 and 240),
  default_ride_duration_minutes integer not null default 60 check (default_ride_duration_minutes between 5 and 1440),
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

insert into public.tenant_availability (tenant_id) values ('streex') on conflict (tenant_id) do nothing;

create index if not exists idx_bookings_tenant_schedule on public.bookings(tenant_id, start_at, end_at, status);
create index if not exists idx_blocked_slots_tenant_range on public.blocked_slots(tenant_id, start_at, end_at);

grant all on public.tenant_availability to service_role;
grant all on public.blocked_slots to service_role;

alter table public.tenant_availability enable row level security;
alter table public.blocked_slots enable row level security;

drop policy if exists "Service role can manage tenant availability" on public.tenant_availability;
create policy "Service role can manage tenant availability" on public.tenant_availability for all to service_role using (true) with check (true);

drop policy if exists "Service role can manage blocked slots" on public.blocked_slots;
create policy "Service role can manage blocked slots" on public.blocked_slots for all to service_role using (true) with check (true);

alter table public.bookings add column if not exists service_type text not null default 'ride';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_service_type_check') then
    alter table public.bookings add constraint bookings_service_type_check check (service_type in ('ride','hourly'));
  end if;
end $$;

update public.bookings set service_type = 'ride' where service_type is null or service_type = '';