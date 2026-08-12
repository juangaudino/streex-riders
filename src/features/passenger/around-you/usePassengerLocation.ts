import { useCallback, useEffect, useRef, useState } from "react";
import type { PassengerLocationState, PassengerPosition } from "./around-you-types";
import {
  isImplausiblePassengerJump,
  isPassengerPositionFresh,
  shouldAcceptPassengerPosition,
} from "./around-you-utils";

export type PassengerGeolocationOptions = {
  enableHighAccuracy: boolean;
  timeoutMs: number;
  maximumAgeMs: number;
  minimumAcceptedIntervalMs: number;
  minimumMovementMeters: number;
  maximumUsableAccuracyMeters: number;
  maximumLastGoodPositionAgeMs: number;
  materialAccuracyImprovementMeters: number;
  maximumPlausibleSpeedMetersPerSecond: number;
};

const INITIAL_STATE: PassengerLocationState = {
  status: "idle",
  position: null,
  lastGoodPositionAgeMs: null,
};

function toPassengerPosition(position: GeolocationPosition): PassengerPosition {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    timestamp: position.timestamp || Date.now(),
  };
}

export function usePassengerLocation({
  enabled,
  options,
}: {
  enabled: boolean;
  options: PassengerGeolocationOptions;
}): PassengerLocationState {
  const [state, setState] = useState<PassengerLocationState>(INITIAL_STATE);
  const watchIdRef = useRef<number | null>(null);
  const lastAcceptedRef = useRef<PassengerPosition | null>(null);
  const lastGoodRef = useRef<PassengerPosition | null>(null);

  const clearWatcher = useCallback(() => {
    if (watchIdRef.current === null || typeof navigator === "undefined") return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearWatcher();
      setState(INITIAL_STATE);
      lastAcceptedRef.current = null;
      lastGoodRef.current = null;
      return;
    }
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    if (!("geolocation" in navigator)) {
      setState({ status: "unsupported", position: null, lastGoodPositionAgeMs: null });
      return;
    }

    let disposed = false;

    const publishLastGood = (status: PassengerLocationState["status"]) => {
      const lastGood = lastGoodRef.current;
      const age = lastGood ? Date.now() - lastGood.timestamp : null;
      const usable = isPassengerPositionFresh(
        lastGood,
        Date.now(),
        options.maximumLastGoodPositionAgeMs,
      );
      setState({ status, position: usable ? lastGood : null, lastGoodPositionAgeMs: age });
    };

    const handlePosition = (browserPosition: GeolocationPosition) => {
      if (disposed) return;
      const candidate = toPassengerPosition(browserPosition);
      const previous = lastAcceptedRef.current;

      if (candidate.accuracyMeters > options.maximumUsableAccuracyMeters) {
        publishLastGood("degraded");
        return;
      }
      if (
        isImplausiblePassengerJump({
          candidate,
          previous: lastGoodRef.current,
          maximumPlausibleSpeedMetersPerSecond: options.maximumPlausibleSpeedMetersPerSecond,
        })
      ) {
        publishLastGood("degraded");
        return;
      }
      if (
        !shouldAcceptPassengerPosition({
          candidate,
          previous,
          maximumUsableAccuracyMeters: options.maximumUsableAccuracyMeters,
          minimumAcceptedIntervalMs: options.minimumAcceptedIntervalMs,
          minimumMovementMeters: options.minimumMovementMeters,
          materialAccuracyImprovementMeters: options.materialAccuracyImprovementMeters,
        })
      ) {
        return;
      }

      lastAcceptedRef.current = candidate;
      lastGoodRef.current = candidate;
      setState({ status: "ready", position: candidate, lastGoodPositionAgeMs: 0 });
    };

    const handleError = (error: GeolocationPositionError) => {
      if (disposed) return;
      if (error.code === error.PERMISSION_DENIED) {
        publishLastGood("denied");
      } else {
        publishLastGood("unavailable");
      }
    };

    const startWatcher = () => {
      if (watchIdRef.current !== null || document.visibilityState === "hidden") return;
      if (!lastGoodRef.current) {
        setState({ status: "requesting", position: null, lastGoodPositionAgeMs: null });
      }
      watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeoutMs,
        maximumAge: options.maximumAgeMs,
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearWatcher();
      } else {
        startWatcher();
      }
    };

    startWatcher();
    document.addEventListener("visibilitychange", handleVisibility);
    const freshnessTimer = window.setInterval(
      () => {
        const lastGood = lastGoodRef.current;
        if (!lastGood) return;
        const age = Date.now() - lastGood.timestamp;
        if (age > options.maximumLastGoodPositionAgeMs) {
          setState({ status: "stale", position: null, lastGoodPositionAgeMs: age });
        }
      },
      Math.max(2_000, Math.min(10_000, options.maximumLastGoodPositionAgeMs / 2)),
    );

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(freshnessTimer);
      clearWatcher();
    };
  }, [
    clearWatcher,
    enabled,
    options.enableHighAccuracy,
    options.materialAccuracyImprovementMeters,
    options.maximumAgeMs,
    options.maximumLastGoodPositionAgeMs,
    options.maximumPlausibleSpeedMetersPerSecond,
    options.maximumUsableAccuracyMeters,
    options.minimumAcceptedIntervalMs,
    options.minimumMovementMeters,
    options.timeoutMs,
  ]);

  return state;
}
