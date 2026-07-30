import { createHmac, timingSafeEqual } from "node:crypto";

type PreviewPayload = { tenantId: string; expiresAt: number };

function secret() {
  const value =
    process.env.TENANT_PREVIEW_SECRET || process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
  if (!value || value.length < 32) throw new Error("TENANT_PREVIEW_SECRET is not configured.");
  return value;
}

function sign(encoded: string) {
  return createHmac("sha256", secret()).update(encoded).digest("base64url");
}

export function createTenantPreviewToken(tenantId: string) {
  const payload: PreviewPayload = { tenantId, expiresAt: Date.now() + 30 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyTenantPreviewToken(token: string, tenantId: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as PreviewPayload;
    return payload.tenantId === tenantId && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}
