import type { AroundYouMatch, AroundYouPlace, PassengerPosition } from "./around-you-types";

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceMeters(
  from: Pick<PassengerPosition, "latitude" | "longitude">,
  to: Pick<AroundYouPlace, "latitude" | "longitude">,
) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function formatAroundYouDistance(distanceMeters: number) {
  if (distanceMeters < 160) return "Nearby";
  const miles = distanceMeters / 1_609.344;
  if (miles < 1) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function calculateAroundYouScore(place: AroundYouPlace, distanceMeters: number) {
  const proximity = Math.max(0, 1 - distanceMeters / place.discoveryRadiusMeters);
  const priority = Math.min(1, Math.max(0, place.priority / 100));
  const triggerBonus = distanceMeters <= place.triggerRadiusMeters ? 0.28 : 0;
  const landmarkBonus = place.contextType === "landmark" ? 0.08 : 0;

  return proximity * 0.58 + priority * 0.34 + triggerBonus + landmarkBonus;
}

export function matchAroundYouPlaces(
  position: PassengerPosition,
  places: AroundYouPlace[],
): AroundYouMatch[] {
  return places
    .filter((place) => place.enabled)
    .map((place) => {
      const distanceMeters = haversineDistanceMeters(position, place);
      return {
        place,
        distanceMeters,
        score: calculateAroundYouScore(place, distanceMeters),
        insideTriggerRadius: distanceMeters <= place.triggerRadiusMeters,
      };
    })
    .filter((match) => match.distanceMeters <= match.place.discoveryRadiusMeters)
    .sort((left, right) => right.score - left.score || left.distanceMeters - right.distanceMeters);
}

export function shouldAcceptPassengerPosition({
  candidate,
  previous,
  maximumUsableAccuracyMeters,
  minimumAcceptedIntervalMs,
  minimumMovementMeters,
  materialAccuracyImprovementMeters,
}: {
  candidate: PassengerPosition;
  previous: PassengerPosition | null;
  maximumUsableAccuracyMeters: number;
  minimumAcceptedIntervalMs: number;
  minimumMovementMeters: number;
  materialAccuracyImprovementMeters: number;
}) {
  if (candidate.accuracyMeters > maximumUsableAccuracyMeters) return false;
  if (!previous) return true;

  const elapsed = candidate.timestamp - previous.timestamp;
  const movement = haversineDistanceMeters(previous, candidate);
  const accuracyImprovement = previous.accuracyMeters - candidate.accuracyMeters;

  return (
    elapsed >= minimumAcceptedIntervalMs ||
    movement >= minimumMovementMeters ||
    accuracyImprovement >= materialAccuracyImprovementMeters
  );
}

export function isImplausiblePassengerJump({
  candidate,
  previous,
  maximumPlausibleSpeedMetersPerSecond,
}: {
  candidate: PassengerPosition;
  previous: PassengerPosition | null;
  maximumPlausibleSpeedMetersPerSecond: number;
}) {
  if (!previous) return false;
  const elapsedSeconds = Math.max(0.001, (candidate.timestamp - previous.timestamp) / 1_000);
  const distanceMeters = haversineDistanceMeters(previous, candidate);
  return distanceMeters / elapsedSeconds > maximumPlausibleSpeedMetersPerSecond;
}

export function isPassengerPositionFresh(
  position: PassengerPosition | null,
  now: number,
  maximumAgeMs: number,
) {
  return position !== null && now - position.timestamp <= maximumAgeMs;
}
