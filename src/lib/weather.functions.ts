import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";

export const getPassengerWeather = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({}).parse(input))
  .handler(async () => {
    try {
      const { getPassengerWeatherServer } = await import("./weather.server");
      const weather = CONFIG.passengerConsole.weather;
      return {
        state: "ready" as const,
        weather: await getPassengerWeatherServer(weather.latitude, weather.longitude),
      };
    } catch (error) {
      console.error("[Weather] hourly forecast unavailable", error);
      return { state: "unavailable" as const };
    }
  });
