import { describe, expect, test } from "bun:test";
import {
  bookingConflictMessage,
  isScheduleConflictError,
  manualBlockConflictMessage,
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
