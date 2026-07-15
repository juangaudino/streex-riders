import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getEncryptionKey() {
  const encoded = process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encoded) {
    throw new Error("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }
  return key;
}

export function encryptCalendarToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptCalendarToken(value: string) {
  const [ivPart, tagPart, encryptedPart] = value.split(".");
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Invalid encrypted calendar token.");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export type CalendarOAuthState = {
  issuedAt: number;
  nonce: string;
  tenantId: string;
  userId: string | null;
};

export function createCalendarOAuthState(input: { tenantId: string; userId: string | null }) {
  const state: CalendarOAuthState = {
    issuedAt: Date.now(),
    nonce: randomBytes(18).toString("base64url"),
    tenantId: input.tenantId,
    userId: input.userId,
  };
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = createHmac("sha256", getEncryptionKey()).update(payload).digest("base64url");
  return { state: `${payload}.${signature}`, payload: state };
}

export function verifyCalendarOAuthState(state: string): CalendarOAuthState {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) throw new Error("Invalid Google authorization state.");

  const expected = createHmac("sha256", getEncryptionKey()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeStringEqual(signature, expected)) {
    throw new Error("Invalid Google authorization state.");
  }

  const parsed = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as Partial<CalendarOAuthState>;
  if (
    !parsed.issuedAt ||
    !parsed.nonce ||
    !parsed.tenantId ||
    Date.now() - parsed.issuedAt > STATE_MAX_AGE_MS
  ) {
    throw new Error("Google authorization expired. Please start again from Admin.");
  }
  return parsed as CalendarOAuthState;
}

function timingSafeStringEqual(left: string, right: string) {
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
