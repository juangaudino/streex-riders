import { describe, expect, test } from "bun:test";
import { IntlNamedTimeZoneImpl } from "../src/lib/fullcalendar-intl-timezone.ts";

const denver = new IntlNamedTimeZoneImpl("America/Denver");

describe("FullCalendar America/Denver timezone", () => {
  test("converts a summer UTC timestamp to Denver wall time", () => {
    expect(denver.timestampToArray(Date.parse("2026-06-19T21:00:00.000Z"))).toEqual([
      2026, 5, 19, 15, 0, 0, 0,
    ]);
    expect(denver.offsetForArray([2026, 5, 19, 15, 0, 0, 0])).toBe(-360);
  });

  test("uses the winter offset outside daylight saving time", () => {
    expect(denver.timestampToArray(Date.parse("2026-01-19T22:00:00.000Z"))).toEqual([
      2026, 0, 19, 15, 0, 0, 0,
    ]);
    expect(denver.offsetForArray([2026, 0, 19, 15, 0, 0, 0])).toBe(-420);
  });
});
