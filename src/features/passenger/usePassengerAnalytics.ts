import { useCallback, useEffect, useRef } from "react";
import { ingestPassengerAnalytics } from "@/lib/passenger-analytics.functions";
import {
  PASSENGER_ANALYTICS_QUEUE_LIMIT,
  PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS,
  type PassengerAnalyticsElement,
  type PassengerAnalyticsEvent,
  type PassengerAnalyticsEventName,
  type PassengerAnalyticsMetadata,
  type PassengerAnalyticsScreen,
  type PassengerAnalyticsSession,
} from "@/lib/passenger-analytics";

const DEVICE_KEY = "streex-passenger-analytics-device-v1";
const QUEUE_KEY = "streex-passenger-analytics-queue-v1";
const SESSION_SYNC_MS = 30_000;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as PassengerAnalyticsEvent[];
    const cutoff = Date.now() - PASSENGER_ANALYTICS_QUEUE_MAX_AGE_MS;
    return Array.isArray(stored)
      ? stored.filter((event) => Date.parse(event.occurredAt) >= cutoff).slice(-PASSENGER_ANALYTICS_QUEUE_LIMIT)
      : [];
  } catch {
    return [];
  }
}

function persistQueue(queue: PassengerAnalyticsEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-PASSENGER_ANALYTICS_QUEUE_LIMIT)));
  } catch {
    // Analytics are optional and must not break the in-vehicle console.
  }
}

function getDeviceInstallationId() {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(existing)) return existing;
    const created = createId();
    localStorage.setItem(DEVICE_KEY, created);
    return created;
  } catch {
    return createId();
  }
}

type TrackInput = {
  name: PassengerAnalyticsEventName;
  screen?: PassengerAnalyticsScreen;
  element: PassengerAnalyticsElement;
  durationMs?: number;
  metadata?: PassengerAnalyticsMetadata;
  interaction?: boolean;
};

export function usePassengerAnalytics(screen: PassengerAnalyticsScreen) {
  const screenRef = useRef(screen);
  const sessionRef = useRef<PassengerAnalyticsSession | null>(null);
  const queueRef = useRef<PassengerAnalyticsEvent[]>([]);
  const flushingRef = useRef(false);
  const activeSinceRef = useRef<number | null>(null);
  const firstInteractionRef = useRef(false);

  const refreshActiveDuration = useCallback(() => {
    const session = sessionRef.current;
    const activeSince = activeSinceRef.current;
    if (!session || activeSince === null) return;
    const now = Date.now();
    session.activeDurationMs = Math.min(86_400_000, session.activeDurationMs + (now - activeSince));
    session.lastActiveAt = new Date(now).toISOString();
    activeSinceRef.current = now;
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current || !sessionRef.current || !navigator.onLine) return;
    flushingRef.current = true;
    refreshActiveDuration();
    const batch = queueRef.current.slice(0, 25);
    try {
      await ingestPassengerAnalytics({ data: { session: sessionRef.current, events: batch } });
      if (batch.length) {
        const delivered = new Set(batch.map((event) => event.id));
        queueRef.current = queueRef.current.filter((event) => !delivered.has(event.id));
        persistQueue(queueRef.current);
      }
    } catch {
      // Keep the bounded queue for a later online retry. Passenger UI stays unaffected.
    } finally {
      flushingRef.current = false;
      if (queueRef.current.length && navigator.onLine) void flush();
    }
  }, [refreshActiveDuration]);

  const track = useCallback(
    ({ name, screen: eventScreen, element, durationMs, metadata, interaction = false }: TrackInput) => {
      const session = sessionRef.current;
      if (!session) return;
      refreshActiveDuration();
      if (interaction) session.interactionCount += 1;
      queueRef.current = [
        ...queueRef.current,
        {
          id: createId(),
          name,
          screen: eventScreen ?? screenRef.current,
          element,
          occurredAt: new Date().toISOString(),
          ...(durationMs === undefined ? {} : { durationMs }),
          ...(metadata ? { metadata } : {}),
        },
      ].slice(-PASSENGER_ANALYTICS_QUEUE_LIMIT);
      persistQueue(queueRef.current);
      void flush();
    },
    [flush, refreshActiveDuration],
  );

  useEffect(() => {
    screenRef.current = screen;
    if (sessionRef.current) {
      track({ name: "screen_viewed", element: "navigation" });
    }
  }, [screen, track]);

  useEffect(() => {
    const now = new Date().toISOString();
    sessionRef.current = {
      id: createId(),
      deviceInstallationId: getDeviceInstallationId(),
      startedAt: now,
      lastActiveAt: now,
      activeDurationMs: 0,
      interactionCount: 0,
    };
    queueRef.current = readQueue();
    activeSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;
    track({ name: "session_started", element: "console", screen: screenRef.current });
    track({ name: "screen_viewed", element: "console", screen: screenRef.current });

    const markFirstInteraction = () => {
      if (firstInteractionRef.current) return;
      firstInteractionRef.current = true;
      track({ name: "first_interaction", element: "console", interaction: true });
    };
    const syncVisibility = () => {
      if (document.visibilityState === "hidden") {
        refreshActiveDuration();
        activeSinceRef.current = null;
        void flush();
      } else if (activeSinceRef.current === null) {
        activeSinceRef.current = Date.now();
        void flush();
      }
    };
    const syncOnline = () => void flush();
    const interval = window.setInterval(() => void flush(), SESSION_SYNC_MS);

    window.addEventListener("pointerdown", markFirstInteraction, { passive: true, once: true });
    window.addEventListener("online", syncOnline);
    window.addEventListener("pagehide", syncOnline);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      refreshActiveDuration();
      void flush();
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", markFirstInteraction);
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("pagehide", syncOnline);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [flush, refreshActiveDuration, track]);

  return { track };
}
