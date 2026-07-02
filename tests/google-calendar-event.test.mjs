import { describe, expect, test } from "bun:test";
import {
  buildGoogleCalendarRideEvent,
  googleEventIdForBooking,
} from "../src/lib/google-calendar-event.ts";

const booking = {
  id: "a0b1c2d3-e4f5-4678-9012-abcdef123456",
  name: "Test Passenger",
  phone: "801-555-0100",
  email: "passenger@example.com",
  pickup: "Salt Lake City International Airport",
  destination: "Park City",
  passengers: 2,
  price: 145,
  notes: "Two ski bags",
  service_type: "ride",
  start_at: "2026-07-10T21:00:00.000Z",
  end_at: "2026-07-10T22:00:00.000Z",
};

describe("Google Calendar ride events", () => {
  test("uses a stable Google-compatible event id", () => {
    const first = googleEventIdForBooking(booking.id);
    const second = googleEventIdForBooking(booking.id);

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-v]{5,1024}$/);
  });

  test("builds a private opaque event without attendees", () => {
    const event = buildGoogleCalendarRideEvent(booking);

    expect(event.summary).toBe("STREEX Ride — Test Passenger");
    expect(event.visibility).toBe("private");
    expect(event.transparency).toBe("opaque");
    expect(event.extendedProperties.private.streexBookingId).toBe(booking.id);
    expect(event).not.toHaveProperty("attendees");
  });

  test("requires canonical start and end timestamps", () => {
    expect(() => buildGoogleCalendarRideEvent({ ...booking, end_at: null })).toThrow(
      "valid calendar time range",
    );
  });
});
