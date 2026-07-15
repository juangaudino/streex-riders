import type { Tables } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  deleteGoogleCalendarEvent,
  refreshGoogleCalendarAccessToken,
  upsertGoogleCalendarEvent,
} from "./google-calendar.server";
import { buildGoogleCalendarRideEvent, googleEventIdForBooking } from "./google-calendar-event";

type BookingRow = Tables<"bookings">;

const CONNECTION_ID = "google-primary";
async function recordSyncState(
  bookingId: string,
  values: Pick<
    BookingRow,
    | "google_calendar_id"
    | "google_event_id"
    | "google_sync_status"
    | "google_sync_error"
    | "google_synced_at"
  >,
) {
  const { error } = await supabaseAdmin.from("bookings").update(values).eq("id", bookingId);
  if (error) console.error("[Google Calendar] booking sync state update failed", error);
}

export async function syncBookingWithGoogleCalendar(
  booking: BookingRow,
  tenantId = booking.tenant_id,
) {
  if (booking.status !== "confirmed" && booking.status !== "cancelled") {
    return { status: "unchanged" as const };
  }

  const { data: connection, error: connectionError } = await supabaseAdmin
    .from("calendar_connections")
    .select("encrypted_refresh_token,write_calendar_id")
    .eq("id", CONNECTION_ID)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const eventId = booking.google_event_id || googleEventIdForBooking(booking.id);
  const calendarId = booking.google_calendar_id || connection?.write_calendar_id || null;

  if (connectionError || !connection || !calendarId) {
    const message = connectionError
      ? "Google Calendar connection could not be read."
      : "Choose a write calendar in Admin before synchronizing confirmed rides.";
    await recordSyncState(booking.id, {
      google_calendar_id: calendarId,
      google_event_id: eventId,
      google_sync_status: "error",
      google_sync_error: message,
      google_synced_at: null,
    });
    return { status: "error" as const, error: message };
  }

  await recordSyncState(booking.id, {
    google_calendar_id: calendarId,
    google_event_id: eventId,
    google_sync_status: "pending",
    google_sync_error: null,
    google_synced_at: booking.google_synced_at,
  });

  try {
    const accessToken = await refreshGoogleCalendarAccessToken(connection.encrypted_refresh_token);
    if (booking.status === "cancelled") {
      await deleteGoogleCalendarEvent(accessToken, calendarId, eventId);
      await recordSyncState(booking.id, {
        google_calendar_id: calendarId,
        google_event_id: eventId,
        google_sync_status: "deleted",
        google_sync_error: null,
        google_synced_at: new Date().toISOString(),
      });
      return { status: "deleted" as const };
    }

    await upsertGoogleCalendarEvent(
      accessToken,
      calendarId,
      eventId,
      buildGoogleCalendarRideEvent(booking),
    );
    await recordSyncState(booking.id, {
      google_calendar_id: calendarId,
      google_event_id: eventId,
      google_sync_status: "synced",
      google_sync_error: null,
      google_synced_at: new Date().toISOString(),
    });
    return { status: "synced" as const };
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Google Calendar sync failed.";
    console.error("[Google Calendar] booking sync failed", message);
    await recordSyncState(booking.id, {
      google_calendar_id: calendarId,
      google_event_id: eventId,
      google_sync_status: "error",
      google_sync_error: message,
      google_synced_at: booking.google_synced_at,
    });
    return { status: "error" as const, error: message };
  }
}
