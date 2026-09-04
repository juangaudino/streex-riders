import type { PassengerAnalyticsEngagementSource } from "./passenger-analytics";

export const PASSENGER_ANALYTICS_TIME_ZONE = "America/Denver";
export const PASSENGER_ANALYTICS_RANGE_PRESETS = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "this_week",
  "this_month",
  "all",
  "custom",
] as const;

export type PassengerAnalyticsRangePreset = (typeof PASSENGER_ANALYTICS_RANGE_PRESETS)[number];
export type PassengerAnalyticsRangeInput = {
  preset: PassengerAnalyticsRangePreset;
  startDate?: string;
  endDate?: string;
};
export type ResolvedPassengerAnalyticsRange = {
  preset: PassengerAnalyticsRangePreset;
  startDate: string | null;
  endDate: string;
  startAt: string | null;
  endAt: string;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
};
type UsageMapEvent = {
  engagement_id: string | null;
  event_name: string;
  screen: string;
  element: string;
  occurred_at: string;
  metadata: unknown;
};
type UsageMapEngagement = {
  id: string;
  entry_screen: string;
  entry_source: PassengerAnalyticsEngagementSource | string;
  started_at: string;
  last_active_at: string;
  active_duration_ms: number;
  interaction_count: number;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DENVER_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PASSENGER_ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const DENVER_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: PASSENGER_ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function partsFromFormatter(formatter: Intl.DateTimeFormat, value: Date): DateParts {
  const parts = Object.fromEntries(
    formatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function toDateString({ year, month, day }: DateParts) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function datePartsFromString(value: string): DateParts {
  if (!DATE_PATTERN.test(value)) throw new Error("Passenger analytics dates must use YYYY-MM-DD.");
  const [year, month, day] = value.split("-").map(Number);
  const verification = new Date(Date.UTC(year, month - 1, day));
  if (
    verification.getUTCFullYear() !== year ||
    verification.getUTCMonth() !== month - 1 ||
    verification.getUTCDate() !== day
  ) {
    throw new Error("Passenger analytics date is invalid.");
  }
  return { year, month, day };
}

function addDays(date: string, amount: number) {
  const { year, month, day } = datePartsFromString(date);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}

function denverOffsetMs(timestampMs: number) {
  const parts = partsFromFormatter(DENVER_PARTS_FORMATTER, new Date(timestampMs));
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
  );
  return asUtc - timestampMs;
}

export function passengerAnalyticsDenverMidnight(date: string) {
  const { year, month, day } = datePartsFromString(date);
  const utcGuess = Date.UTC(year, month - 1, day);
  const initialOffset = denverOffsetMs(utcGuess);
  let timestamp = utcGuess - initialOffset;
  const correctedOffset = denverOffsetMs(timestamp);
  if (correctedOffset !== initialOffset) timestamp = utcGuess - correctedOffset;
  return new Date(timestamp).toISOString();
}

export function passengerAnalyticsToday(now = new Date()) {
  return toDateString(partsFromFormatter(DENVER_DATE_FORMATTER, now));
}

export function resolvePassengerAnalyticsRange(
  input: PassengerAnalyticsRangeInput,
  now = new Date(),
): ResolvedPassengerAnalyticsRange {
  const today = passengerAnalyticsToday(now);
  const endDate = input.preset === "custom" ? input.endDate : today;
  let startDate: string | undefined;

  switch (input.preset) {
    case "today":
      startDate = today;
      break;
    case "yesterday":
      startDate = addDays(today, -1);
      break;
    case "last_7_days":
      startDate = addDays(today, -6);
      break;
    case "last_30_days":
      startDate = addDays(today, -29);
      break;
    case "last_90_days":
      startDate = addDays(today, -89);
      break;
    case "this_week": {
      const { year, month, day } = datePartsFromString(today);
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      startDate = addDays(today, weekday === 0 ? -6 : 1 - weekday);
      break;
    }
    case "this_month":
      startDate = `${today.slice(0, 8)}01`;
      break;
    case "all":
      startDate = undefined;
      break;
    case "custom":
      startDate = input.startDate;
      break;
  }

  if (!endDate) throw new Error("Choose an end date for the custom Passenger analytics range.");
  datePartsFromString(endDate);
  if (startDate) {
    datePartsFromString(startDate);
    if (startDate > endDate)
      throw new Error("Passenger analytics start date must be on or before its end date.");
  }

  return {
    preset: input.preset,
    startDate: startDate ?? null,
    endDate,
    startAt: startDate ? passengerAnalyticsDenverMidnight(startDate) : null,
    endAt: passengerAnalyticsDenverMidnight(addDays(endDate, 1)),
  };
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function usageActionLabel(event: UsageMapEvent) {
  const metadata =
    event.metadata && typeof event.metadata === "object"
      ? (event.metadata as Record<string, unknown>)
      : {};
  const detail =
    typeof metadata.action === "string"
      ? metadata.action
      : typeof metadata.game === "string"
        ? metadata.game
        : null;
  return detail ? `${event.event_name}:${detail}` : event.event_name;
}

export function buildPassengerUsageMap(events: UsageMapEvent[], engagements: UsageMapEngagement[]) {
  const engagementById = new Map(engagements.map((engagement) => [engagement.id, engagement]));
  const eventsByEngagement = new Map<string, UsageMapEvent[]>();
  for (const event of events) {
    if (!event.engagement_id || !engagementById.has(event.engagement_id)) continue;
    const current = eventsByEngagement.get(event.engagement_id) ?? [];
    current.push(event);
    eventsByEngagement.set(event.engagement_id, current);
  }

  const nodes = new Map<string, number>();
  const flows = new Map<string, number>();
  const actions = new Map<string, number>();
  const journeys = engagements
    .map((engagement) => {
      const journeyEvents = (eventsByEngagement.get(engagement.id) ?? []).sort(
        (left, right) => Date.parse(left.occurred_at) - Date.parse(right.occurred_at),
      );
      const path = [engagement.entry_screen];
      increment(nodes, engagement.entry_screen);
      for (const event of journeyEvents) {
        if (event.event_name === "screen_viewed") {
          if (path[path.length - 1] !== event.screen) path.push(event.screen);
          increment(nodes, event.screen);
        }
        if (
          ![
            "session_started",
            "engagement_started",
            "engagement_ended",
            "screen_viewed",
            "idle_entered",
            "idle_resumed",
            "logical_rest_entered",
            "logical_rest_resumed",
          ].includes(event.event_name)
        ) {
          increment(actions, `${event.screen}|${event.element}|${usageActionLabel(event)}`);
        }
      }
      for (let index = 1; index < path.length; index += 1) {
        increment(flows, `${path[index - 1]}|${path[index]}`);
      }
      return {
        id: engagement.id,
        startedAt: engagement.started_at,
        entrySource: engagement.entry_source,
        path,
        interactionCount: engagement.interaction_count,
        activeDurationMs: engagement.active_duration_ms,
      };
    })
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt))
    .slice(0, 12);

  return {
    nodes: Array.from(nodes, ([screen, count]) => ({ screen, count })).sort(
      (left, right) => right.count - left.count,
    ),
    flows: Array.from(flows, ([key, count]) => {
      const [from, to] = key.split("|");
      return { from, to, count };
    }).sort((left, right) => right.count - left.count),
    actions: Array.from(actions, ([key, count]) => {
      const [screen, element, action] = key.split("|");
      return { screen, element, action, count };
    }).sort((left, right) => right.count - left.count),
    journeys,
  };
}
