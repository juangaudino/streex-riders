import { describe, expect, test } from "bun:test";
import { calculatePricing } from "../src/features/pricing/pricing-engine.ts";

const route = {
  passengerLegs: [],
  passengerDistanceMeters: 16_093.44,
  passengerDurationSeconds: 1_200,
  passengerStaticDurationSeconds: 1_100,
  baseToPickupDistanceMeters: 8_046.72,
  destinationToBaseDistanceMeters: 4_828.032,
  trafficUsed: true,
  pickupZones: [],
  destinationZones: [],
};

const settings = {
  timezone: "America/Denver",
  baseOfOperations: { address: "Base", placeId: null },
  minimumFareCents: 4_000,
  baseRateCents: 500,
  ratePerMileCents: 200,
  ratePerMinuteCents: 50,
  waitingRatePerMinuteCents: 100,
  additionalStopCents: 600,
  lateNight: { enabled: true, startsAt: "22:00", endsAt: "05:00", surchargeCents: 1_000 },
  hourly: { rateCents: 6_000, minimumMinutes: 120, incrementMinutes: 15 },
  positioning: { freePositioningMiles: 2, ratePerMileCents: 150, includeReturnToBase: false },
  roundingIncrementCents: 500,
};

describe("Pricing Engine", () => {
  test("uses the dynamic minimum, internal positioning, discount and referral separately", () => {
    const result = calculatePricing({
      quote: {
        serviceType: "one_way",
        stops: [],
        serviceAt: "2026-09-01T04:00:00-06:00",
        hourlyMinutes: null,
        waitingMinutes: 5,
      },
      settings,
      route: {
        ...route,
        destinationZones: [
          { id: "special", name: "Mountain", kind: "special", adjustmentCents: 700 },
        ],
      },
      flatRate: null,
      promotion: { id: "launch", label: "LAUNCH", type: "percent", value: 10 },
      referral: {
        id: "hotel",
        name: "Hotel",
        passengerDiscount: { id: "guest", label: "Hotel discount", type: "fixed", value: 500 },
        commission: { id: "commission", label: "Hotel commission", type: "percent", value: 10 },
      },
    });

    expect(result.pricingMode).toBe("dynamic");
    expect(result.subtotalCents).toBe(6_650);
    expect(result.discountCents).toBe(1_165);
    expect(result.recommendedCents).toBe(5_485);
    expect(result.referralCommissionCents).toBe(549);
    expect(result.positioningMiles).toBe(3);
  });

  test("prioritizes a matching flat rate and charges only stops beyond its allowance", () => {
    const result = calculatePricing({
      quote: {
        serviceType: "airport_transfer",
        stops: [{ address: "One" }, { address: "Two" }],
        serviceAt: "2026-09-01T12:00:00-06:00",
        hourlyMinutes: null,
        waitingMinutes: 0,
      },
      settings: { ...settings, lateNight: { ...settings.lateNight, enabled: false } },
      route: {
        ...route,
        pickupZones: [{ id: "airport", name: "SLC Airport", kind: "included", adjustmentCents: 0 }],
        destinationZones: [
          { id: "park-city", name: "Park City", kind: "included", adjustmentCents: 0 },
        ],
      },
      flatRate: {
        id: "airport-park-city",
        priceCents: 10_000,
        includedStops: 1,
        originZoneName: "SLC Airport",
        destinationZoneName: "Park City",
      },
      promotion: null,
      referral: null,
    });

    expect(result.pricingMode).toBe("flat_rate");
    expect(result.subtotalCents).toBe(10_600);
    expect(result.recommendedCents).toBe(10_600);
    expect(result.positioningMiles).toBe(0);
  });

  test("rounds hourly service up to its configured increment", () => {
    const result = calculatePricing({
      quote: {
        serviceType: "hourly",
        stops: [],
        serviceAt: "2026-09-01T12:00:00-06:00",
        hourlyMinutes: 130,
        waitingMinutes: 0,
      },
      settings: {
        ...settings,
        lateNight: { ...settings.lateNight, enabled: false },
        positioning: { ...settings.positioning, ratePerMileCents: 0 },
      },
      route,
      flatRate: null,
      promotion: null,
      referral: null,
    });

    expect(result.pricingMode).toBe("hourly");
    expect(result.subtotalCents).toBe(13_500);
    expect(result.suggestedCents).toEqual([13_000, 13_500, 14_000]);
  });
});
