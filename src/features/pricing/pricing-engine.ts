import type {
  PricingCalculation,
  PricingDiscount,
  PricingFlatRate,
  PricingInput,
  PricingLineItem,
  PricingReferral,
  PricingRouteSnapshot,
  PricingSettings,
} from "./pricing-types";

const METERS_PER_MILE = 1609.344;

function cents(value: number) {
  return Math.round(value);
}

function timeInRange(value: string, startsAt: string, endsAt: string) {
  if (startsAt === endsAt) return true;
  if (startsAt < endsAt) return value >= startsAt && value < endsAt;
  return value >= startsAt || value < endsAt;
}

function localTime(isoDate: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(isoDate));
}

function applyDiscount(amountCents: number, discount: PricingDiscount | null) {
  if (!discount) return 0;
  return Math.min(
    amountCents,
    discount.type === "percent" ? cents((amountCents * discount.value) / 100) : discount.value,
  );
}

function calculateCommission(amountCents: number, referral: PricingReferral | null) {
  if (!referral) return 0;
  return referral.commission.type === "percent"
    ? cents((amountCents * referral.commission.value) / 100)
    : referral.commission.value;
}

function suggestedOptions(recommendedCents: number, incrementCents: number) {
  const increment = Math.max(1, incrementCents);
  const nearest = Math.round(recommendedCents / increment) * increment;
  return Array.from(new Set([Math.max(0, nearest - increment), nearest, nearest + increment])).sort(
    (a, b) => a - b,
  );
}

export function calculatePricing(input: {
  quote: PricingInput;
  settings: PricingSettings;
  route: PricingRouteSnapshot;
  flatRate: PricingFlatRate | null;
  promotion: PricingDiscount | null;
  referral: PricingReferral | null;
}): PricingCalculation {
  const { quote, settings, route, flatRate, promotion, referral } = input;
  const passengerMiles = route.passengerDistanceMeters / METERS_PER_MILE;
  const passengerMinutes = route.passengerDurationSeconds / 60;
  const baseToPickupMiles = (route.baseToPickupDistanceMeters ?? 0) / METERS_PER_MILE;
  const destinationToBaseMiles = (route.destinationToBaseDistanceMeters ?? 0) / METERS_PER_MILE;
  const pickupIncluded = route.pickupZones.some((zone) => zone.kind === "included");
  const destinationIncluded = route.destinationZones.some((zone) => zone.kind === "included");
  const positioningMiles =
    (pickupIncluded
      ? 0
      : Math.max(0, baseToPickupMiles - settings.positioning.freePositioningMiles)) +
    (settings.positioning.includeReturnToBase && !destinationIncluded ? destinationToBaseMiles : 0);
  const lineItems: PricingLineItem[] = [];
  let pricingMode: PricingCalculation["pricingMode"];
  let subtotalCents = 0;

  if (flatRate) {
    pricingMode = "flat_rate";
    subtotalCents = flatRate.priceCents;
    lineItems.push({
      key: "flat_rate",
      label: `Flat rate · ${flatRate.originZoneName} ↔ ${flatRate.destinationZoneName}`,
      amountCents: flatRate.priceCents,
    });
    const extraStops = Math.max(0, quote.stops.length - flatRate.includedStops);
    if (extraStops && settings.additionalStopCents) {
      const amountCents = extraStops * settings.additionalStopCents;
      subtotalCents += amountCents;
      lineItems.push({
        key: "extra_stops",
        label: `${extraStops} additional stop${extraStops === 1 ? "" : "s"}`,
        amountCents,
      });
    }
  } else if (quote.serviceType === "hourly") {
    pricingMode = "hourly";
    const requestedMinutes = Math.max(0, quote.hourlyMinutes ?? 0);
    const billedMinutes = Math.max(
      settings.hourly.minimumMinutes,
      Math.ceil(requestedMinutes / settings.hourly.incrementMinutes) *
        settings.hourly.incrementMinutes,
    );
    const amountCents = cents((billedMinutes / 60) * settings.hourly.rateCents);
    subtotalCents = amountCents;
    lineItems.push({
      key: "hourly",
      label: `Hourly service · ${billedMinutes} billed minutes`,
      amountCents,
    });
  } else {
    pricingMode = "dynamic";
    const dynamicCents =
      settings.baseRateCents +
      cents(passengerMiles * settings.ratePerMileCents) +
      cents(passengerMinutes * settings.ratePerMinuteCents);
    subtotalCents = Math.max(settings.minimumFareCents, dynamicCents);
    lineItems.push({ key: "dynamic", label: "Dynamic route rate", amountCents: subtotalCents });
  }

  if (quote.waitingMinutes > 0 && settings.waitingRatePerMinuteCents > 0) {
    const amountCents = cents(quote.waitingMinutes * settings.waitingRatePerMinuteCents);
    subtotalCents += amountCents;
    lineItems.push({
      key: "waiting",
      label: `Waiting time · ${quote.waitingMinutes} min`,
      amountCents,
    });
  }

  if (positioningMiles > 0 && settings.positioning.ratePerMileCents > 0) {
    const amountCents = cents(positioningMiles * settings.positioning.ratePerMileCents);
    subtotalCents += amountCents;
    lineItems.push({ key: "positioning", label: "Operational positioning", amountCents });
  }

  const specialZones = [...route.pickupZones, ...route.destinationZones].filter(
    (zone, index, zones) =>
      zone.kind === "special" && zones.findIndex((item) => item.id === zone.id) === index,
  );
  for (const zone of specialZones) {
    if (!zone.adjustmentCents) continue;
    subtotalCents += zone.adjustmentCents;
    lineItems.push({
      key: `zone-${zone.id}`,
      label: `Special area · ${zone.name}`,
      amountCents: zone.adjustmentCents,
    });
  }

  if (
    settings.lateNight.enabled &&
    settings.lateNight.surchargeCents > 0 &&
    timeInRange(
      localTime(quote.serviceAt, settings.timezone),
      settings.lateNight.startsAt,
      settings.lateNight.endsAt,
    )
  ) {
    subtotalCents += settings.lateNight.surchargeCents;
    lineItems.push({
      key: "late_night",
      label: "Late-night service",
      amountCents: settings.lateNight.surchargeCents,
    });
  }

  const promotionDiscountCents = applyDiscount(subtotalCents, promotion);
  const afterPromotionCents = subtotalCents - promotionDiscountCents;
  if (promotionDiscountCents) {
    lineItems.push({
      key: "promotion",
      label: promotion?.label || "Promotion",
      amountCents: -promotionDiscountCents,
    });
  }
  const referralDiscountCents = applyDiscount(
    afterPromotionCents,
    referral?.passengerDiscount ?? null,
  );
  if (referralDiscountCents) {
    lineItems.push({
      key: "referral_discount",
      label: `${referral?.name || "Referral"} discount`,
      amountCents: -referralDiscountCents,
    });
  }
  const recommendedCents = Math.max(0, afterPromotionCents - referralDiscountCents);
  const referralCommissionCents = calculateCommission(recommendedCents, referral);

  return {
    pricingMode,
    flatRateId: flatRate?.id ?? null,
    passengerMiles: Number(passengerMiles.toFixed(2)),
    passengerMinutes: Math.round(passengerMinutes),
    positioningMiles: Number(positioningMiles.toFixed(2)),
    subtotalCents,
    discountCents: promotionDiscountCents + referralDiscountCents,
    referralCommissionCents,
    recommendedCents,
    suggestedCents: suggestedOptions(recommendedCents, settings.roundingIncrementCents),
    lineItems,
  };
}
