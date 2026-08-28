import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";

export const getPassengerWeather = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        latitude: z.number().finite().min(17).max(72).optional(),
        longitude: z.number().finite().min(-180).max(-60).optional(),
      })
      .refine(
        ({ latitude, longitude }) =>
          (latitude === undefined && longitude === undefined) ||
          (latitude !== undefined && longitude !== undefined),
        "Weather coordinates must be supplied together.",
      )
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { getPassengerWeatherServer } = await import("./weather.server");
      const weather = CONFIG.passengerConsole.weather;
      // Browser coordinates are rounded before this request. They are used only to retrieve the
      // local forecast; neither raw coordinates nor the result are written to Passenger analytics.
      const latitude = data.latitude ?? weather.latitude;
      const longitude = data.longitude ?? weather.longitude;
      return {
        state: "ready" as const,
        weather: await getPassengerWeatherServer(latitude, longitude),
      };
    } catch (error) {
      console.error("[Weather] hourly forecast unavailable", error);
      return { state: "unavailable" as const };
    }
  });
