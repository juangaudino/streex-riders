import { useCallback, useEffect, useState } from "react";
import { getPassengerWeather } from "@/lib/weather.functions";
import type { PassengerWeatherSnapshot } from "@/lib/weather";

export type PassengerWeatherStatus = "loading" | "ready" | "unavailable";

const PASSENGER_WEATHER_CACHE_KEY = "streex-passenger-weather-v1";

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
