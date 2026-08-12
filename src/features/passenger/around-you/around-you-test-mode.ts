import type { AroundYouPlace, PassengerPosition } from "./around-you-types";

// Reachable only through the unlinked `around-you-test=1` query parameter. This lets the
// owner exercise the production selection engine without driving, and is never persisted.
export const AROUND_YOU_TEST_PRESET_IDS = [
  "downtown-salt-lake-city",
  "salt-lake-city-airport",
  "parleys-canyon",
  "park-city",
  "utah-olympic-park",
  "ogden",
] as const;

export function getAroundYouTestPresets(places: AroundYouPlace[]) {
  return AROUND_YOU_TEST_PRESET_IDS.flatMap((id) => {
    const place = places.find((candidate) => candidate.id === id && candidate.enabled);
    return place ? [place] : [];
  });
}

export function createAroundYouSimulatedPosition(place: AroundYouPlace): PassengerPosition {
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    accuracyMeters: 12,
    timestamp: Date.now(),
  };
}
