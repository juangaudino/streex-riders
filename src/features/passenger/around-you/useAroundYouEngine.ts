import { useEffect, useRef, useState } from "react";
import type {
  AroundYouEngineState,
  AroundYouPlace,
  AroundYouSelectionOptions,
  PassengerLocationState,
} from "./around-you-types";
import { createAroundYouSelectionState, selectStableAroundYouFeature } from "./around-you-engine";
import { matchAroundYouPlaces } from "./around-you-utils";

export function useAroundYouEngine({
  enabled,
  location,
  options,
  places,
  sessionKey,
}: {
  enabled: boolean;
  location: PassengerLocationState;
  options: AroundYouSelectionOptions;
  places: AroundYouPlace[];
  sessionKey: number;
}): AroundYouEngineState {
  const selectionRef = useRef(createAroundYouSelectionState());
  const sessionKeyRef = useRef(sessionKey);
  const [state, setState] = useState<AroundYouEngineState>({
    status: enabled ? location.status : "idle",
    featured: null,
    nearby: [],
    hasUsablePosition: false,
  });

  useEffect(() => {
    if (sessionKeyRef.current !== sessionKey) {
      sessionKeyRef.current = sessionKey;
      selectionRef.current = createAroundYouSelectionState();
    }

    if (!enabled || !location.position) {
      setState((current) => {
        const next: AroundYouEngineState = {
          status: enabled ? location.status : "idle",
          featured: null,
          nearby: [],
          hasUsablePosition: false,
        };
        return JSON.stringify(current) === JSON.stringify(next) ? current : next;
      });
      return;
    }

    const matches = matchAroundYouPlaces(location.position, places);
    selectionRef.current = selectStableAroundYouFeature({
      matches,
      now: location.position.timestamp,
      options,
      previous: selectionRef.current,
    });
    const featured =
      matches.find(({ place }) => place.id === selectionRef.current.currentPlaceId) ?? null;
    const nearby = matches
      .filter(({ place }) => place.id !== featured?.place.id)
      .slice(0, options.nearbyLimit);

    setState((current) => {
      const next: AroundYouEngineState = {
        status: location.status,
        featured,
        nearby,
        hasUsablePosition: true,
      };
      const unchanged =
        current.status === next.status &&
        current.featured?.place.id === next.featured?.place.id &&
        current.featured?.distanceMeters === next.featured?.distanceMeters &&
        current.nearby.length === next.nearby.length &&
        current.nearby.every(
          (match, index) =>
            match.place.id === next.nearby[index]?.place.id &&
            match.distanceMeters === next.nearby[index]?.distanceMeters,
        );
      return unchanged ? current : next;
    });
  }, [enabled, location.position, location.status, options, places, sessionKey]);

  return state;
}
