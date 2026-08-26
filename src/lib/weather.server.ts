import {
  normalizeNwsDailyForecast,
  normalizeNwsHourlyForecast,
  type PassengerWeatherSnapshot,
} from "./weather";

const POINT_CACHE_TTL_MS = 24 * 60 * 60 * 1_000;
const FORECAST_CACHE_TTL_MS = 15 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 8_000;
const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "STREEX Passenger Console (rides.getstreex.com; streex.rides@gmail.com)",
};

let pointCache: {
  key: string;
  forecastUrl: string;
  forecastHourlyUrl: string;
  expiresAt: number;
} | null = null;
let forecastCache: { value: PassengerWeatherSnapshot; expiresAt: number } | null = null;

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: NWS_HEADERS, signal: controller.signal });
    if (!response.ok) throw new Error(`Weather service returned ${response.status}.`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getForecastUrls(latitude: number, longitude: number) {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (pointCache?.key === key && pointCache.expiresAt > Date.now()) return pointCache;

  const payload = (await fetchJson(`https://api.weather.gov/points/${key}`)) as {
    properties?: { forecast?: unknown; forecastHourly?: unknown };
  };
  const forecastUrl = payload.properties?.forecast;
  const forecastHourlyUrl = payload.properties?.forecastHourly;
  if (
    typeof forecastUrl !== "string" ||
    typeof forecastHourlyUrl !== "string" ||
    !forecastUrl.startsWith("https://api.weather.gov/") ||
    !forecastHourlyUrl.startsWith("https://api.weather.gov/")
  ) {
    throw new Error("The weather service did not provide usable forecast URLs.");
  }

  pointCache = { key, forecastUrl, forecastHourlyUrl, expiresAt: Date.now() + POINT_CACHE_TTL_MS };
  return pointCache;
}

export async function getPassengerWeatherServer(latitude: number, longitude: number) {
  if (forecastCache && forecastCache.expiresAt > Date.now()) return forecastCache.value;

  try {
    const { forecastUrl, forecastHourlyUrl } = await getForecastUrls(latitude, longitude);
    const [hourlyPayload, dailyPayload] = await Promise.all([
      fetchJson(forecastHourlyUrl),
      fetchJson(forecastUrl),
    ]);
    const hourly = normalizeNwsHourlyForecast(hourlyPayload);
    const daily = normalizeNwsDailyForecast(dailyPayload);
    const value: PassengerWeatherSnapshot = {
      ...hourly,
      dailyPeriods: daily.periods.slice(0, 4),
    };
    forecastCache = { value, expiresAt: Date.now() + FORECAST_CACHE_TTL_MS };
    return value;
  } catch (error) {
    if (forecastCache) return forecastCache.value;
    throw error;
  }
}
