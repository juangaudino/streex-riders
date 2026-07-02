import type { GoogleCalendarEventPayload } from "./google-calendar.server";

type CalendarBooking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  passengers: number;
  price: number | null;
  notes: string | null;
  service_type: string;
  start_at: string | null;
  end_at: string | null;
};

const TIME_ZONE = "America/Denver";

export function googleEventIdForBooking(bookingId: string) {
  return `737472656578${bookingId.replaceAll("-", "").toLowerCase()}`;
}

export function buildGoogleCalendarRideEvent(booking: CalendarBooking): GoogleCalendarEventPayload {
  if (!booking.start_at || !booking.end_at) {
    throw new Error("The booking does not have a valid calendar time range.");
  }

  const service = booking.service_type === "hourly" ? "Hourly service" : "Private ride";
  const lines = [
    `STREEX booking: ${booking.id}`,
    `Passenger: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Service: ${service}`,
    `Passengers: ${booking.passengers}`,
    `Pickup: ${booking.pickup}`,
    `Destination: ${booking.destination}`,
    booking.price == null ? null : `Price: $${Number(booking.price).toFixed(2)}`,
    booking.notes ? `Notes: ${booking.notes}` : null,
  ].filter((line): line is string => Boolean(line));

  return {
    summary: `STREEX Ride — ${booking.name}`,
    description: lines.join("\n"),
    location: booking.pickup,
    start: { dateTime: booking.start_at, timeZone: TIME_ZONE },
    end: { dateTime: booking.end_at, timeZone: TIME_ZONE },
    visibility: "private",
    transparency: "opaque",
    extendedProperties: { private: { streexBookingId: booking.id } },
  };
}
