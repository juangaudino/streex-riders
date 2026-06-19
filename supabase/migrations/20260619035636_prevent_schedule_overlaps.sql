-- Prevent quoted/confirmed bookings and manual blocks from overlapping.
-- Pending requests may still overlap by design; the first request promoted to
-- a blocking status wins. Tenant-scoped advisory locks serialize concurrent
-- promotions and block creation inside the same transaction.

create schema if not exists private;

create or replace function private.prevent_booking_schedule_overlap()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status not in ('quoted', 'confirmed') then
    return new;
  end if;

  if new.start_at is null or new.end_at is null or new.end_at <= new.start_at then
    raise exception using
      errcode = '22007',
      message = 'BOOKING_SCHEDULE_INVALID';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('streex-schedule:' || new.tenant_id, 0)
  );

  if exists (
    select 1
    from public.bookings as other
    where other.tenant_id = new.tenant_id
      and other.id is distinct from new.id
      and other.status in ('quoted', 'confirmed')
      and other.start_at is not null
      and other.end_at is not null
      and other.start_at < new.end_at
      and other.end_at > new.start_at
  ) then
    raise exception using
      errcode = '23P01',
      message = 'BOOKING_SCHEDULE_CONFLICT';
  end if;

  if exists (
    select 1
    from public.blocked_slots as block
    where block.tenant_id = new.tenant_id
      and block.start_at < new.end_at
      and block.end_at > new.start_at
  ) then
    raise exception using
      errcode = '23P01',
      message = 'BOOKING_MANUAL_BLOCK_CONFLICT';
  end if;

  return new;
end;
$$;

create or replace function private.prevent_blocked_slot_booking_overlap()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended('streex-schedule:' || new.tenant_id, 0)
  );

  if exists (
    select 1
    from public.bookings as booking
    where booking.tenant_id = new.tenant_id
      and booking.status in ('quoted', 'confirmed')
      and booking.start_at is not null
      and booking.end_at is not null
      and booking.start_at < new.end_at
      and booking.end_at > new.start_at
  ) then
    raise exception using
      errcode = '23P01',
      message = 'MANUAL_BLOCK_BOOKING_CONFLICT';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_booking_schedule_overlap on public.bookings;
create trigger prevent_booking_schedule_overlap
before insert or update of status, start_at, end_at, tenant_id
on public.bookings
for each row
execute function private.prevent_booking_schedule_overlap();

drop trigger if exists prevent_blocked_slot_booking_overlap on public.blocked_slots;
create trigger prevent_blocked_slot_booking_overlap
before insert or update of start_at, end_at, tenant_id
on public.blocked_slots
for each row
execute function private.prevent_blocked_slot_booking_overlap();

create index if not exists idx_bookings_blocking_schedule
  on public.bookings (tenant_id, start_at, end_at)
  where status in ('quoted', 'confirmed')
    and start_at is not null
    and end_at is not null;

revoke all on function private.prevent_booking_schedule_overlap() from public;
revoke all on function private.prevent_booking_schedule_overlap() from anon, authenticated;
revoke all on function private.prevent_blocked_slot_booking_overlap() from public;
revoke all on function private.prevent_blocked_slot_booking_overlap() from anon, authenticated;
