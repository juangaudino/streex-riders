import { THIS_OR_THAT_VISUALS, type ThisOrThatVisual } from "./this-or-that-visuals";

type HigherOrLowerVisualPair = {
  left: ThisOrThatVisual;
  right: ThisOrThatVisual;
};

const visualPair = (
  left: keyof typeof THIS_OR_THAT_VISUALS,
  right: keyof typeof THIS_OR_THAT_VISUALS,
): HigherOrLowerVisualPair => ({
  left: THIS_OR_THAT_VISUALS[left],
  right: THIS_OR_THAT_VISUALS[right],
});

// These are local Passenger assets, deliberately reused as editorial scenes rather
// than pretending they are literal photographs of each comparison subject.
export const UTAH_HIGHER_OR_LOWER_VISUALS: Record<string, HigherOrLowerVisualPair> = {
  "highest-peak": visualPair("alpineSnow", "alpineLake"),
  "park-city-slc-elevation": visualPair("cityBoulevard", "mountainTown"),
  "alta-snowbird-base": visualPair("alpineSpa", "alpineSnow"),
  "bryce-zion-elevation": visualPair("canyonTrail", "desertSunrise"),
  "canyonlands-arches-area": visualPair("desertSunrise", "canyonTrail"),
  "arches-count": visualPair("canyonTrail", "desertCampfire"),
  "great-salt-lake-bear-lake": visualPair("alpineLake", "passengerWindow"),
  "ogden-provo-north": visualPair("cityViolet", "cityBoulevard"),
  "moab-st-george-south": visualPair("canyonTrail", "desertSunrise"),
  "sego-lily-aspen-year": visualPair("wildflowerTrail", "alpineLake"),
  "statehood-railroad-year": visualPair("roadsideDiner", "cityBoulevard"),
  "utah-state-number": visualPair("cityViolet", "cityBoulevard"),
  "state-flower-fossil-year": visualPair("wildflowerTrail", "canyonTrail"),
  "salt-lake-city-ogden-population": visualPair("mountainTown", "cityBoulevard"),
  "state-bird-insect-size": visualPair("wildflowerTrail", "passengerWindow"),
  "state-gem-size": visualPair("desertCampfire", "alpineLake"),
  "state-motto": visualPair("localFestival", "cityBoulevard"),
  "utah-federal-lands": visualPair("cityBoulevard", "canyonTrail"),
  "zion-bryce-south": visualPair("desertSunrise", "canyonTrail"),
  "park-city-snowbird-distance": visualPair("alpineSnow", "mountainTown"),
};

const preloadedSources = new Set<string>();

export function preloadHigherOrLowerVisuals(questionIds: readonly string[]) {
  if (typeof window === "undefined") return;

  for (const id of questionIds) {
    const pair = UTAH_HIGHER_OR_LOWER_VISUALS[id];
    if (!pair) continue;

    for (const visual of [pair.left, pair.right]) {
      if (preloadedSources.has(visual.src)) continue;
      preloadedSources.add(visual.src);
      const image = new Image();
      image.decoding = "async";
      image.src = visual.src;
      void image.decode?.().catch(() => undefined);
    }
  }
}
