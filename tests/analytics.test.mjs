import { describe, expect, test } from "bun:test";
import {
  getAnalyticsPageParams,
  isAnalyticsAllowed,
  sanitizeAnalyticsUrl,
} from "../src/lib/analytics.ts";

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

  test("excludes booking responses and tokenized previews before Analytics starts", () => {
    expect(isAnalyticsAllowed("/booking/accept")).toBe(false);
    expect(isAnalyticsAllowed("/booking/decline")).toBe(false);
    expect(isAnalyticsAllowed("/streex", "?preview=synthetic-preview-token")).toBe(false);
    expect(isAnalyticsAllowed("/streex", "")).toBe(true);
  });

  test("removes query strings and hashes from page and referrer payloads", () => {
    expect(sanitizeAnalyticsUrl("https://rides.getstreex.com/driver/streex?source=ad#hero")).toBe(
      "https://rides.getstreex.com/driver/streex",
    );
    expect(
      getAnalyticsPageParams(
        "https://rides.getstreex.com/driver/streex?booking=synthetic-id#quote",
        "https://mail.example.test/message?preview=synthetic-preview-token#content",
      ),
    ).toEqual({
      page_location: "https://rides.getstreex.com/driver/streex",
      page_referrer: "https://mail.example.test/message",
    });
  });

  test("keeps Analytics helpers safe during SSR", () => {
    expect(() => isAnalyticsAllowed()).not.toThrow();
    expect(isAnalyticsAllowed()).toBe(false);
  });
});
