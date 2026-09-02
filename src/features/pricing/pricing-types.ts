export type PricingServiceType =
  | "one_way"
  | "airport_transfer"
  | "multi_stop"
  | "long_distance"
  | "hourly";

export type PricingMode = "flat_rate" | "dynamic" | "hourly";

export type DiscountType = "fixed" | "percent";

export type PricingLocation = {
  address: string;
  placeId?: string | null;
};

export type PricingSettings = {
  timezone: string;
  baseOfOperations: PricingLocation | null;
  minimumFareCents: number;
  baseRateCents: number;
  ratePerMileCents: number;
  ratePerMinuteCents: number;
  waitingRatePerMinuteCents: number;
  additionalStopCents: number;
  lateNight: {
    enabled: boolean;
    startsAt: string;
    endsAt: string;
    surchargeCents: number;
  };
  hourly: {
    rateCents: number;
    minimumMinutes: number;
    incrementMinutes: number;
  };
  positioning: {
    freePositioningMiles: number;
    ratePerMileCents: number;
    includeReturnToBase: boolean;
  };
  roundingIncrementCents: number;
};

export type PricingZoneMatch = {
  id: string;
  name: string;
  kind: "included" | "special";
  adjustmentCents: number;
};

export type PricingRouteLeg = {
  label: string;
  distanceMeters: number;
  durationSeconds: number;
  staticDurationSeconds: number | null;
};

export type PricingRouteSnapshot = {
  passengerLegs: PricingRouteLeg[];
  passengerDistanceMeters: number;
  passengerDurationSeconds: number;
  passengerStaticDurationSeconds: number | null;
  baseToPickupDistanceMeters: number | null;
  destinationToBaseDistanceMeters: number | null;
  trafficUsed: boolean;
  pickupZones: PricingZoneMatch[];
  destinationZones: PricingZoneMatch[];
};

export type PricingFlatRate = {
  id: string;
  priceCents: number;
  includedStops: number;
  originZoneName: string;
  destinationZoneName: string;
};

export type PricingDiscount = {
  id: string;
  label: string;
  type: DiscountType;
  value: number;
};

export type PricingReferral = {
  id: string;
  name: string;
  passengerDiscount: PricingDiscount | null;
  commission: PricingDiscount;
};

export type PricingInput = {
  serviceType: PricingServiceType;
  stops: PricingLocation[];
  serviceAt: string;
  hourlyMinutes: number | null;
  waitingMinutes: number;
};

export type PricingLineItem = {
  key: string;
  label: string;
  amountCents: number;
};

export type PricingCalculation = {
  pricingMode: PricingMode;
  flatRateId: string | null;
  passengerMiles: number;
  passengerMinutes: number;
  positioningMiles: number;
  subtotalCents: number;
  discountCents: number;
  referralCommissionCents: number;
  recommendedCents: number;
  suggestedCents: number[];
  lineItems: PricingLineItem[];
};

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  timezone: "America/Denver",
  baseOfOperations: null,
  minimumFareCents: 0,
  baseRateCents: 0,
  ratePerMileCents: 0,
  ratePerMinuteCents: 0,
  waitingRatePerMinuteCents: 0,
  additionalStopCents: 0,
  lateNight: {
    enabled: false,
    startsAt: "22:00",
    endsAt: "05:00",
    surchargeCents: 0,
  },
  hourly: {
    rateCents: 0,
    minimumMinutes: 120,
    incrementMinutes: 15,
  },
  positioning: {
    freePositioningMiles: 0,
    ratePerMileCents: 0,
    includeReturnToBase: false,
  },
  roundingIncrementCents: 500,
};
