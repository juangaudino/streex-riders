import type {
  AroundYouMatch,
  AroundYouSelectionOptions,
  AroundYouSelectionState,
} from "./around-you-types";

export function createAroundYouSelectionState(): AroundYouSelectionState {
  return { currentPlaceId: null, selectedAt: null, recentlyShown: [] };
}

function withoutExpiredCooldowns(state: AroundYouSelectionState, now: number, cooldownMs: number) {
  return state.recentlyShown.filter(({ shownAt }) => now - shownAt < cooldownMs);
}

function chooseCandidate(
  candidates: AroundYouMatch[],
  recentlyShownIds: Set<string>,
): AroundYouMatch | null {
  const freshCandidate = candidates.find(({ place }) => !recentlyShownIds.has(place.id));
  return freshCandidate ?? candidates[0] ?? null;
}

export function selectStableAroundYouFeature({
  matches,
  now,
  options,
  previous,
}: {
  matches: AroundYouMatch[];
  now: number;
  options: AroundYouSelectionOptions;
  previous: AroundYouSelectionState;
}): AroundYouSelectionState {
  const recentlyShown = withoutExpiredCooldowns(previous, now, options.recentlyShownCooldownMs);
  const recentIds = new Set(recentlyShown.map(({ placeId }) => placeId));
  const current = matches.find(({ place }) => place.id === previous.currentPlaceId) ?? null;
  const currentRetained =
    current &&
    current.distanceMeters <= current.place.triggerRadiusMeters * options.exitRadiusMultiplier;
  const challengers = matches.filter(
    ({ insideTriggerRadius, place }) => insideTriggerRadius && place.id !== previous.currentPlaceId,
  );

  let next = currentRetained ? current : chooseCandidate(challengers, recentIds);
  const dwellComplete =
    previous.selectedAt === null || now - previous.selectedAt >= options.minimumFeaturedDwellMs;

  if (currentRetained && dwellComplete) {
    const challenger = chooseCandidate(challengers, recentIds);
    if (challenger && challenger.score >= current.score * options.challengerScoreRatio) {
      next = challenger;
    }
  }

  if (next?.place.id === previous.currentPlaceId) {
    return { ...previous, recentlyShown };
  }

  const outgoing = previous.currentPlaceId
    ? [{ placeId: previous.currentPlaceId, shownAt: now }, ...recentlyShown]
    : recentlyShown;

  return {
    currentPlaceId: next?.place.id ?? null,
    selectedAt: next ? now : null,
    recentlyShown: outgoing.filter(
      (entry, index, entries) =>
        entries.findIndex(({ placeId }) => placeId === entry.placeId) === index,
    ),
  };
}
