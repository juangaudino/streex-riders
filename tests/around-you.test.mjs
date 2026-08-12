import { describe, expect, test } from "bun:test";
import {
  createAroundYouSelectionState,
  selectStableAroundYouFeature,
} from "../src/features/passenger/around-you/around-you-engine.ts";
import {
  haversineDistanceMeters,
  isImplausiblePassengerJump,
  isPassengerPositionFresh,
  matchAroundYouPlaces,
  shouldAcceptPassengerPosition,
} from "../src/features/passenger/around-you/around-you-utils.ts";

const selectionOptions = {
  nearbyLimit: 5,
  minimumFeaturedDwellMs: 30_000,
  exitRadiusMultiplier: 1.25,
  challengerScoreRatio: 1.15,
  recentlyShownCooldownMs: 600_000,
};

function place(id, overrides = {}) {
  return {
    id,
    enabled: true,
    latitude: 40.7608,
    longitude: -111.891,
    category: "history",
    contextType: "landmark",
    priority: 70,
    triggerRadiusMeters: 2_000,
    discoveryRadiusMeters: 5_000,
    title: { en: id, es: id },
    description: { en: id, es: id },
    sourceUrl: "https://example.com",
    ...overrides,
  };
}

function match(testPlace, score, distanceMeters = 100, insideTriggerRadius = true) {
  return { place: testPlace, score, distanceMeters, insideTriggerRadius };
}

describe("Around You geographic foundations", () => {
  test("calculates Haversine distance within a known Salt Lake baseline", () => {
    const distance = haversineDistanceMeters(
      { latitude: 40.7608, longitude: -111.891 },
      { latitude: 40.7774, longitude: -111.8882 },
    );

    expect(distance).toBeGreaterThan(1_800);
    expect(distance).toBeLessThan(1_900);
  });

  test("filters discovery eligibility and ranks a nearby landmark over a broad region", () => {
    const position = {
      latitude: 40.7608,
      longitude: -111.891,
      accuracyMeters: 20,
      timestamp: 1_000,
    };
    const matches = matchAroundYouPlaces(position, [
      place("region", {
        contextType: "region",
        priority: 50,
        triggerRadiusMeters: 5_000,
        discoveryRadiusMeters: 8_000,
      }),
      place("landmark", { latitude: 40.761, longitude: -111.891, priority: 90 }),
      place("outside", { latitude: 41.5, longitude: -111.891 }),
    ]);

    expect(matches.map(({ place: item }) => item.id)).toEqual(["landmark", "region"]);
    expect(matches.every(({ insideTriggerRadius }) => insideTriggerRadius)).toBe(true);
  });
});

describe("Around You GPS acceptance", () => {
  const previous = {
    latitude: 40.7608,
    longitude: -111.891,
    accuracyMeters: 70,
    timestamp: 1_000,
  };
  const rules = {
    maximumUsableAccuracyMeters: 180,
    minimumAcceptedIntervalMs: 8_000,
    minimumMovementMeters: 60,
    materialAccuracyImprovementMeters: 35,
  };

  test("rejects inaccurate callbacks", () => {
    expect(
      shouldAcceptPassengerPosition({
        candidate: { ...previous, accuracyMeters: 250, timestamp: 10_000 },
        previous,
        ...rules,
      }),
    ).toBe(false);
  });

  test("throttles noise but accepts elapsed time, movement, or materially better accuracy", () => {
    expect(
      shouldAcceptPassengerPosition({
        candidate: { ...previous, longitude: -111.89101, timestamp: 2_000 },
        previous,
        ...rules,
      }),
    ).toBe(false);
    expect(
      shouldAcceptPassengerPosition({
        candidate: { ...previous, timestamp: 10_000 },
        previous,
        ...rules,
      }),
    ).toBe(true);
    expect(
      shouldAcceptPassengerPosition({
        candidate: { ...previous, longitude: -111.8901, timestamp: 2_000 },
        previous,
        ...rules,
      }),
    ).toBe(true);
    expect(
      shouldAcceptPassengerPosition({
        candidate: { ...previous, accuracyMeters: 25, timestamp: 2_000 },
        previous,
        ...rules,
      }),
    ).toBe(true);
  });

  test("rejects an implausible vehicle jump", () => {
    expect(
      isImplausiblePassengerJump({
        previous,
        candidate: { ...previous, latitude: 40.9, timestamp: 2_000 },
        maximumPlausibleSpeedMetersPerSecond: 85,
      }),
    ).toBe(true);
  });

  test("expires the last reliable position instead of keeping stale coordinates active", () => {
    expect(isPassengerPositionFresh(previous, 60_999, 60_000)).toBe(true);
    expect(isPassengerPositionFresh(previous, 61_001, 60_000)).toBe(false);
    expect(isPassengerPositionFresh(null, 61_001, 60_000)).toBe(false);
  });
});

describe("Around You stable selection", () => {
  const alpha = place("alpha");
  const beta = place("beta");
  const gamma = place("gamma");

  test("selects the first eligible place immediately", () => {
    const state = selectStableAroundYouFeature({
      matches: [match(alpha, 0.8)],
      now: 1_000,
      options: selectionOptions,
      previous: createAroundYouSelectionState(),
    });
    expect(state.currentPlaceId).toBe("alpha");
    expect(state.selectedAt).toBe(1_000);
  });

  test("holds during dwell and requires a materially better challenger afterwards", () => {
    const selected = { currentPlaceId: "alpha", selectedAt: 1_000, recentlyShown: [] };
    const duringDwell = selectStableAroundYouFeature({
      matches: [match(beta, 0.99), match(alpha, 0.7)],
      now: 20_000,
      options: selectionOptions,
      previous: selected,
    });
    expect(duringDwell.currentPlaceId).toBe("alpha");

    const weakChallenge = selectStableAroundYouFeature({
      matches: [match(beta, 0.78), match(alpha, 0.7)],
      now: 40_000,
      options: selectionOptions,
      previous: selected,
    });
    expect(weakChallenge.currentPlaceId).toBe("alpha");

    const strongChallenge = selectStableAroundYouFeature({
      matches: [match(beta, 0.82), match(alpha, 0.7)],
      now: 40_000,
      options: selectionOptions,
      previous: selected,
    });
    expect(strongChallenge.currentPlaceId).toBe("beta");
    expect(strongChallenge.recentlyShown[0].placeId).toBe("alpha");
  });

  test("retains the current place inside its exit radius", () => {
    const state = selectStableAroundYouFeature({
      matches: [match(alpha, 0.4, 2_400, false)],
      now: 40_000,
      options: selectionOptions,
      previous: { currentPlaceId: "alpha", selectedAt: 1_000, recentlyShown: [] },
    });
    expect(state.currentPlaceId).toBe("alpha");
  });

  test("treats cooldown as soft and prefers a fresh alternative", () => {
    const state = selectStableAroundYouFeature({
      matches: [match(alpha, 0.9), match(gamma, 0.7)],
      now: 100_000,
      options: selectionOptions,
      previous: {
        currentPlaceId: null,
        selectedAt: null,
        recentlyShown: [{ placeId: "alpha", shownAt: 90_000 }],
      },
    });
    expect(state.currentPlaceId).toBe("gamma");
  });

  test("a passenger session reset clears transient selection and cooldown", () => {
    const reset = createAroundYouSelectionState();
    expect(reset).toEqual({ currentPlaceId: null, selectedAt: null, recentlyShown: [] });
  });
});
