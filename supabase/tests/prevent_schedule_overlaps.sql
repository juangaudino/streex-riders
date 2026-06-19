-- Run after 20260619035636_prevent_schedule_overlaps.sql.
-- Every change is rolled back; no test data remains.

begin;

insert into public.bookings (
  id, tenant_id, service_type, name, phone, email, pickup, destination,
  date, time, start_at, end_at, estimated_duration_minutes, passengers, status
)
values
  (
    '00000000-0000-4000-8000-000000000101', '__schedule_test__', 'hourly',
    'Overlap Test A', '555-0101', 'overlap-a@example.test', 'A', 'B',
    '2099-01-15', '10:00', '2099-01-15 17:00:00+00', '2099-01-15 20:00:00+00',
    180, 1, 'pending'
  ),
  (
    '00000000-0000-4000-8000-000000000102', '__schedule_test__', 'ride',
    'Overlap Test B', '555-0102', 'overlap-b@example.test', 'C', 'D',
    '2099-01-15', '11:00', '2099-01-15 18:00:00+00', '2099-01-15 19:00:00+00',
    60, 1, 'pending'
  );

update public.bookings
set status = 'quoted'
where id = '00000000-0000-4000-8000-000000000101';

do $$
begin
  begin
    update public.bookings
    set status = 'quoted'
    where id = '00000000-0000-4000-8000-000000000102';
    raise exception 'Expected overlapping booking to be rejected';
  exception
    when exclusion_violation then
      null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.blocked_slots (tenant_id, start_at, end_at, reason)
    values (
      '__schedule_test__',
      '2099-01-15 18:30:00+00',
      '2099-01-15 19:30:00+00',
      'Overlap test'
    );
    raise exception 'Expected overlapping manual block to be rejected';
  exception
    when exclusion_violation then
      null;
  end;
end;
$$;

update public.bookings
set status = 'cancelled'
where id = '00000000-0000-4000-8000-000000000101';

insert into public.blocked_slots (tenant_id, start_at, end_at, reason)
values (
  '__schedule_test__',
  '2099-01-15 18:30:00+00',
  '2099-01-15 19:30:00+00',
  'Overlap test'
);

do $$
begin
  begin
    update public.bookings
    set status = 'confirmed'
    where id = '00000000-0000-4000-8000-000000000102';
    raise exception 'Expected booking overlapping manual block to be rejected';
  exception
    when exclusion_violation then
      null;
  end;
end;
$$;

rollback;
