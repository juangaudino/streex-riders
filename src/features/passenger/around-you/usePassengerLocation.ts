import { useEffect, useRef, useState } from "react";
import type { PassengerLocationState, PassengerPosition } from "./around-you-types";
import {
  isImplausiblePassengerJump,
  isPassengerPositionFresh,
  shouldAcceptPassengerPosition,
} from "./around-you-utils";

export type PassengerGeolocationOptions = {
  samplingIntervalMs: number;
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
  const lastAcceptedRef = useRef<PassengerPosition | null>(null);
  const lastGoodRef = useRef<PassengerPosition | null>(null);
  const lastRequestedAtRef = useRef<number | null>(null);
  const requestPendingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setState(INITIAL_STATE);
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
      requestPendingRef.current = false;
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
      requestPendingRef.current = false;
      if (disposed) return;
      if (error.code === error.PERMISSION_DENIED) {
        publishLastGood("denied");
      } else {
        publishLastGood("unavailable");
      }
    };

    const samplingIntervalMs = Math.max(60_000, options.samplingIntervalMs);
    let samplingTimer: number | null = null;

    const clearSamplingTimer = () => {
      if (samplingTimer === null) return;
      window.clearTimeout(samplingTimer);
      samplingTimer = null;
    };

    const requestPosition = () => {
      if (disposed || document.visibilityState === "hidden" || requestPendingRef.current) return;
      const now = Date.now();
      const lastRequestedAt = lastRequestedAtRef.current;
      if (lastRequestedAt !== null && now - lastRequestedAt < samplingIntervalMs) {
        const usable = isPassengerPositionFresh(
          lastGoodRef.current,
          now,
          options.maximumLastGoodPositionAgeMs,
        );
        publishLastGood(lastGoodRef.current ? (usable ? "ready" : "stale") : "idle");
        return;
      }
      if (!lastGoodRef.current) {
        setState({ status: "requesting", position: null, lastGoodPositionAgeMs: null });
      } else {
        publishLastGood("ready");
      }
      lastRequestedAtRef.current = now;
      requestPendingRef.current = true;
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeoutMs,
        maximumAge: options.maximumAgeMs,
      });
    };

    const scheduleNextSample = () => {
      clearSamplingTimer();
      if (disposed || document.visibilityState === "hidden") return;
      const lastRequestedAt = lastRequestedAtRef.current;
      const elapsed = lastRequestedAt === null ? samplingIntervalMs : Date.now() - lastRequestedAt;
      const delay = requestPendingRef.current
        ? Math.min(15_000, samplingIntervalMs)
        : Math.max(0, samplingIntervalMs - elapsed);
      samplingTimer = window.setTimeout(() => {
        requestPosition();
        scheduleNextSample();
      }, delay);
    };

    const startSampling = () => {
      if (document.visibilityState === "hidden") return;
      publishLastGood(lastGoodRef.current ? "ready" : "idle");
      requestPosition();
      scheduleNextSample();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearSamplingTimer();
      } else {
        startSampling();
      }
    };

    startSampling();
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
      Math.max(10_000, Math.min(60_000, options.maximumLastGoodPositionAgeMs / 2)),
    );

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(freshnessTimer);
      clearSamplingTimer();
      requestPendingRef.current = false;
    };
  }, [
    enabled,
    options.enableHighAccuracy,
    options.materialAccuracyImprovementMeters,
    options.maximumAgeMs,
    options.maximumLastGoodPositionAgeMs,
    options.maximumPlausibleSpeedMetersPerSecond,
    options.maximumUsableAccuracyMeters,
    options.minimumAcceptedIntervalMs,
    options.minimumMovementMeters,
    options.samplingIntervalMs,
    options.timeoutMs,
  ]);

  return state;
}
