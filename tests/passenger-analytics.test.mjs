import { describe, expect, test } from "bun:test";
import {
  PASSENGER_ANALYTICS_ELEMENTS,
  PASSENGER_ANALYTICS_EVENT_NAMES,
  PASSENGER_ANALYTICS_QUEUE_LIMIT,
  PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS,
  PASSENGER_ANALYTICS_SCREENS,
} from "../src/lib/passenger-analytics.ts";
import {
  buildPassengerUsageMap,
  resolvePassengerAnalyticsRange,
} from "../src/lib/passenger-analytics-report.ts";

describe("Passenger internal analytics contract", () => {
  test("uses a bounded offline queue", () => {
    expect(PASSENGER_ANALYTICS_QUEUE_LIMIT).toBe(100);
    expect(PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS).toBe(24 * 60 * 60 * 1_000);
  });

  test("allows semantic Passenger activity without personal or location fields", () => {
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("first_interaction");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("engagement_started");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("engagement_ended");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("game_completed");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).toContain("logical_rest_entered");
    expect(PASSENGER_ANALYTICS_EVENT_NAMES).not.toContain("ride_started");
    expect(PASSENGER_ANALYTICS_SCREENS).not.toContain("booking");
    expect(PASSENGER_ANALYTICS_ELEMENTS).not.toContain("gps");
    expect(PASSENGER_ANALYTICS_ELEMENTS).not.toContain("passenger_identity");
  });

  test("resolves calendar ranges in Salt Lake City time across daylight saving changes", () => {
    const range = resolvePassengerAnalyticsRange(
      { preset: "custom", startDate: "2026-03-08", endDate: "2026-03-08" },
      new Date("2026-03-08T18:00:00.000Z"),
    );

    expect(range.startAt).toBe("2026-03-08T07:00:00.000Z");
    expect(range.endAt).toBe("2026-03-09T06:00:00.000Z");
  });

  test("builds a semantic usage map without touch coordinates or passenger data", () => {
    const engagement = {
      id: "00000000-0000-4000-8000-000000000001",
      entry_screen: "home",
      entry_source: "idle_resume",
      started_at: "2026-09-03T18:00:00.000Z",
      last_active_at: "2026-09-03T18:01:00.000Z",
      active_duration_ms: 60_000,
      interaction_count: 2,
    };
    const map = buildPassengerUsageMap(
      [
        {
          engagement_id: engagement.id,
          event_name: "screen_viewed",
          screen: "music",
          element: "navigation",
          occurred_at: "2026-09-03T18:00:02.000Z",
          metadata: {},
        },
        {
          engagement_id: engagement.id,
          event_name: "music_action",
          screen: "music",
          element: "music_playback",
          occurred_at: "2026-09-03T18:00:05.000Z",
          metadata: { action: "next" },
        },
      ],
      [engagement],
    );

    expect(map.flows).toContainEqual({ from: "home", to: "music", count: 1 });
    expect(map.actions).toContainEqual({
      screen: "music",
      element: "music_playback",
      action: "music_action:next",
      count: 1,
    });
    expect(JSON.stringify(map)).not.toContain("coordinate");
  });
});
