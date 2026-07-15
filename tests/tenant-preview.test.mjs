import { beforeAll, describe, expect, test } from "bun:test";

let createTenantPreviewToken;
let verifyTenantPreviewToken;

beforeAll(async () => {
  process.env.TENANT_PREVIEW_SECRET = "test-only-preview-secret-with-more-than-32-characters";
  ({ createTenantPreviewToken, verifyTenantPreviewToken } =
    await import("../src/lib/tenant-preview.server.ts"));
});

describe("tenant preview tokens", () => {
  test("authorizes only the tenant encoded in the signed token", () => {
    const token = createTenantPreviewToken("driver2");
    expect(verifyTenantPreviewToken(token, "driver2")).toBe(true);
    expect(verifyTenantPreviewToken(token, "streex")).toBe(false);
  });

  test("rejects a modified signature", () => {
    const token = createTenantPreviewToken("driver2");
    expect(verifyTenantPreviewToken(`${token}tampered`, "driver2")).toBe(false);
  });
});
