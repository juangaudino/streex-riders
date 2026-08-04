import { describe, expect, test } from "bun:test";
import { isAnalyticsAllowed } from "../src/lib/analytics.ts";

describe("public analytics boundaries", () => {
  test("keeps public Rides pages measurable", () => {
    expect(isAnalyticsAllowed("/")).toBe(true);
    expect(isAnalyticsAllowed("/driver/streex")).toBe(true);
  });

  test("excludes private and permanent-device surfaces", () => {
    expect(isAnalyticsAllowed("/passenger")).toBe(false);
    expect(isAnalyticsAllowed("/passenger/music")).toBe(false);
    expect(isAnalyticsAllowed("/spotify/setup")).toBe(false);
    expect(isAnalyticsAllowed("/admin")).toBe(false);
    expect(isAnalyticsAllowed("/runner-lab")).toBe(false);
  });
});
