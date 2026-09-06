import { beforeAll, describe, expect, test } from "bun:test";

let BOOKING_RESPONSE_TOKEN_TTL_MS;
let createBookingResponseToken;
let verifyBookingResponseToken;

const testSecret = "test-only-booking-response-secret-with-more-than-32-characters";
const bookingId = "11111111-1111-4111-8111-111111111111";
const issuedAt = 1_700_000_000_000;

beforeAll(async () => {
  process.env.BOOKING_RESPONSE_TOKEN_SECRET = testSecret;
  ({ BOOKING_RESPONSE_TOKEN_TTL_MS, createBookingResponseToken, verifyBookingResponseToken } =
    await import("../src/lib/booking-response-token.server.ts"));
});

describe("booking response tokens", () => {
  test("authorizes only the intended booking action during its 72-hour lifetime", () => {
    const token = createBookingResponseToken(bookingId, "accept", issuedAt);

    expect(verifyBookingResponseToken(token, "accept", issuedAt)).toEqual({ bookingId });
    expect(verifyBookingResponseToken(token, "decline", issuedAt)).toBeNull();
    expect(
      verifyBookingResponseToken(token, "accept", issuedAt + BOOKING_RESPONSE_TOKEN_TTL_MS - 1),
    ).toEqual({
      bookingId,
    });
    expect(
      verifyBookingResponseToken(token, "accept", issuedAt + BOOKING_RESPONSE_TOKEN_TTL_MS),
    ).toBeNull();
  });

  test("rejects a changed signature or malformed capability", () => {
    const token = createBookingResponseToken(bookingId, "decline", issuedAt);

    expect(verifyBookingResponseToken(`${token}tampered`, "decline", issuedAt)).toBeNull();
    expect(verifyBookingResponseToken("not-a-capability", "decline", issuedAt)).toBeNull();
  });
});
