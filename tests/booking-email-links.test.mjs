import { beforeAll, describe, expect, test } from "bun:test";

let buildPassengerQuote;
let verifyBookingResponseToken;

const testSecret = "test-only-booking-response-secret-with-more-than-32-characters";
const booking = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Synthetic Rider",
  price: 120,
  phone: "+18015550123",
  email: "synthetic@example.test",
  pickup: "Synthetic pickup",
  destination: "Synthetic destination",
  date: "2026-09-10",
  time: "10:00",
  passengers: 1,
  service_type: "ride",
};

beforeAll(async () => {
  process.env.BOOKING_RESPONSE_TOKEN_SECRET = testSecret;
  ({ buildPassengerQuote } = await import("../src/lib/booking-emails.server.ts"));
  ({ verifyBookingResponseToken } = await import("../src/lib/booking-response-token.server.ts"));
});

describe("passenger quote response links", () => {
  test("uses separate signed capabilities instead of legacy booking UUID query parameters", () => {
    const { html } = buildPassengerQuote(booking);
    const urls = [
      ...html.matchAll(/href="([^\"]*\/booking\/(?:accept|decline)\?token=[^\"]+)"/g),
    ].map((match) => new URL(match[1]));

    expect(urls).toHaveLength(2);

    const accept = urls.find((url) => url.pathname === "/booking/accept");
    const decline = urls.find((url) => url.pathname === "/booking/decline");
    expect(accept?.searchParams.get("id")).toBeNull();
    expect(decline?.searchParams.get("id")).toBeNull();
    expect(verifyBookingResponseToken(accept?.searchParams.get("token"), "accept")).toEqual({
      bookingId: booking.id,
    });
    expect(verifyBookingResponseToken(decline?.searchParams.get("token"), "decline")).toEqual({
      bookingId: booking.id,
    });
  });
});
