import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";
import { assertAdminAccess, DEFAULT_TENANT_ID } from "./admin-auth.server";
import type { AvailableSlot } from "./availability.functions";
import {
  manualBlockConflictMessage,
  timeRangesEqual,
  timeRangesOverlap,
} from "./schedule-conflicts";
import {
  queryGoogleCalendarFreeBusy,
  refreshGoogleCalendarAccessToken,
  type GoogleBusyInterval,
} from "./google-calendar.server";

const BLOCKING_BOOKING_STATUSES = ["quoted", "confirmed"];

type AvailabilityRow = Tables<"tenant_availability">;
type BlockRow = Tables<"blocked_slots">;
type BookingRow = Tables<"bookings">;

const GOOGLE_BUSY_CACHE_MS = 60 * 1000;
const googleBusyCache = new Map<string, { expiresAt: number; intervals: GoogleBusyInterval[] }>();

type UpdateAvailabilityInput = {
  adminKey?: string;
  daysActive: number[];
  startTime: string;
  endTime: string;
  minNoticeHours: number;
  slotDurationMinutes: number;
  defaultRideDurationMinutes: number;
  timezone: string;
};

type CreateBlockInput = {
  adminKey?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason?: string | null;
};

type DeleteBlockInput = {
  adminKey?: string;
  id: string;
};

const DEFAULT_AVAILABILITY: AvailabilityRow = {
  tenant_id: DEFAULT_TENANT_ID,
  days_active: [0, 1, 2, 3, 4, 5, 6],
  start_time: "00:00:00",
  end_time: "23:59:00",
  min_notice_hours: 12,
  slot_duration_minutes: 30,
  default_ride_duration_minutes: 60,
  timezone: "America/Denver",
  updated_at: new Date(0).toISOString(),
};

function toTimeInput(value: string) {
  return value.slice(0, 5);
}

function timeToMinutes(value: string) {
  const [hours = 0, minutes = 0] = toTimeInput(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  const asUTC = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUTC - date.getTime();
}

function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const { year, month, day } = parseLocalDate(date);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(firstPass, timeZone);
  return new Date(utcGuess.getTime() - secondOffset);
}

function weekdayForLocalDate(date: string) {
  const { year, month, day } = parseLocalDate(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

async function readGoogleBusyIntervals(
  tenantId: string,
  windowStart: Date,
  windowEnd: Date,
  timezone: string,
  failClosed = true,
) {
  const { data: connection, error } = await supabaseAdmin
    .from("calendar_connections")
    .select("encrypted_refresh_token,busy_calendar_ids,updated_at")
    .eq("id", "google-primary")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    console.error("[Google Calendar] connection read failed", error);
    if (failClosed) throw new Error("Calendar availability is temporarily unavailable.");
    return [] as GoogleBusyInterval[];
  }
  if (!connection) return [] as GoogleBusyInterval[];

  const calendarIds = Array.isArray(connection.busy_calendar_ids)
    ? connection.busy_calendar_ids.filter((item): item is string => typeof item === "string")
    : [];
  if (calendarIds.length === 0) return [] as GoogleBusyInterval[];

  const cacheKey = [
    tenantId,
    connection.updated_at,
    windowStart.toISOString(),
    windowEnd.toISOString(),
    ...calendarIds,
  ].join("|");
  const cached = googleBusyCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.intervals;

  try {
    const accessToken = await refreshGoogleCalendarAccessToken(connection.encrypted_refresh_token);
    const intervals = await queryGoogleCalendarFreeBusy(
      accessToken,
      calendarIds,
      windowStart.toISOString(),
      windowEnd.toISOString(),
      timezone,
    );
    googleBusyCache.set(cacheKey, { expiresAt: Date.now() + GOOGLE_BUSY_CACHE_MS, intervals });
    await supabaseAdmin
      .from("calendar_connections")
      .update({ last_synced_at: new Date().toISOString(), last_error: null })
      .eq("id", "google-primary")
      .eq("tenant_id", tenantId);
    return intervals;
  } catch (calendarError) {
    const message =
      calendarError instanceof Error ? calendarError.message : "Google Calendar sync failed.";
    console.error("[Google Calendar] freeBusy failed", message);
    await supabaseAdmin
      .from("calendar_connections")
      .update({ last_error: message })
      .eq("id", "google-primary")
      .eq("tenant_id", tenantId);
    if (failClosed) {
      throw new Error(
        "Calendar availability is temporarily unavailable. Please contact Juan or try again shortly.",
      );
    }
    return [] as GoogleBusyInterval[];
  }
}

function formatSlotLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function readAvailability(tenantId = DEFAULT_TENANT_ID): Promise<AvailabilityRow> {
  const { data, error } = await supabaseAdmin
    .from("tenant_availability")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    console.error("[readAvailability] read error", error);
    throw new Error("Failed to load availability settings.");
  }

  return data ?? { ...DEFAULT_AVAILABILITY, tenant_id: tenantId };
}

async function calculateAvailableSlots(tenantId: string, date: string, durationMinutes?: number) {
  const settings = await readAvailability(tenantId);
  const timezone = settings.timezone || "America/Denver";
  const day = weekdayForLocalDate(date);

  if (!settings.days_active.includes(day)) {
    return { settings, slots: [] as AvailableSlot[] };
  }

  const startMinutes = timeToMinutes(settings.start_time);
  const endMinutes = timeToMinutes(settings.end_time);
  const rideDuration = durationMinutes ?? settings.default_ride_duration_minutes;
  const slotDuration = settings.slot_duration_minutes;
  const latestStart = endMinutes - rideDuration;

  if (latestStart < startMinutes) {
    return { settings, slots: [] as AvailableSlot[] };
  }

  const windowStart = zonedDateTimeToUtc(date, minutesToTime(startMinutes), timezone);
  const windowEnd = zonedDateTimeToUtc(date, minutesToTime(endMinutes), timezone);

  const [
    { data: blocks, error: blocksError },
    { data: bookings, error: bookingsError },
    googleBusy,
  ] = await Promise.all([
    supabaseAdmin
      .from("blocked_slots")
      .select("*")
      .eq("tenant_id", tenantId)
      .lt("start_at", windowEnd.toISOString())
      .gt("end_at", windowStart.toISOString()),
    supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("status", BLOCKING_BOOKING_STATUSES)
      .lt("start_at", windowEnd.toISOString())
      .gt("end_at", windowStart.toISOString()),
    readGoogleBusyIntervals(tenantId, windowStart, windowEnd, timezone),
  ]);

  if (blocksError) {
    console.error("[calculateAvailableSlots] blocks error", blocksError);
    throw new Error("Failed to load blocked slots.");
  }

  if (bookingsError) {
    console.error("[calculateAvailableSlots] bookings error", bookingsError);
    throw new Error("Failed to load booked slots.");
  }

  const minStart = new Date(Date.now() + settings.min_notice_hours * 60 * 60 * 1000);
  const slots: AvailableSlot[] = [];

  for (let minute = startMinutes; minute <= latestStart; minute += slotDuration) {
    const start = zonedDateTimeToUtc(date, minutesToTime(minute), timezone);
    const end = new Date(start.getTime() + rideDuration * 60 * 1000);

    if (start < minStart) continue;

    const blocked = (blocks ?? []).some((block) =>
      timeRangesOverlap(start, end, block.start_at, block.end_at),
    );
    if (blocked) continue;

    const booked = (bookings ?? []).some((booking) =>
      timeRangesOverlap(start, end, booking.start_at, booking.end_at),
    );
    if (booked) continue;

    const busyInGoogle = googleBusy.some((interval) =>
      timeRangesOverlap(start, end, interval.start, interval.end),
    );
    if (busyInGoogle) continue;

    slots.push({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      time: minutesToTime(minute),
      label: durationMinutes
        ? `${formatSlotLabel(start, timezone)} - ${formatSlotLabel(end, timezone)}`
        : formatSlotLabel(start, timezone),
    });
  }

  return { settings, slots };
}

export async function resolveBookingSlotServer(
  tenantId: string,
  date: string,
  time: string,
  durationMinutes?: number,
) {
  const { settings, slots } = await calculateAvailableSlots(tenantId, date, durationMinutes);
  const selected = slots.find((slot) => slot.time === time);

  if (!selected) {
    throw new Error("This time is no longer available. Please choose another slot.");
  }

  return {
    startAt: selected.startAt,
    endAt: selected.endAt,
    durationMinutes: durationMinutes ?? settings.default_ride_duration_minutes,
  };
}

export async function getAvailableSlotsServer(
  tenantId: string | undefined,
  date: string,
  durationMinutes?: number,
) {
  const resolvedTenantId = tenantId ?? DEFAULT_TENANT_ID;
  const tenant = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("id", resolvedTenantId)
    .eq("status", "active")
    .maybeSingle();
  if (tenant.error || !tenant.data) throw new Error("This driver is not accepting bookings.");
  const { settings, slots } = await calculateAvailableSlots(
    resolvedTenantId,
    date,
    durationMinutes,
  );

  return {
    slots,
    settings: {
      minNoticeHours: settings.min_notice_hours,
      slotDurationMinutes: settings.slot_duration_minutes,
      defaultRideDurationMinutes: settings.default_ride_duration_minutes,
      timezone: settings.timezone,
    },
  };
}

export async function getAdminAvailabilityServer(adminKey: string) {
  const access = await assertAdminAccess(adminKey);
  const settings = await readAvailability(access.tenantId);
  const nowIso = new Date().toISOString();

  const [{ data: blocks, error: blocksError }, { data: agenda, error: agendaError }] =
    await Promise.all([
      supabaseAdmin
        .from("blocked_slots")
        .select("*")
        .eq("tenant_id", access.tenantId)
        .gte("end_at", nowIso)
        .order("start_at", { ascending: true }),
      supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("tenant_id", access.tenantId)
        .in("status", BLOCKING_BOOKING_STATUSES)
        .gte("end_at", nowIso)
        .order("start_at", { ascending: true })
        .limit(60),
    ]);

  if (blocksError) {
    console.error("[getAdminAvailability] blocks error", blocksError);
    throw new Error("Failed to load manual blocks.");
  }

  if (agendaError) {
    console.error("[getAdminAvailability] agenda error", agendaError);
    throw new Error("Failed to load driver agenda.");
  }

  const googleRangeStart = new Date();
  googleRangeStart.setDate(googleRangeStart.getDate() - 1);
  const googleRangeEnd = new Date();
  googleRangeEnd.setDate(googleRangeEnd.getDate() + 90);
  let googleBusy: GoogleBusyInterval[] = [];
  let googleCalendarError: string | null = null;
  try {
    googleBusy = await readGoogleBusyIntervals(
      access.tenantId,
      googleRangeStart,
      googleRangeEnd,
      settings.timezone,
      false,
    );
    const { data: googleStatus } = await supabaseAdmin
      .from("calendar_connections")
      .select("last_error")
      .eq("id", "google-primary")
      .eq("tenant_id", access.tenantId)
      .maybeSingle();
    googleCalendarError = googleStatus?.last_error ?? null;
  } catch (googleError) {
    googleCalendarError =
      googleError instanceof Error ? googleError.message : "Google Calendar sync failed.";
  }

  const visibleGoogleBusy = googleBusy.filter(
    (interval) =>
      !(agenda ?? []).some(
        (booking) =>
          booking.status === "confirmed" &&
          booking.google_sync_status === "synced" &&
          Boolean(booking.google_event_id) &&
          timeRangesEqual(booking.start_at, booking.end_at, interval.start, interval.end),
      ),
  );

  return {
    settings: {
      tenantId: settings.tenant_id,
      daysActive: settings.days_active,
      startTime: toTimeInput(settings.start_time),
      endTime: toTimeInput(settings.end_time),
      minNoticeHours: settings.min_notice_hours,
      slotDurationMinutes: settings.slot_duration_minutes,
      defaultRideDurationMinutes: settings.default_ride_duration_minutes,
      timezone: settings.timezone,
    },
    blocks: (blocks ?? []).map(serializeBlock),
    agenda: (agenda ?? []).map(serializeAgendaBooking),
    googleBusy: visibleGoogleBusy.map((interval, index) => ({
      id: `google-busy-${index}-${interval.start}`,
      startAt: interval.start,
      endAt: interval.end,
    })),
    googleCalendarError,
  };
}

export async function updateAdminAvailabilityServer(data: UpdateAvailabilityInput) {
  const access = await assertAdminAccess(data.adminKey);

  const { error } = await supabaseAdmin.from("tenant_availability").upsert(
    {
      tenant_id: access.tenantId,
      days_active: data.daysActive,
      start_time: data.startTime,
      end_time: data.endTime,
      min_notice_hours: data.minNoticeHours,
      slot_duration_minutes: data.slotDurationMinutes,
      default_ride_duration_minutes: data.defaultRideDurationMinutes,
      timezone: data.timezone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );

  if (error) {
    console.error("[updateAdminAvailability] update error", error);
    throw new Error("Failed to save availability.");
  }

  return { ok: true };
}

export async function createAdminBlockedSlotServer(data: CreateBlockInput) {
  const access = await assertAdminAccess(data.adminKey);
  const settings = await readAvailability(access.tenantId);
  const start = zonedDateTimeToUtc(data.startDate, data.startTime, settings.timezone);
  const end = zonedDateTimeToUtc(data.endDate, data.endTime, settings.timezone);

  if (end <= start) {
    throw new Error("Block end must be after the start.");
  }

  const { error } = await supabaseAdmin.from("blocked_slots").insert({
    tenant_id: access.tenantId,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    reason: data.reason?.trim() || null,
  });

  if (error) {
    console.error("[createAdminBlockedSlot] insert error", error);
    throw new Error(manualBlockConflictMessage(error) ?? "Failed to add block.");
  }

  return { ok: true };
}

export async function deleteAdminBlockedSlotServer(data: DeleteBlockInput) {
  const access = await assertAdminAccess(data.adminKey);
  const { error } = await supabaseAdmin
    .from("blocked_slots")
    .delete()
    .eq("id", data.id)
    .eq("tenant_id", access.tenantId);

  if (error) {
    console.error("[deleteAdminBlockedSlot] delete error", error);
    throw new Error("Failed to delete block.");
  }

  return { ok: true };
}

function serializeBlock(block: BlockRow) {
  return {
    id: block.id,
    startAt: block.start_at,
    endAt: block.end_at,
    reason: block.reason,
    createdAt: block.created_at,
  };
}

function serializeAgendaBooking(booking: BookingRow) {
  return {
    id: booking.id,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    pickup: booking.pickup,
    destination: booking.destination,
    date: booking.date,
    time: booking.time,
    startAt: booking.start_at,
    endAt: booking.end_at,
    serviceType: booking.service_type,
    estimatedDurationMinutes: booking.estimated_duration_minutes,
    passengers: booking.passengers,
    price: booking.price,
    status: booking.status,
  };
}
