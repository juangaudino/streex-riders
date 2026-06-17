-- STREEX Rides booking service type, Phase 4.2.
-- Apply this to the current production Supabase project after availability_phase_4_1.sql.

alter table public.bookings
  add column if not exists service_type text not null default 'ride';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_service_type_check'
  ) then
    alter table public.bookings
      add constraint bookings_service_type_check
      check (service_type in ('ride','hourly'));
  end if;
end $$;

update public.bookings
set service_type = 'ride'
where service_type is null or service_type = '';
