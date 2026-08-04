import { useCallback, useEffect, useRef, useState } from "react";
import { getPassengerWeather } from "@/lib/weather.functions";
import type { PassengerWeatherSnapshot } from "@/lib/weather";

export type PassengerWeatherStatus = "loading" | "ready" | "unavailable";

const PASSENGER_WEATHER_CACHE_KEY = "streex-passenger-weather-v1";
const PASSENGER_LAST_ACTIVITY_KEY = "streex-passenger-last-activity-v1";

export function usePassengerIdleReset({
  inactivityMinutes,
  onReset,
  promptSeconds,
}: {
  inactivityMinutes: number;
  onReset: () => void;
  promptSeconds: number;
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(promptSeconds);
  const onResetRef = useRef(onReset);
  const resumeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    const inactivityMs = Math.max(1, inactivityMinutes) * 60_000;
    const promptMs = Math.max(1, promptSeconds) * 1_000;
    let promptVisible = false;
    let lastActivity = Date.now();
    let promptDeadline = 0;
    let phaseTimer: number | undefined;
    let countdownTimer: number | undefined;

    try {
      const storedActivity = Number(localStorage.getItem(PASSENGER_LAST_ACTIVITY_KEY));
      if (Number.isFinite(storedActivity) && storedActivity > 0) lastActivity = storedActivity;
    } catch {
      // Persistence is helpful for Android suspension, but the timer still works without it.
    }

    const persistActivity = () => {
      try {
        localStorage.setItem(PASSENGER_LAST_ACTIVITY_KEY, String(lastActivity));
      } catch {
        // Ignore storage restrictions in private or hardened browser modes.
      }
    };

    const clearTimers = () => {
      if (phaseTimer !== undefined) window.clearTimeout(phaseTimer);
      if (countdownTimer !== undefined) window.clearInterval(countdownTimer);
      phaseTimer = undefined;
      countdownTimer = undefined;
    };

    const beginActivePhase = (remainingMs: number) => {
      clearTimers();
      promptVisible = false;
      setPromptOpen(false);
      phaseTimer = window.setTimeout(evaluateElapsedTime, Math.max(0, remainingMs));
    };

    const resetSession = () => {
      clearTimers();
      promptVisible = false;
      setPromptOpen(false);
      lastActivity = Date.now();
      persistActivity();
      onResetRef.current();
      phaseTimer = window.setTimeout(evaluateElapsedTime, inactivityMs);
    };

    const beginPromptPhase = (remainingMs: number) => {
      clearTimers();
      promptVisible = true;
      promptDeadline = Date.now() + remainingMs;
      setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1_000)));
      setPromptOpen(true);

      countdownTimer = window.setInterval(() => {
        setSecondsRemaining(Math.max(0, Math.ceil((promptDeadline - Date.now()) / 1_000)));
      }, 250);
      phaseTimer = window.setTimeout(resetSession, Math.max(0, remainingMs));
    };

    function evaluateElapsedTime() {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= inactivityMs + promptMs) {
        resetSession();
      } else if (elapsed >= inactivityMs) {
        beginPromptPhase(inactivityMs + promptMs - elapsed);
      } else {
        beginActivePhase(inactivityMs - elapsed);
      }
    }

    const registerActivity = () => {
      if (promptVisible || document.visibilityState === "hidden") return;
      lastActivity = Date.now();
      persistActivity();
      beginActivePhase(inactivityMs);
    };

    const checkAfterWake = () => {
      if (document.visibilityState === "visible") evaluateElapsedTime();
    };

    resumeRef.current = () => {
      lastActivity = Date.now();
      persistActivity();
      beginActivePhase(inactivityMs);
    };

    window.addEventListener("pointerdown", registerActivity, { passive: true });
    window.addEventListener("touchstart", registerActivity, { passive: true });
    window.addEventListener("wheel", registerActivity, { passive: true });
    window.addEventListener("keydown", registerActivity);
    window.addEventListener("scroll", registerActivity, true);
    window.addEventListener("focus", checkAfterWake);
    window.addEventListener("pageshow", checkAfterWake);
    document.addEventListener("visibilitychange", checkAfterWake);
    evaluateElapsedTime();

    return () => {
      clearTimers();
      window.removeEventListener("pointerdown", registerActivity);
      window.removeEventListener("touchstart", registerActivity);
      window.removeEventListener("wheel", registerActivity);
      window.removeEventListener("keydown", registerActivity);
      window.removeEventListener("scroll", registerActivity, true);
      window.removeEventListener("focus", checkAfterWake);
      window.removeEventListener("pageshow", checkAfterWake);
      document.removeEventListener("visibilitychange", checkAfterWake);
      resumeRef.current = () => undefined;
    };
  }, [inactivityMinutes, promptSeconds]);

  const resume = useCallback(() => resumeRef.current(), []);

  return { promptOpen, resume, secondsRemaining };
}

export function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

export function usePassengerWeather(online: boolean, refreshMinutes: number) {
  const [snapshot, setSnapshot] = useState<PassengerWeatherSnapshot | null>(null);
  const [status, setStatus] = useState<PassengerWeatherStatus>("loading");

  const refresh = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus("unavailable");
      return;
    }

    try {
      const response = await getPassengerWeather({ data: {} });
      if (response.state !== "ready") {
        setStatus("unavailable");
        return;
      }
      setSnapshot(response.weather);
      setStatus("ready");
      localStorage.setItem(PASSENGER_WEATHER_CACHE_KEY, JSON.stringify(response.weather));
    } catch {
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(PASSENGER_WEATHER_CACHE_KEY);
      if (cached) setSnapshot(JSON.parse(cached) as PassengerWeatherSnapshot);
    } catch {
      localStorage.removeItem(PASSENGER_WEATHER_CACHE_KEY);
    }

    const interval = window.setInterval(
      () => {
        if (document.visibilityState === "visible") void refresh();
      },
      Math.max(1, refreshMinutes) * 60_000,
    );
    return () => window.clearInterval(interval);
  }, [refresh, refreshMinutes]);

  useEffect(() => {
    if (online) void refresh();
    else setStatus("unavailable");
  }, [online, refresh]);

  return { snapshot, status };
}
