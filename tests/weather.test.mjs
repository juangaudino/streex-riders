import { describe, expect, test } from "bun:test";
import { normalizeNwsDailyForecast, normalizeNwsHourlyForecast } from "../src/lib/weather.ts";

describe("NWS hourly weather normalization", () => {
  test("returns only the fields used by Passenger Console", () => {
    const result = normalizeNwsHourlyForecast({
      properties: {
        updateTime: "2026-08-04T12:00:00Z",
        generatedAt: "2026-08-04T16:35:07Z",
        periods: [
          {
            startTime: "2026-08-04T08:00:00-06:00",
            temperature: 72,
            temperatureUnit: "F",
            shortForecast: "Partly Cloudy",
            windSpeed: "6 mph",
            windDirection: "S",
            probabilityOfPrecipitation: { value: 20 },
            detailedForecast: "This field must not reach the browser.",
          },
        ],
      },
    });

    expect(result).toEqual({
      updatedAt: "2026-08-04T16:35:07Z",
      periods: [
        {
          startTime: "2026-08-04T08:00:00-06:00",
          temperatureFahrenheit: 72,
          condition: "partly-cloudy",
          shortForecast: "Partly Cloudy",
          windSpeed: "6 mph",
          windDirection: "S",
          precipitationChance: 20,
        },
      ],
    });
  });

  test("converts Celsius and rejects malformed responses", () => {
    const result = normalizeNwsHourlyForecast({
      properties: {
        periods: [
          {
            startTime: "2026-08-04T08:00:00-06:00",
            temperature: 20,
            temperatureUnit: "C",
            shortForecast: "Sunny",
          },
        ],
      },
    });
    expect(result.periods[0].temperatureFahrenheit).toBe(68);
    expect(result.periods[0].condition).toBe("clear");
    expect(() => normalizeNwsHourlyForecast({ properties: { periods: [] } })).toThrow();
  });

  test("keeps daytime periods available for the four-day idle rail", () => {
    const result = normalizeNwsDailyForecast({
      properties: {
        periods: Array.from({ length: 8 }, (_, index) => ({
          startTime: `2026-08-${String(index + 4).padStart(2, "0")}T06:00:00-06:00`,
          temperature: 70 + index,
          temperatureUnit: "F",
          shortForecast: index % 2 ? "Sunny" : "Partly Cloudy",
          isDaytime: index % 2 === 0,
        })),
      },
    });

    expect(result.periods).toHaveLength(4);
    expect(result.periods.slice(0, 4).map((period) => period.temperatureFahrenheit)).toEqual([
      70, 72, 74, 76,
    ]);
  });
});
