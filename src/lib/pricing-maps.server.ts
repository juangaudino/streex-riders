import type { PricingLocation, PricingRouteLeg } from "@/features/pricing/pricing-types";

type GoogleWaypoint = { address: string } | { placeId: string };

type GoogleRoute = {
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  legs?: Array<{
    distanceMeters?: number;
    duration?: string;
    staticDuration?: string;
  }>;
};

export type ResolvedLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

function serverMapsKey() {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    throw new Error(
      "Google Routes is not configured. Add the restricted GOOGLE_MAPS_SERVER_KEY server secret before calculating prices.",
    );
  }
  return key;
}

function waypoint(location: PricingLocation): GoogleWaypoint {
  if (location.placeId) return { placeId: location.placeId };
  return { address: location.address };
}

function durationSeconds(value: string | undefined) {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.replace(/s$/, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function isFutureDeparture(serviceAt: string) {
  const date = new Date(serviceAt);
  return Number.isFinite(date.valueOf()) && date.valueOf() > Date.now();
}

async function googleJson<T>(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    console.error("[pricing-maps] Google API error", response.status, body.slice(0, 500));
    throw new Error(
      "Google Maps could not calculate this route. Verify the address and server API setup.",
    );
  }
  return (await response.json()) as T;
}

export async function computeDrivingRoute(input: {
  origin: PricingLocation;
  destination: PricingLocation;
  stops?: PricingLocation[];
  serviceAt: string;
  labels: string[];
}) {
  const key = serverMapsKey();
  const useTraffic = isFutureDeparture(input.serviceAt);
  const body: Record<string, unknown> = {
    origin: waypoint(input.origin),
    destination: waypoint(input.destination),
    intermediates: (input.stops ?? []).map(waypoint),
    travelMode: "DRIVE",
  };
  if (useTraffic) {
    body.routingPreference = "TRAFFIC_AWARE";
    body.departureTime = new Date(input.serviceAt).toISOString();
  }
  const result = await googleJson<{ routes?: GoogleRoute[] }>(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "routes.distanceMeters,routes.duration,routes.staticDuration,routes.legs.distanceMeters,routes.legs.duration,routes.legs.staticDuration",
      },
      body: JSON.stringify(body),
    },
  );
  const route = result.routes?.[0];
  if (!route?.distanceMeters || !route.duration)
    throw new Error("Google Maps did not return a drivable route.");
  const legs: PricingRouteLeg[] = (route.legs ?? []).map((leg, index) => ({
    label: input.labels[index] || `Leg ${index + 1}`,
    distanceMeters: leg.distanceMeters ?? 0,
    durationSeconds: durationSeconds(leg.duration),
    staticDurationSeconds: leg.staticDuration ? durationSeconds(leg.staticDuration) : null,
  }));
  return {
    distanceMeters: route.distanceMeters,
    durationSeconds: durationSeconds(route.duration),
    staticDurationSeconds: route.staticDuration ? durationSeconds(route.staticDuration) : null,
    legs,
    trafficUsed: useTraffic,
  };
}

export async function resolvePricingLocation(location: PricingLocation): Promise<ResolvedLocation> {
  const key = serverMapsKey();
  if (location.placeId) {
    const result = await googleJson<{
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
    }>(`https://places.googleapis.com/v1/places/${encodeURIComponent(location.placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "formattedAddress,location",
      },
    });
    if (result.location?.latitude == null || result.location.longitude == null) {
      throw new Error("Google Places could not resolve this location.");
    }
    return {
      address: result.formattedAddress || location.address,
      latitude: result.location.latitude,
      longitude: result.location.longitude,
    };
  }

  const encodedAddress = encodeURIComponent(location.address);
  const result = await googleJson<{
    results?: Array<{
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  }>(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${key}`, {
    headers: { Accept: "application/json" },
  });
  const match = result.results?.[0];
  const coordinates = match?.geometry?.location;
  if (coordinates?.lat == null || coordinates.lng == null) {
    throw new Error("Google Maps could not resolve this address for zone matching.");
  }
  return {
    address: match?.formatted_address || location.address,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
  };
}
