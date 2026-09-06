import { createHmac, timingSafeEqual } from "node:crypto";

export const BOOKING_RESPONSE_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

export type BookingResponseAction = "accept" | "decline";

type BookingResponseTokenPayload = {
  action: BookingResponseAction;
  bookingId: string;
  expiresAt: number;
  purpose: "booking-response-v1";
};

function tokenSecret() {
  const value =
    process.env.BOOKING_RESPONSE_TOKEN_SECRET?.trim() || process.env.TENANT_PREVIEW_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new Error("BOOKING_RESPONSE_TOKEN_SECRET is not configured.");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
}

export function assertBookingResponseTokenConfigured() {
  tokenSecret();
}

export function createBookingResponseToken(
  bookingId: string,
  action: BookingResponseAction,
  now = Date.now(),
) {
  const payload = Buffer.from(
    JSON.stringify({
      bookingId,
      action,
      expiresAt: now + BOOKING_RESPONSE_TOKEN_TTL_MS,
      purpose: "booking-response-v1",
    } satisfies BookingResponseTokenPayload),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyBookingResponseToken(
  value: string | undefined,
  action: BookingResponseAction,
  now = Date.now(),
) {
  if (!value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;

  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as BookingResponseTokenPayload;
    if (
      parsed.purpose !== "booking-response-v1" ||
      parsed.action !== action ||
      typeof parsed.bookingId !== "string" ||
      !parsed.bookingId ||
      !Number.isSafeInteger(parsed.expiresAt) ||
      parsed.expiresAt <= now
    ) {
      return null;
    }
    return { bookingId: parsed.bookingId };
  } catch {
    return null;
  }
}
