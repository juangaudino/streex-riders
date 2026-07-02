import { describe, expect, test } from "bun:test";
import {
  bookingConflictMessage,
  isScheduleConflictError,
  manualBlockConflictMessage,
  timeRangesEqual,
  timeRangesOverlap,
} from "../src/lib/schedule-conflicts.ts";

describe("schedule conflict errors", () => {
  test("recognizes the booking trigger error", () => {
    const error = { code: "23P01", message: "BOOKING_SCHEDULE_CONFLICT" };

    expect(isScheduleConflictError(error)).toBe(true);
    expect(bookingConflictMessage(error)).toContain("conflicts");
  });

  test("recognizes a manual-block conflict", () => {
    const error = { message: "MANUAL_BLOCK_BOOKING_CONFLICT" };

    expect(isScheduleConflictError(error)).toBe(true);
    expect(manualBlockConflictMessage(error)).toContain("overlaps");
  });

  test("does not hide unrelated database errors", () => {
    const error = { code: "42501", message: "permission denied" };

    expect(isScheduleConflictError(error)).toBe(false);
    expect(bookingConflictMessage(error)).toBeNull();
  });
});

describe("schedule interval overlap", () => {
  test("blocks every partially overlapping Google interval", () => {
    expect(
      timeRangesOverlap(
        "2026-07-02T21:00:00.000Z",
        "2026-07-02T22:00:00.000Z",
        "2026-07-02T21:30:00.000Z",
        "2026-07-02T22:30:00.000Z",
      ),
    ).toBe(true);
  });

  test("keeps adjacent intervals available", () => {
    expect(
      timeRangesOverlap(
        "2026-07-02T21:00:00.000Z",
        "2026-07-02T22:00:00.000Z",
        "2026-07-02T22:00:00.000Z",
        "2026-07-02T23:00:00.000Z",
      ),
    ).toBe(false);
  });

  test("recognizes the same interval across equivalent ISO formats", () => {
    expect(
      timeRangesEqual(
        "2026-07-03T23:00:00+00:00",
        "2026-07-04T00:00:00+00:00",
        "2026-07-03T23:00:00.000Z",
        "2026-07-04T00:00:00.000Z",
      ),
    ).toBe(true);
  });
});
