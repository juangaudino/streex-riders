import { describe, expect, test } from "bun:test";
import {
  PASSENGER_ANALYTICS_ELEMENTS,
  PASSENGER_ANALYTICS_EVENT_NAMES,
  PASSENGER_ANALYTICS_QUEUE_LIMIT,
  PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS,
  PASSENGER_ANALYTICS_SCREENS,
} from "../src/lib/passenger-analytics.ts";

describe("Passenger internal analytics contract", () => {
  test("uses a bounded offline queue", () => {
    expect(PASSENGER_ANALYTICS_QUEUE_LIMIT).toBe(100);
    expect(PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS).toBe(24 * 60 * 60 * 1_000);
  });

  test("allows semantic Passenger activity without personal or location fields", () => {
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("first_interaction");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("game_completed");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("logical_rest_entered");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).not.toContain("ride_started");
    expect(PASSENGER_ANALYTICS_SCREENS).not.toContain("booking");
    expect(PASSENGER_ANALYTICS_ELEMENTS).not.toContain("gps");
    expect(PASSENGER_ANALYTICS_ELEMENTS).not.toContain("passenger_identity");
  });
});
