import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "streex_passenger_console";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  expiresAt: number;
  nonce: string;
  purpose: "passenger-console";
};

function getSessionSecret() {
  const encoded = process.env.PASSENGER_CONSOLE_SESSION_SECRET?.trim();
  if (!encoded) throw new Error("PASSENGER_CONSOLE_SESSION_SECRET is not configured.");

  const secret = Buffer.from(encoded, "base64");
  if (secret.length !== 32) {
    throw new Error("PASSENGER_CONSOLE_SESSION_SECRET must be 32 bytes encoded as base64.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createPassengerConsoleSession() {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      nonce: randomBytes(18).toString("base64url"),
      purpose: "passenger-console",
    } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyPassengerConsoleSession(value: string | undefined) {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return parsed.purpose === "passenger-console" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function buildPassengerConsoleCookie(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Strict${secure}`;
}

export function getPassengerConsoleCookieName() {
  return COOKIE_NAME;
}
