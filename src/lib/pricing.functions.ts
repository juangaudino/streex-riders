import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { calculatePricing } from "@/features/pricing/pricing-engine";
import {
  type PricingDiscount,
  type PricingLocation,
  type PricingReferral,
  type PricingRouteSnapshot,
  type PricingSettings,
  type PricingZoneMatch,
} from "@/features/pricing/pricing-types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json, Tables } from "@/integrations/supabase/types";
import { assertAdminAccess } from "./admin-auth.server";
import { buildPassengerQuote, getTenantEmailBrand, sendEmail } from "./booking-emails.server";
import { bookingConflictMessage } from "./schedule-conflicts";
import { computeDrivingRoute, resolvePricingLocation } from "./pricing-maps.server";

const AdminSchema = z.object({ adminKey: z.string().optional().default("") });
const LocationSchema = z.object({
  address: z.string().trim().min(2).max(300),
  placeId: z.string().trim().min(1).max(300).optional().nullable(),
});
const ServiceTypeSchema = z.enum([
  "one_way",
  "airport_transfer",
  "multi_stop",
  "long_distance",
  "hourly",
]);
const DiscountTypeSchema = z.enum(["fixed", "percent"]);
const SettingsSchema = z.object({
  timezone: z.string().trim().min(1).max(80).default("America/Denver"),
  baseOfOperations: LocationSchema.nullable(),
  minimumFareCents: z.number().int().min(0).max(1_000_000),
  baseRateCents: z.number().int().min(0).max(1_000_000),
  ratePerMileCents: z.number().int().min(0).max(100_000),
  ratePerMinuteCents: z.number().int().min(0).max(100_000),
  waitingRatePerMinuteCents: z.number().int().min(0).max(100_000),
  additionalStopCents: z.number().int().min(0).max(100_000),
  lateNight: z.object({
    enabled: z.boolean(),
    startsAt: z.string().regex(/^\d{2}:\d{2}$/),
    endsAt: z.string().regex(/^\d{2}:\d{2}$/),
    surchargeCents: z.number().int().min(0).max(1_000_000),
  }),
  hourly: z.object({
    rateCents: z.number().int().min(0).max(1_000_000),
    minimumMinutes: z.number().int().min(15).max(1_440),
    incrementMinutes: z.number().int().min(5).max(120),
  }),
  positioning: z.object({
    freePositioningMiles: z.number().min(0).max(500),
    ratePerMileCents: z.number().int().min(0).max(100_000),
    includeReturnToBase: z.boolean(),
  }),
  roundingIncrementCents: z.number().int().min(1).max(10_000),
});

const ProfileSchema = AdminSchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  settings: SettingsSchema,
});

const ZoneSchema = AdminSchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100),
  kind: z.enum(["included", "special"]),
  location: LocationSchema,
  radiusMeters: z.number().int().min(50).max(160_934),
  adjustmentCents: z.number().int().min(0).max(1_000_000).default(0),
  isActive: z.boolean().default(true),
});

const FlatRateSchema = AdminSchema.extend({
  id: z.string().uuid().optional(),
  pricingProfileId: z.string().uuid(),
  originZoneId: z.string().uuid(),
  destinationZoneId: z.string().uuid(),
  priceCents: z.number().int().min(1).max(10_000_000),
  includedStops: z.number().int().min(0).max(10).default(0),
  isBidirectional: z.boolean().default(true),
  startsAt: z.string().datetime({ offset: true }).optional().nullable(),
  endsAt: z.string().datetime({ offset: true }).optional().nullable(),
  isActive: z.boolean().default(true),
});

const PromotionSchema = AdminSchema.extend({
  id: z.string().uuid().optional(),
  code: z.string().trim().toUpperCase().min(2).max(50),
  name: z.string().trim().min(1).max(100),
  discountType: DiscountTypeSchema,
  discountValue: z.number().int().min(1).max(1_000_000),
  startsAt: z.string().datetime({ offset: true }).optional().nullable(),
  endsAt: z.string().datetime({ offset: true }).optional().nullable(),
  isActive: z.boolean().default(true),
});

const ReferralSchema = AdminSchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  referralType: z.string().trim().min(1).max(80).default("partner"),
  passengerDiscountType: DiscountTypeSchema.optional().nullable(),
  passengerDiscountValue: z.number().int().min(1).max(1_000_000).optional().nullable(),
  commissionType: DiscountTypeSchema,
  commissionValue: z.number().int().min(1).max(1_000_000),
  isActive: z.boolean().default(true),
});

const QuoteInputSchema = AdminSchema.extend({
  pricingProfileId: z.string().uuid(),
  serviceType: ServiceTypeSchema,
  pickup: LocationSchema,
  destination: LocationSchema,
  stops: z.array(LocationSchema).max(8).default([]),
  serviceAt: z.string().datetime({ offset: true }),
  hourlyMinutes: z.number().int().min(15).max(1_440).nullable().default(null),
  waitingMinutes: z.number().int().min(0).max(1_440).default(0),
  promotionId: z.string().uuid().optional().nullable(),
  referralPartnerId: z.string().uuid().optional().nullable(),
  bookingId: z.string().uuid().optional().nullable(),
  customerName: z.string().trim().max(120).optional().nullable(),
  customerEmail: z.string().trim().email().max(200).optional().nullable(),
});
const SaveQuoteSchema = QuoteInputSchema.extend({
  finalCents: z.number().int().min(0).max(10_000_000).nullable().default(null),
  sendBookingQuote: z.boolean().default(false),
});

type PricingProfileRow = Tables<"pricing_profiles">;
type PricingZoneRow = Tables<"pricing_zones">;
type FlatRateRow = Tables<"pricing_flat_rates">;
type PromotionRow = Tables<"pricing_promotions">;
type ReferralRow = Tables<"referral_partners">;

function parseSettings(value: Json): PricingSettings {
  const parsed = SettingsSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("This pricing profile has invalid settings. Review and save it again.");
  }
  return parsed.data;
}

function toDiscount(row: PromotionRow): PricingDiscount {
  return {
    id: row.id,
    label: row.code,
    type: row.discount_type as "fixed" | "percent",
    value: row.discount_value,
  };
}

function toReferral(row: ReferralRow): PricingReferral {
  return {
    id: row.id,
    name: row.name,
    passengerDiscount:
      row.passenger_discount_type && row.passenger_discount_value
        ? {
            id: `${row.id}-passenger`,
            label: `${row.name} discount`,
            type: row.passenger_discount_type as "fixed" | "percent",
            value: row.passenger_discount_value,
          }
        : null,
    commission: {
      id: `${row.id}-commission`,
      label: `${row.name} commission`,
      type: row.commission_type as "fixed" | "percent",
      value: row.commission_value,
    },
  };
}

function distanceMeters(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchingZones(
  location: { latitude: number; longitude: number },
  zones: PricingZoneRow[],
): PricingZoneMatch[] {
  return zones
    .filter((zone) => distanceMeters(location, zone) <= zone.radius_meters)
    .map((zone) => ({
      id: zone.id,
      name: zone.name,
      kind: zone.kind as "included" | "special",
      adjustmentCents: zone.adjustment_cents,
    }));
}

function validAt(row: { starts_at: string | null; ends_at: string | null }, serviceAt: string) {
  const timestamp = new Date(serviceAt).valueOf();
  return (
    (!row.starts_at || new Date(row.starts_at).valueOf() <= timestamp) &&
    (!row.ends_at || timestamp < new Date(row.ends_at).valueOf())
  );
}

function findFlatRate(input: {
  rows: FlatRateRow[];
  zones: PricingZoneRow[];
  pickupMatches: PricingZoneMatch[];
  destinationMatches: PricingZoneMatch[];
  serviceAt: string;
}) {
  const pickupZoneIds = new Set(input.pickupMatches.map((zone) => zone.id));
  const destinationZoneIds = new Set(input.destinationMatches.map((zone) => zone.id));
  const zoneNames = new Map(input.zones.map((zone) => [zone.id, zone.name]));
  const row = input.rows.find((flatRate) => {
    if (!flatRate.is_active || !validAt(flatRate, input.serviceAt)) return false;
    const forward =
      pickupZoneIds.has(flatRate.origin_zone_id) &&
      destinationZoneIds.has(flatRate.destination_zone_id);
    const reverse =
      flatRate.is_bidirectional &&
      pickupZoneIds.has(flatRate.destination_zone_id) &&
      destinationZoneIds.has(flatRate.origin_zone_id);
    return forward || reverse;
  });
  if (!row) return null;
  return {
    id: row.id,
    priceCents: row.price_cents,
    includedStops: row.included_stops,
    originZoneName: zoneNames.get(row.origin_zone_id) || "Origin",
    destinationZoneName: zoneNames.get(row.destination_zone_id) || "Destination",
  };
}

async function loadTenantPricingData(tenantId: string) {
  const [profiles, zones, flatRates, promotions, referrals] = await Promise.all([
    supabaseAdmin.from("pricing_profiles").select("*").eq("tenant_id", tenantId).order("name"),
    supabaseAdmin.from("pricing_zones").select("*").eq("tenant_id", tenantId).order("name"),
    supabaseAdmin
      .from("pricing_flat_rates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("pricing_promotions").select("*").eq("tenant_id", tenantId).order("code"),
    supabaseAdmin.from("referral_partners").select("*").eq("tenant_id", tenantId).order("name"),
  ]);
  const error = [
    profiles.error,
    zones.error,
    flatRates.error,
    promotions.error,
    referrals.error,
  ].find(Boolean);
  if (error) throw new Error("Unable to load Pricing configuration.");
  return {
    profiles: profiles.data ?? [],
    zones: zones.data ?? [],
    flatRates: flatRates.data ?? [],
    promotions: promotions.data ?? [],
    referrals: referrals.data ?? [],
  };
}

async function prepareQuote(tenantId: string, input: z.infer<typeof QuoteInputSchema>) {
  const config = await loadTenantPricingData(tenantId);
  const profile = config.profiles.find(
    (item) => item.id === input.pricingProfileId && item.is_active,
  );
  if (!profile) throw new Error("Select an active pricing profile.");
  const settings = parseSettings(profile.settings);
  if (!settings.baseOfOperations)
    throw new Error("Set the Base of Operations in this pricing profile before calculating.");

  let source = { ...input };
  let booking: Tables<"bookings"> | null = null;
  if (input.bookingId) {
    const result = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", input.bookingId)
      .eq("tenant_id", tenantId)
      .single();
    if (result.error || !result.data) throw new Error("The selected booking is unavailable.");
    booking = result.data;
    source = {
      ...input,
      serviceType: booking.service_type === "hourly" ? "hourly" : input.serviceType,
      pickup: { address: booking.pickup, placeId: null },
      destination: { address: booking.destination, placeId: null },
      stops: [],
      serviceAt: booking.start_at || input.serviceAt,
      hourlyMinutes:
        booking.service_type === "hourly"
          ? booking.estimated_duration_minutes
          : input.hourlyMinutes,
      customerName: booking.name,
      customerEmail: booking.email,
    };
  }

  const labels = [
    source.pickup.address,
    ...source.stops.map((stop) => stop.address),
    source.destination.address,
  ].map((address, index, items) =>
    index === items.length - 1
      ? `To ${address}`
      : index === 0
        ? `From ${address}`
        : `Stop ${index}: ${address}`,
  );
  const [passengerRoute, basePickup, destinationBase, pickupPoint, destinationPoint] =
    await Promise.all([
      computeDrivingRoute({
        origin: source.pickup,
        destination: source.destination,
        stops: source.stops,
        serviceAt: source.serviceAt,
        labels,
      }),
      computeDrivingRoute({
        origin: settings.baseOfOperations,
        destination: source.pickup,
        serviceAt: source.serviceAt,
        labels: ["Base to pickup"],
      }),
      computeDrivingRoute({
        origin: source.destination,
        destination: settings.baseOfOperations,
        serviceAt: source.serviceAt,
        labels: ["Destination to base"],
      }),
      resolvePricingLocation(source.pickup),
      resolvePricingLocation(source.destination),
    ]);

  const activeZones = config.zones.filter((zone) => zone.is_active);
  const pickupZones = matchingZones(pickupPoint, activeZones);
  const destinationZones = matchingZones(destinationPoint, activeZones);
  const route: PricingRouteSnapshot = {
    passengerLegs: passengerRoute.legs,
    passengerDistanceMeters: passengerRoute.distanceMeters,
    passengerDurationSeconds: passengerRoute.durationSeconds,
    passengerStaticDurationSeconds: passengerRoute.staticDurationSeconds,
    baseToPickupDistanceMeters: basePickup.distanceMeters,
    destinationToBaseDistanceMeters: destinationBase.distanceMeters,
    trafficUsed: passengerRoute.trafficUsed,
    pickupZones,
    destinationZones,
  };
  const now = new Date().valueOf();
  const promotion = input.promotionId
    ? config.promotions.find(
        (item) =>
          item.id === input.promotionId &&
          item.is_active &&
          validAt(item, new Date(now).toISOString()),
      )
    : null;
  if (input.promotionId && !promotion)
    throw new Error("That promotion is inactive or outside its valid dates.");
  const referralRow = input.referralPartnerId
    ? config.referrals.find((item) => item.id === input.referralPartnerId && item.is_active)
    : null;
  if (input.referralPartnerId && !referralRow)
    throw new Error("That referral partner is inactive or unavailable.");
  const flatRate = findFlatRate({
    rows: config.flatRates.filter((item) => item.pricing_profile_id === profile.id),
    zones: activeZones,
    pickupMatches: pickupZones,
    destinationMatches: destinationZones,
    serviceAt: source.serviceAt,
  });
  const calculation = calculatePricing({
    quote: {
      serviceType: source.serviceType,
      stops: source.stops,
      serviceAt: source.serviceAt,
      hourlyMinutes: source.hourlyMinutes,
      waitingMinutes: source.waitingMinutes,
    },
    settings,
    route,
    flatRate,
    promotion: promotion ? toDiscount(promotion) : null,
    referral: referralRow ? toReferral(referralRow) : null,
  });
  return { profile, settings, route, calculation, source, promotion, referralRow, booking };
}

export const getPricingAdminData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const [pricing, bookingResult, quoteResult] = await Promise.all([
      loadTenantPricingData(access.tenantId),
      supabaseAdmin
        .from("bookings")
        .select(
          "id,name,pickup,destination,date,time,start_at,service_type,estimated_duration_minutes,status",
        )
        .eq("tenant_id", access.tenantId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("pricing_quotes")
        .select(
          "id,booking_id,customer_name,pickup,destination,recommended_cents,final_cents,status,commission_status,created_at",
        )
        .eq("tenant_id", access.tenantId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (bookingResult.error || quoteResult.error) throw new Error("Unable to load Pricing quotes.");
    return { ...pricing, bookings: bookingResult.data ?? [], quotes: quoteResult.data ?? [] };
  });

export const savePricingProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ProfileSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const now = new Date().toISOString();
    if (data.isDefault) {
      const reset = await supabaseAdmin
        .from("pricing_profiles")
        .update({ is_default: false, updated_at: now })
        .eq("tenant_id", access.tenantId);
      if (reset.error) throw new Error("Unable to update the default profile.");
    }
    const values = {
      tenant_id: access.tenantId,
      name: data.name,
      is_active: data.isActive,
      is_default: data.isDefault && data.isActive,
      settings: data.settings as unknown as Json,
      updated_at: now,
    };
    const result = data.id
      ? await supabaseAdmin
          .from("pricing_profiles")
          .update(values)
          .eq("id", data.id)
          .eq("tenant_id", access.tenantId)
          .select("*")
          .single()
      : await supabaseAdmin.from("pricing_profiles").insert(values).select("*").single();
    if (result.error || !result.data) throw new Error("Unable to save the pricing profile.");
    return { profile: result.data };
  });

export const savePricingZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ZoneSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const location = await resolvePricingLocation(data.location);
    const values = {
      tenant_id: access.tenantId,
      name: data.name,
      kind: data.kind,
      address: location.address,
      place_id: data.location.placeId || null,
      latitude: location.latitude,
      longitude: location.longitude,
      radius_meters: data.radiusMeters,
      adjustment_cents: data.adjustmentCents,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await supabaseAdmin
          .from("pricing_zones")
          .update(values)
          .eq("id", data.id)
          .eq("tenant_id", access.tenantId)
          .select("*")
          .single()
      : await supabaseAdmin.from("pricing_zones").insert(values).select("*").single();
    if (result.error || !result.data) throw new Error("Unable to save this service zone.");
    return { zone: result.data };
  });

export const savePricingFlatRate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FlatRateSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    if (data.originZoneId === data.destinationZoneId)
      throw new Error("Choose two different zones.");
    const [profile, zones] = await Promise.all([
      supabaseAdmin
        .from("pricing_profiles")
        .select("id")
        .eq("id", data.pricingProfileId)
        .eq("tenant_id", access.tenantId)
        .maybeSingle(),
      supabaseAdmin
        .from("pricing_zones")
        .select("id")
        .eq("tenant_id", access.tenantId)
        .in("id", [data.originZoneId, data.destinationZoneId]),
    ]);
    if (!profile.data || (zones.data ?? []).length !== 2)
      throw new Error("Profile and zones must belong to this workspace.");
    const values = {
      tenant_id: access.tenantId,
      pricing_profile_id: data.pricingProfileId,
      origin_zone_id: data.originZoneId,
      destination_zone_id: data.destinationZoneId,
      price_cents: data.priceCents,
      included_stops: data.includedStops,
      is_bidirectional: data.isBidirectional,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await supabaseAdmin
          .from("pricing_flat_rates")
          .update(values)
          .eq("id", data.id)
          .eq("tenant_id", access.tenantId)
          .select("*")
          .single()
      : await supabaseAdmin.from("pricing_flat_rates").insert(values).select("*").single();
    if (result.error || !result.data) throw new Error("Unable to save this flat rate.");
    return { flatRate: result.data };
  });

export const savePricingPromotion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PromotionSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    if (data.discountType === "percent" && data.discountValue > 100)
      throw new Error("Percent discounts cannot exceed 100%.");
    const values = {
      tenant_id: access.tenantId,
      code: data.code,
      name: data.name,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await supabaseAdmin
          .from("pricing_promotions")
          .update(values)
          .eq("id", data.id)
          .eq("tenant_id", access.tenantId)
          .select("*")
          .single()
      : await supabaseAdmin.from("pricing_promotions").insert(values).select("*").single();
    if (result.error || !result.data) throw new Error("Unable to save this promotion.");
    return { promotion: result.data };
  });

export const saveReferralPartner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReferralSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    if (
      (data.passengerDiscountType === "percent" && (data.passengerDiscountValue ?? 0) > 100) ||
      (data.commissionType === "percent" && data.commissionValue > 100)
    ) {
      throw new Error("Percent values cannot exceed 100%.");
    }
    if (data.passengerDiscountType && !data.passengerDiscountValue) {
      throw new Error("Enter a passenger discount value or leave the discount empty.");
    }
    const values = {
      tenant_id: access.tenantId,
      name: data.name,
      referral_type: data.referralType,
      passenger_discount_type: data.passengerDiscountType,
      passenger_discount_value: data.passengerDiscountValue,
      commission_type: data.commissionType,
      commission_value: data.commissionValue,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await supabaseAdmin
          .from("referral_partners")
          .update(values)
          .eq("id", data.id)
          .eq("tenant_id", access.tenantId)
          .select("*")
          .single()
      : await supabaseAdmin.from("referral_partners").insert(values).select("*").single();
    if (result.error || !result.data) throw new Error("Unable to save this referral partner.");
    return { referral: result.data };
  });

export const previewPricingQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteInputSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const prepared = await prepareQuote(access.tenantId, data);
    return {
      calculation: prepared.calculation,
      route: prepared.route,
      profile: { id: prepared.profile.id, name: prepared.profile.name },
      customer: {
        name: prepared.source.customerName || null,
        email: prepared.source.customerEmail || null,
      },
      bookingId: prepared.booking?.id || null,
    };
  });

export const savePricingQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveQuoteSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    if (data.sendBookingQuote && !data.bookingId)
      throw new Error("Only a linked booking can be emailed from Pricing.");
    const prepared = await prepareQuote(access.tenantId, data);
    if (data.sendBookingQuote && prepared.booking?.status !== "pending") {
      throw new Error("Only a pending booking can receive a new Pricing quote.");
    }
    const finalCents = data.finalCents ?? prepared.calculation.recommendedCents;
    const now = new Date().toISOString();
    const calculationSnapshot = {
      engineVersion: 1,
      profile: {
        id: prepared.profile.id,
        name: prepared.profile.name,
        settings: prepared.settings,
      },
      calculation: prepared.calculation,
      flatRate: prepared.calculation.flatRateId,
      promotion: prepared.promotion
        ? { id: prepared.promotion.id, code: prepared.promotion.code }
        : null,
      referral: prepared.referralRow
        ? { id: prepared.referralRow.id, name: prepared.referralRow.name }
        : null,
    };
    const insert = await supabaseAdmin
      .from("pricing_quotes")
      .insert({
        tenant_id: access.tenantId,
        booking_id: prepared.booking?.id || null,
        pricing_profile_id: prepared.profile.id,
        promotion_id: prepared.promotion?.id || null,
        referral_partner_id: prepared.referralRow?.id || null,
        created_by_user_id: access.userId,
        service_type: prepared.source.serviceType,
        pricing_mode: prepared.calculation.pricingMode,
        status: "draft",
        commission_status: "not_applicable",
        customer_name: prepared.source.customerName || null,
        customer_email: prepared.source.customerEmail || null,
        pickup: prepared.source.pickup.address,
        destination: prepared.source.destination.address,
        stops: prepared.source.stops as unknown as Json,
        service_at: prepared.source.serviceAt,
        route_snapshot: prepared.route as unknown as Json,
        calculation_snapshot: calculationSnapshot as unknown as Json,
        recommended_cents: prepared.calculation.recommendedCents,
        final_cents: finalCents,
        discount_cents: prepared.calculation.discountCents,
        referral_commission_cents: prepared.calculation.referralCommissionCents,
        sent_at: null,
      })
      .select("*")
      .single();
    if (insert.error || !insert.data) throw new Error("Unable to save this pricing quote.");

    if (data.sendBookingQuote && prepared.booking) {
      const update = await supabaseAdmin
        .from("bookings")
        .update({ price: finalCents / 100, status: "quoted" })
        .eq("id", prepared.booking.id)
        .eq("tenant_id", access.tenantId)
        .select("*")
        .single();
      if (update.error || !update.data) {
        throw new Error(
          bookingConflictMessage(update.error) ?? "Unable to send the linked booking quote.",
        );
      }
      const quoteUpdate = await supabaseAdmin
        .from("pricing_quotes")
        .update({
          status: "sent",
          commission_status: prepared.calculation.referralCommissionCents
            ? "calculated"
            : "not_applicable",
          sent_at: now,
          updated_at: now,
        })
        .eq("id", insert.data.id)
        .eq("tenant_id", access.tenantId)
        .select("*")
        .single();
      if (quoteUpdate.error || !quoteUpdate.data) {
        throw new Error("The booking was quoted, but its Pricing snapshot could not be finalized.");
      }
      if (prepared.promotion) {
        const redemption = await supabaseAdmin.from("pricing_promo_redemptions").insert({
          tenant_id: access.tenantId,
          promotion_id: prepared.promotion.id,
          pricing_quote_id: insert.data.id,
          customer_email: prepared.source.customerEmail || null,
        });
        if (redemption.error)
          throw new Error("The quote was saved, but the promotion usage could not be recorded.");
      }
      const brand = await getTenantEmailBrand(access.tenantId);
      await sendEmail({ to: update.data.email, ...buildPassengerQuote(update.data, brand) });
      return { quote: quoteUpdate.data };
    }
    return { quote: insert.data };
  });
