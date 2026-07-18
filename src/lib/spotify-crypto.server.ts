import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getEncryptionKey() {
  const encoded = process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encoded) throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY is not configured.");

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }
  return key;
}

export function encryptSpotifyToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSpotifyToken(value: string) {
  const [ivPart, tagPart, encryptedPart] = value.split(".");
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Invalid encrypted Spotify token.");

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

export function createSpotifyOAuthState() {
  const payload = Buffer.from(
    JSON.stringify({ issuedAt: Date.now(), nonce: randomBytes(18).toString("base64url") }),
  ).toString("base64url");
  const signature = createHmac("sha256", getEncryptionKey()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySpotifyOAuthState(state: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) throw new Error("Invalid Spotify authorization state.");

  const expected = createHmac("sha256", getEncryptionKey()).update(payload).digest("base64url");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw new Error("Invalid Spotify authorization state.");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    issuedAt?: number;
  };
  if (!parsed.issuedAt || Date.now() - parsed.issuedAt > STATE_MAX_AGE_MS) {
    throw new Error("Spotify authorization expired. Please start again.");
  }
}
