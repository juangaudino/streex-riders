import { describe, expect, test } from "bun:test";
import { normalizeNwsHourlyForecast } from "../src/lib/weather.ts";

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
});
