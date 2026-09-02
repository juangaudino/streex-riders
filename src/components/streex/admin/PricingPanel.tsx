import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import {
  PlacesAutocompleteInput,
  type PlacesAutocompleteSelection,
} from "../PlacesAutocompleteInput";
import {
  getPricingAdminData,
  previewPricingQuote,
  savePricingFlatRate,
  savePricingProfile,
  savePricingPromotion,
  savePricingQuote,
  savePricingZone,
  saveReferralPartner,
} from "@/lib/pricing.functions";
import { DEFAULT_PRICING_SETTINGS } from "@/features/pricing/pricing-types";
import type {
  PricingCalculation,
  PricingLocation,
  PricingRouteSnapshot,
  PricingServiceType,
  PricingSettings,
} from "@/features/pricing/pricing-types";

type Profile = {
  id: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  settings: PricingSettings;
};
type Zone = {
  id: string;
  name: string;
  kind: "included" | "special";
  address: string;
  place_id: string | null;
  radius_meters: number;
  adjustment_cents: number;
  is_active: boolean;
};
type FlatRate = {
  id: string;
  pricing_profile_id: string;
  origin_zone_id: string;
  destination_zone_id: string;
  price_cents: number;
  included_stops: number;
  is_bidirectional: boolean;
  is_active: boolean;
};
type Promotion = {
  id: string;
  code: string;
  name: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};
type Referral = {
  id: string;
  name: string;
  referral_type: string;
  passenger_discount_type: "fixed" | "percent" | null;
  passenger_discount_value: number | null;
  commission_type: "fixed" | "percent";
  commission_value: number;
  is_active: boolean;
};
type Booking = {
  id: string;
  name: string;
  pickup: string;
  destination: string;
  start_at: string | null;
  service_type: string;
  estimated_duration_minutes: number;
  status: string;
};
type QuoteSummary = {
  id: string;
  customer_name: string | null;
  pickup: string;
  destination: string;
  recommended_cents: number;
  final_cents: number | null;
  status: string;
  commission_status: string;
  created_at: string;
};
type PricingData = {
  profiles: Profile[];
  zones: Zone[];
  flatRates: FlatRate[];
  promotions: Promotion[];
  referrals: Referral[];
  bookings: Booking[];
  quotes: QuoteSummary[];
};

type LocationDraft = PricingLocation;
type QuoteDraft = {
  profileId: string;
  bookingId: string;
  serviceType: PricingServiceType;
  pickup: LocationDraft;
  destination: LocationDraft;
  stops: LocationDraft[];
  date: string;
  time: string;
  hourlyMinutes: number;
  waitingMinutes: number;
  promotionId: string;
  referralPartnerId: string;
  customerName: string;
  customerEmail: string;
};

const input =
  "w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#E6CE20]/50 focus:outline-none";
const smallInput =
  "w-full rounded-lg border border-white/10 bg-black px-2.5 py-2 text-xs text-white placeholder:text-white/25 focus:border-[#E6CE20]/50 focus:outline-none";

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const dollars = (cents: number) => String((cents / 100).toFixed(2));
const toCents = (value: string) => Math.max(0, Math.round((Number(value) || 0) * 100));
const localToIso = (value: string) => (value ? new Date(value).toISOString() : null);
const isoToLocal = (value: string | null) => (value ? value.slice(0, 16) : "");
const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);
const emptyLocation = (): LocationDraft => ({ address: "", placeId: null });
const defaultPricingProfileDraft = (): PricingSettings => ({
  ...DEFAULT_PRICING_SETTINGS,
  lateNight: { ...DEFAULT_PRICING_SETTINGS.lateNight },
  hourly: { ...DEFAULT_PRICING_SETTINGS.hourly },
  positioning: { ...DEFAULT_PRICING_SETTINGS.positioning },
});

function initialQuote(profileId = ""): QuoteDraft {
  return {
    profileId,
    bookingId: "",
    serviceType: "one_way",
    pickup: emptyLocation(),
    destination: emptyLocation(),
    stops: [],
    date: today(),
    time: nowTime(),
    hourlyMinutes: 120,
    waitingMinutes: 0,
    promotionId: "",
    referralPartnerId: "",
    customerName: "",
    customerEmail: "",
  };
}

function serviceAt(draft: QuoteDraft) {
  return new Date(`${draft.date}T${draft.time}:00`).toISOString();
}

function placeSelection(setter: (location: LocationDraft) => void) {
  return (selection: PlacesAutocompleteSelection) =>
    setter({ address: selection.address, placeId: selection.placeId });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {hint && <p className="mt-1 text-xs leading-relaxed text-white/45">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PricingPanel({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profileDraft, setProfileDraft] = useState<{
    id?: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
    settings: PricingSettings;
  }>({ name: "Standard", isActive: true, isDefault: true, settings: defaultPricingProfileDraft() });
  const [zoneDraft, setZoneDraft] = useState({
    id: "",
    name: "",
    kind: "included" as "included" | "special",
    location: emptyLocation(),
    radiusMiles: "5",
    adjustment: "0",
    isActive: true,
  });
  const [flatDraft, setFlatDraft] = useState({
    id: "",
    profileId: "",
    originZoneId: "",
    destinationZoneId: "",
    price: "",
    includedStops: "0",
    isBidirectional: true,
    isActive: true,
  });
  const [promoDraft, setPromoDraft] = useState({
    id: "",
    code: "",
    name: "",
    type: "percent" as "fixed" | "percent",
    value: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  });
  const [referralDraft, setReferralDraft] = useState({
    id: "",
    name: "",
    referralType: "hotel",
    passengerDiscountType: "fixed" as "fixed" | "percent",
    passengerDiscountValue: "",
    commissionType: "fixed" as "fixed" | "percent",
    commissionValue: "",
    isActive: true,
  });
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft>(initialQuote());
  const [preview, setPreview] = useState<{
    calculation: PricingCalculation;
    route: PricingRouteSnapshot;
    customer: { name: string | null; email: string | null };
    bookingId: string | null;
  } | null>(null);
  const [finalCents, setFinalCents] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await getPricingAdminData({ data: { adminKey } })) as unknown as PricingData;
      setData(result);
      setQuoteDraft((current) => ({
        ...current,
        profileId:
          current.profileId ||
          result.profiles.find((profile) => profile.is_default)?.id ||
          result.profiles[0]?.id ||
          "",
      }));
      setFlatDraft((current) => ({
        ...current,
        profileId:
          current.profileId ||
          result.profiles.find((profile) => profile.is_default)?.id ||
          result.profiles[0]?.id ||
          "",
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Pricing.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => void load(), [load]);

  const selectedBooking = useMemo(
    () => data?.bookings.find((booking) => booking.id === quoteDraft.bookingId) || null,
    [data?.bookings, quoteDraft.bookingId],
  );

  const run = async (action: () => Promise<void>, success?: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (success) setNotice(success);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Pricing action failed.");
    } finally {
      setBusy(false);
    }
  };

  const editProfile = (profile: Profile) =>
    setProfileDraft({
      id: profile.id,
      name: profile.name,
      isActive: profile.is_active,
      isDefault: profile.is_default,
      settings: profile.settings,
    });
  const editZone = (zone: Zone) =>
    setZoneDraft({
      id: zone.id,
      name: zone.name,
      kind: zone.kind,
      location: { address: zone.address, placeId: zone.place_id },
      radiusMiles: String((zone.radius_meters / 1609.344).toFixed(2)),
      adjustment: dollars(zone.adjustment_cents),
      isActive: zone.is_active,
    });
  const editFlat = (rate: FlatRate) =>
    setFlatDraft({
      id: rate.id,
      profileId: rate.pricing_profile_id,
      originZoneId: rate.origin_zone_id,
      destinationZoneId: rate.destination_zone_id,
      price: dollars(rate.price_cents),
      includedStops: String(rate.included_stops),
      isBidirectional: rate.is_bidirectional,
      isActive: rate.is_active,
    });
  const editPromo = (promo: Promotion) =>
    setPromoDraft({
      id: promo.id,
      code: promo.code,
      name: promo.name,
      type: promo.discount_type,
      value:
        promo.discount_type === "fixed"
          ? dollars(promo.discount_value)
          : String(promo.discount_value),
      startsAt: isoToLocal(promo.starts_at),
      endsAt: isoToLocal(promo.ends_at),
      isActive: promo.is_active,
    });
  const editReferral = (referral: Referral) =>
    setReferralDraft({
      id: referral.id,
      name: referral.name,
      referralType: referral.referral_type,
      passengerDiscountType: referral.passenger_discount_type || "fixed",
      passengerDiscountValue:
        referral.passenger_discount_value == null
          ? ""
          : referral.passenger_discount_type === "fixed"
            ? dollars(referral.passenger_discount_value)
            : String(referral.passenger_discount_value),
      commissionType: referral.commission_type,
      commissionValue:
        referral.commission_type === "fixed"
          ? dollars(referral.commission_value)
          : String(referral.commission_value),
      isActive: referral.is_active,
    });

  const calculate = () =>
    run(async () => {
      if (!quoteDraft.profileId) throw new Error("Create and select a pricing profile first.");
      const result = await previewPricingQuote({
        data: {
          adminKey,
          pricingProfileId: quoteDraft.profileId,
          serviceType: quoteDraft.serviceType,
          pickup: quoteDraft.pickup,
          destination: quoteDraft.destination,
          stops: quoteDraft.stops.filter((stop) => stop.address.trim()),
          serviceAt: serviceAt(quoteDraft),
          hourlyMinutes: quoteDraft.serviceType === "hourly" ? quoteDraft.hourlyMinutes : null,
          waitingMinutes: quoteDraft.waitingMinutes,
          promotionId: quoteDraft.promotionId || null,
          referralPartnerId: quoteDraft.referralPartnerId || null,
          bookingId: quoteDraft.bookingId || null,
          customerName: quoteDraft.customerName || null,
          customerEmail: quoteDraft.customerEmail || null,
        },
      });
      setPreview(result);
      setFinalCents(result.calculation.suggestedCents[1] ?? result.calculation.recommendedCents);
    });

  const saveQuote = (sendBookingQuote: boolean) =>
    run(async () => {
      if (!preview) throw new Error("Calculate the quote before saving it.");
      await savePricingQuote({
        data: {
          adminKey,
          pricingProfileId: quoteDraft.profileId,
          serviceType: quoteDraft.serviceType,
          pickup: quoteDraft.pickup,
          destination: quoteDraft.destination,
          stops: quoteDraft.stops.filter((stop) => stop.address.trim()),
          serviceAt: serviceAt(quoteDraft),
          hourlyMinutes: quoteDraft.serviceType === "hourly" ? quoteDraft.hourlyMinutes : null,
          waitingMinutes: quoteDraft.waitingMinutes,
          promotionId: quoteDraft.promotionId || null,
          referralPartnerId: quoteDraft.referralPartnerId || null,
          bookingId: quoteDraft.bookingId || null,
          customerName: quoteDraft.customerName || null,
          customerEmail: quoteDraft.customerEmail || null,
          finalCents,
          sendBookingQuote,
        },
      });
      await load();
      setPreview(null);
      setNotice(
        sendBookingQuote
          ? "Quote sent to the booking and promotion use recorded."
          : "Quote saved as a draft.",
      );
    });

  if (loading && !data) return <p className="text-sm text-white/50">Loading Pricing Engine…</p>;
  if (!data) return <p className="text-sm text-red-300">{error || "Pricing is unavailable."}</p>;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#E6CE20]/75">
            Streex Pricing Engine
          </p>
          <h2 className="mt-1 text-xl font-bold">Rate Calculator</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/50">
            Flat rates by zone are checked first. Dynamic and hourly quotes then apply the selected
            profile, positioning, discounts and referral rules. Customer-facing quotes remain
            simple; this view keeps the audit trail.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || busy}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-[#E6CE20]/30 bg-[#E6CE20]/[0.06] px-3 py-2 text-xs text-[#E6CE20]">
          {notice}
        </p>
      )}

      {!data.profiles.length && (
        <p className="rounded-xl border border-[#E6CE20]/30 bg-[#E6CE20]/[0.06] px-3 py-3 text-xs text-[#E6CE20]">
          Start by saving a profile with a Base of Operations. Nothing is priced until you configure
          your own numbers.
        </p>
      )}

      <Section
        title="1. Calculate a quote"
        hint="Choose a saved profile, then calculate. A linked pending booking supplies its customer, pickup, destination and schedule."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Pricing profile">
            <select
              className={input}
              value={quoteDraft.profileId}
              onChange={(event) => setQuoteDraft({ ...quoteDraft, profileId: event.target.value })}
            >
              <option value="">Select profile</option>
              {data.profiles
                .filter((profile) => profile.is_active)
                .map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                    {profile.is_default ? " · Default" : ""}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Existing booking (optional)">
            <select
              className={input}
              value={quoteDraft.bookingId}
              onChange={(event) => {
                const booking = data.bookings.find((item) => item.id === event.target.value);
                setQuoteDraft({
                  ...quoteDraft,
                  bookingId: event.target.value,
                  customerName: booking?.name || quoteDraft.customerName,
                  serviceType:
                    booking?.service_type === "hourly" ? "hourly" : quoteDraft.serviceType,
                  hourlyMinutes: booking?.estimated_duration_minutes || quoteDraft.hourlyMinutes,
                });
                setPreview(null);
              }}
            >
              <option value="">Manual quote</option>
              {data.bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.name} · {booking.pickup} → {booking.destination}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service">
            <select
              className={input}
              value={quoteDraft.serviceType}
              disabled={Boolean(selectedBooking)}
              onChange={(event) =>
                setQuoteDraft({
                  ...quoteDraft,
                  serviceType: event.target.value as PricingServiceType,
                })
              }
            >
              <option value="one_way">One Way</option>
              <option value="airport_transfer">Airport Transfer</option>
              <option value="multi_stop">Multiple Stops</option>
              <option value="long_distance">Long Distance</option>
              <option value="hourly">Hourly / As Directed</option>
            </select>
          </Field>
          <Field label="Service date and time">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={input}
                type="date"
                value={quoteDraft.date}
                disabled={Boolean(selectedBooking)}
                onChange={(event) => setQuoteDraft({ ...quoteDraft, date: event.target.value })}
              />
              <input
                className={input}
                type="time"
                value={quoteDraft.time}
                disabled={Boolean(selectedBooking)}
                onChange={(event) => setQuoteDraft({ ...quoteDraft, time: event.target.value })}
              />
            </div>
          </Field>
          <Field label="Pickup">
            <PlacesAutocompleteInput
              value={selectedBooking?.pickup || quoteDraft.pickup.address}
              onChange={(address) =>
                setQuoteDraft({ ...quoteDraft, pickup: { address, placeId: null } })
              }
              onPlaceSelected={placeSelection((pickup) =>
                setQuoteDraft((current) => ({ ...current, pickup })),
              )}
              required
              className={input}
              placeholder="Pickup address"
            />
          </Field>
          <Field label="Destination">
            <PlacesAutocompleteInput
              value={selectedBooking?.destination || quoteDraft.destination.address}
              onChange={(address) =>
                setQuoteDraft({ ...quoteDraft, destination: { address, placeId: null } })
              }
              onPlaceSelected={placeSelection((destination) =>
                setQuoteDraft((current) => ({ ...current, destination })),
              )}
              required
              className={input}
              placeholder="Destination address"
            />
          </Field>
          {quoteDraft.serviceType === "hourly" && (
            <Field label="Requested service minutes">
              <input
                className={input}
                min={15}
                step={15}
                type="number"
                value={quoteDraft.hourlyMinutes}
                onChange={(event) =>
                  setQuoteDraft({ ...quoteDraft, hourlyMinutes: Number(event.target.value) })
                }
              />
            </Field>
          )}
          <Field label="Planned waiting minutes">
            <input
              className={input}
              min={0}
              type="number"
              value={quoteDraft.waitingMinutes}
              onChange={(event) =>
                setQuoteDraft({ ...quoteDraft, waitingMinutes: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Promotion">
            <select
              className={input}
              value={quoteDraft.promotionId}
              onChange={(event) =>
                setQuoteDraft({ ...quoteDraft, promotionId: event.target.value })
              }
            >
              <option value="">No promotion</option>
              {data.promotions
                .filter((promo) => promo.is_active)
                .map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.code} · {promo.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Referral partner">
            <select
              className={input}
              value={quoteDraft.referralPartnerId}
              onChange={(event) =>
                setQuoteDraft({ ...quoteDraft, referralPartnerId: event.target.value })
              }
            >
              <option value="">No referral</option>
              {data.referrals
                .filter((referral) => referral.is_active)
                .map((referral) => (
                  <option key={referral.id} value={referral.id}>
                    {referral.name}
                  </option>
                ))}
            </select>
          </Field>
          {!selectedBooking && (
            <>
              <Field label="Customer name (optional)">
                <input
                  className={input}
                  value={quoteDraft.customerName}
                  onChange={(event) =>
                    setQuoteDraft({ ...quoteDraft, customerName: event.target.value })
                  }
                />
              </Field>
              <Field label="Customer email (optional)">
                <input
                  className={input}
                  type="email"
                  value={quoteDraft.customerEmail}
                  onChange={(event) =>
                    setQuoteDraft({ ...quoteDraft, customerEmail: event.target.value })
                  }
                />
              </Field>
            </>
          )}
        </div>
        {!selectedBooking && (
          <div className="mt-3 space-y-2">
            {quoteDraft.stops.map((stop, index) => (
              <div key={index} className="flex gap-2">
                <PlacesAutocompleteInput
                  value={stop.address}
                  onChange={(address) =>
                    setQuoteDraft((current) => ({
                      ...current,
                      stops: current.stops.map((item, itemIndex) =>
                        itemIndex === index ? { address, placeId: null } : item,
                      ),
                    }))
                  }
                  onPlaceSelected={placeSelection((location) =>
                    setQuoteDraft((current) => ({
                      ...current,
                      stops: current.stops.map((item, itemIndex) =>
                        itemIndex === index ? location : item,
                      ),
                    })),
                  )}
                  className={input}
                  placeholder={`Stop ${index + 1}`}
                />
                <button
                  type="button"
                  className="text-xs text-red-200"
                  onClick={() =>
                    setQuoteDraft((current) => ({
                      ...current,
                      stops: current.stops.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-[#E6CE20]"
              onClick={() =>
                setQuoteDraft((current) => ({
                  ...current,
                  stops: [...current.stops, emptyLocation()],
                  serviceType: "multi_stop",
                }))
              }
            >
              + Add stop
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void calculate()}
          className="mt-4 rounded-xl bg-[#E6CE20] px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {busy ? "Calculating…" : "Calculate recommended rate"}
        </button>
      </Section>

      {preview && (
        <Section
          title="2. Recommendation and final quote"
          hint={
            preview.route.trafficUsed
              ? "Traffic-aware time was used for the scheduled future departure."
              : "Google’s standard route duration was used; live traffic is available only for future departures."
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Recommended" value={usd(preview.calculation.recommendedCents)} />
            <Stat label="Customer discount" value={`−${usd(preview.calculation.discountCents)}`} />
            <Stat
              label="Referral commission"
              value={
                preview.calculation.referralCommissionCents
                  ? usd(preview.calculation.referralCommissionCents)
                  : "—"
              }
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Passenger miles" value={`${preview.calculation.passengerMiles} mi`} />
            <Stat label="Drive time" value={`${preview.calculation.passengerMinutes} min`} />
            <Stat
              label="Internal positioning"
              value={`${preview.calculation.positioningMiles} mi`}
            />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
              Internal calculation
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {preview.calculation.lineItems.map((item) => (
                <li key={item.key} className="flex justify-between gap-3">
                  <span className="text-white/60">{item.label}</span>
                  <span className={item.amountCents < 0 ? "text-emerald-300" : "text-white"}>
                    {item.amountCents < 0 ? "−" : ""}
                    {usd(Math.abs(item.amountCents))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Field label="Final customer quote">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                <input
                  className={`${input} w-36 pl-7`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={dollars(finalCents)}
                  onChange={(event) => setFinalCents(toCents(event.target.value))}
                />
              </div>
            </Field>
            {preview.calculation.suggestedCents.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFinalCents(amount)}
                className={`rounded-lg border px-3 py-2 text-xs ${finalCents === amount ? "border-[#E6CE20] bg-[#E6CE20] text-black" : "border-white/15 text-white/70"}`}
              >
                {usd(amount)}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveQuote(false)}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Save internal quote
            </button>
            {preview.bookingId && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveQuote(true)}
                className="rounded-xl bg-[#E6CE20] px-4 py-2 text-xs font-semibold text-black disabled:opacity-60"
              >
                Send quote to booking
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                navigator.clipboard
                  ?.writeText(
                    `Your STREEX private ride from ${selectedBooking?.pickup || quoteDraft.pickup.address} to ${selectedBooking?.destination || quoteDraft.destination.address} is ${usd(finalCents)} total. Your rate is fixed and confirmed upfront.`,
                  )
                  .then(() => setNotice("Customer-facing quote copied."))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs text-white/70"
            >
              <Copy className="h-3.5 w-3.5" /> Copy customer message
            </button>
          </div>
        </Section>
      )}

      <details className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold text-white">
          Pricing setup and rules
        </summary>
        <p className="mt-2 text-xs text-white/45">
          These records are workspace-specific. Changes apply only to future calculations; saved
          quote snapshots never change.
        </p>
        <div className="mt-5 space-y-5">
          <Section
            title="Profiles and rate settings"
            hint="Use dollars in the fields below. The engine stores and calculates in cents."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Profile name">
                <input
                  className={input}
                  value={profileDraft.name}
                  onChange={(event) =>
                    setProfileDraft({ ...profileDraft, name: event.target.value })
                  }
                />
              </Field>
              <Field label="Base of Operations">
                <PlacesAutocompleteInput
                  value={profileDraft.settings.baseOfOperations?.address || ""}
                  onChange={(address) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        baseOfOperations: { address, placeId: null },
                      },
                    }))
                  }
                  onPlaceSelected={placeSelection((baseOfOperations) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: { ...current.settings, baseOfOperations },
                    })),
                  )}
                  className={input}
                  placeholder="Base address"
                />
              </Field>
              {[
                ["Minimum fare", "minimumFareCents"],
                ["Base rate", "baseRateCents"],
                ["Per mile", "ratePerMileCents"],
                ["Per minute", "ratePerMinuteCents"],
                ["Waiting / minute", "waitingRatePerMinuteCents"],
                ["Additional stop", "additionalStopCents"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      $
                    </span>
                    <input
                      className={`${input} pl-7`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={dollars(profileDraft.settings[key as keyof PricingSettings] as number)}
                      onChange={(event) =>
                        setProfileDraft((current) => ({
                          ...current,
                          settings: { ...current.settings, [key]: toCents(event.target.value) },
                        }))
                      }
                    />
                  </div>
                </Field>
              ))}
            </div>
            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
              <Field label="Hourly rate">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input
                    className={`${input} pl-7`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={dollars(profileDraft.settings.hourly.rateCents)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          hourly: {
                            ...current.settings.hourly,
                            rateCents: toCents(event.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </Field>
              <Field label="Hourly minimum (min)">
                <input
                  className={input}
                  type="number"
                  min={15}
                  step={15}
                  value={profileDraft.settings.hourly.minimumMinutes}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        hourly: {
                          ...current.settings.hourly,
                          minimumMinutes: Number(event.target.value),
                        },
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Hourly increment (min)">
                <input
                  className={input}
                  type="number"
                  min={5}
                  step={5}
                  value={profileDraft.settings.hourly.incrementMinutes}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        hourly: {
                          ...current.settings.hourly,
                          incrementMinutes: Number(event.target.value),
                        },
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Free positioning miles">
                <input
                  className={input}
                  type="number"
                  min={0}
                  step="0.1"
                  value={profileDraft.settings.positioning.freePositioningMiles}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        positioning: {
                          ...current.settings.positioning,
                          freePositioningMiles: Number(event.target.value),
                        },
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Positioning / mile">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input
                    className={`${input} pl-7`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={dollars(profileDraft.settings.positioning.ratePerMileCents)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          positioning: {
                            ...current.settings.positioning,
                            ratePerMileCents: toCents(event.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </Field>
              <Field label="Quote rounding">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input
                    className={`${input} pl-7`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={dollars(profileDraft.settings.roundingIncrementCents)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          roundingIncrementCents: Math.max(1, toCents(event.target.value)),
                        },
                      }))
                    }
                  />
                </div>
              </Field>
            </div>
            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
              <Field label="Timezone">
                <input
                  className={input}
                  value={profileDraft.settings.timezone}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: { ...current.settings, timezone: event.target.value },
                    }))
                  }
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={profileDraft.settings.lateNight.enabled}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        lateNight: { ...current.settings.lateNight, enabled: event.target.checked },
                      },
                    }))
                  }
                />
                Late-night active
              </label>
              <Field label="Late-night starts / ends">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={input}
                    type="time"
                    value={profileDraft.settings.lateNight.startsAt}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          lateNight: {
                            ...current.settings.lateNight,
                            startsAt: event.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <input
                    className={input}
                    type="time"
                    value={profileDraft.settings.lateNight.endsAt}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          lateNight: { ...current.settings.lateNight, endsAt: event.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </Field>
              <Field label="Late-night surcharge">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input
                    className={`${input} pl-7`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={dollars(profileDraft.settings.lateNight.surchargeCents)}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          lateNight: {
                            ...current.settings.lateNight,
                            surchargeCents: toCents(event.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-white/65">
              <input
                type="checkbox"
                checked={profileDraft.settings.positioning.includeReturnToBase}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      positioning: {
                        ...current.settings.positioning,
                        includeReturnToBase: event.target.checked,
                      },
                    },
                  }))
                }
              />{" "}
              Include return-to-base positioning outside an included zone
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={profileDraft.isDefault}
                  onChange={(event) =>
                    setProfileDraft({ ...profileDraft, isDefault: event.target.checked })
                  }
                />{" "}
                Default profile
              </label>
              <label className="flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={profileDraft.isActive}
                  onChange={(event) =>
                    setProfileDraft({ ...profileDraft, isActive: event.target.checked })
                  }
                />{" "}
                Active
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await savePricingProfile({
                      data: {
                        adminKey,
                        id: profileDraft.id || undefined,
                        name: profileDraft.name,
                        isActive: profileDraft.isActive,
                        isDefault: profileDraft.isDefault,
                        settings: profileDraft.settings,
                      },
                    });
                    await load();
                    setProfileDraft({
                      name: "Standard",
                      isActive: true,
                      isDefault: false,
                      settings: defaultPricingProfileDraft(),
                    });
                  }, "Profile saved.")
                }
                className="ml-auto rounded-lg bg-[#E6CE20] px-3 py-2 text-xs font-semibold text-black disabled:opacity-60"
              >
                Save profile
              </button>
            </div>
            <RecordList
              items={data.profiles}
              render={(profile) => (
                <button type="button" onClick={() => editProfile(profile)} className="text-left">
                  <span>{profile.name}</span>
                  <small>
                    {profile.is_default ? "Default" : ""}{" "}
                    {profile.is_active ? "Active" : "Inactive"}
                  </small>
                </button>
              )}
            />
          </Section>

          <Section
            title="Service zones"
            hint="Included zones make positioning free. Special zones add their configured adjustment internally."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Zone name">
                <input
                  className={input}
                  value={zoneDraft.name}
                  onChange={(event) => setZoneDraft({ ...zoneDraft, name: event.target.value })}
                />
              </Field>
              <Field label="Type">
                <select
                  className={input}
                  value={zoneDraft.kind}
                  onChange={(event) =>
                    setZoneDraft({
                      ...zoneDraft,
                      kind: event.target.value as "included" | "special",
                    })
                  }
                >
                  <option value="included">Included service zone</option>
                  <option value="special">Special area</option>
                </select>
              </Field>
              <Field label="Zone center">
                <PlacesAutocompleteInput
                  value={zoneDraft.location.address}
                  onChange={(address) =>
                    setZoneDraft({ ...zoneDraft, location: { address, placeId: null } })
                  }
                  onPlaceSelected={placeSelection((location) =>
                    setZoneDraft((current) => ({ ...current, location })),
                  )}
                  className={input}
                  placeholder="Airport, hotel, or area center"
                />
              </Field>
              <Field label="Radius (miles)">
                <input
                  className={input}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={zoneDraft.radiusMiles}
                  onChange={(event) =>
                    setZoneDraft({ ...zoneDraft, radiusMiles: event.target.value })
                  }
                />
              </Field>
              {zoneDraft.kind === "special" && (
                <Field label="Special adjustment">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      $
                    </span>
                    <input
                      className={`${input} pl-7`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={zoneDraft.adjustment}
                      onChange={(event) =>
                        setZoneDraft({ ...zoneDraft, adjustment: event.target.value })
                      }
                    />
                  </div>
                </Field>
              )}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-white/65">
              <input
                type="checkbox"
                checked={zoneDraft.isActive}
                onChange={(event) => setZoneDraft({ ...zoneDraft, isActive: event.target.checked })}
              />
              Zone active
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await savePricingZone({
                    data: {
                      adminKey,
                      id: zoneDraft.id || undefined,
                      name: zoneDraft.name,
                      kind: zoneDraft.kind,
                      location: zoneDraft.location,
                      radiusMeters: Math.round(Number(zoneDraft.radiusMiles) * 1609.344),
                      adjustmentCents: toCents(zoneDraft.adjustment),
                      isActive: zoneDraft.isActive,
                    },
                  });
                  await load();
                  setZoneDraft({
                    id: "",
                    name: "",
                    kind: "included",
                    location: emptyLocation(),
                    radiusMiles: "5",
                    adjustment: "0",
                    isActive: true,
                  });
                }, "Zone saved.")
              }
              className="mt-4 rounded-lg bg-[#E6CE20] px-3 py-2 text-xs font-semibold text-black disabled:opacity-60"
            >
              Save zone
            </button>
            <RecordList
              items={data.zones}
              render={(zone) => (
                <button type="button" onClick={() => editZone(zone)} className="text-left">
                  <span>
                    {zone.name} · {zone.kind}
                  </span>
                  <small>
                    {(zone.radius_meters / 1609.344).toFixed(1)} mi{" "}
                    {zone.adjustment_cents ? `· ${usd(zone.adjustment_cents)}` : ""}
                  </small>
                </button>
              )}
            />
          </Section>

          <Section
            title="Flat rates"
            hint="A matching active route zone pair takes priority over dynamic pricing."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Profile">
                <select
                  className={input}
                  value={flatDraft.profileId}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, profileId: event.target.value })
                  }
                >
                  <option value="">Select profile</option>
                  {data.profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rate">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input
                    className={`${input} pl-7`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={flatDraft.price}
                    onChange={(event) => setFlatDraft({ ...flatDraft, price: event.target.value })}
                  />
                </div>
              </Field>
              <Field label="Origin zone">
                <select
                  className={input}
                  value={flatDraft.originZoneId}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, originZoneId: event.target.value })
                  }
                >
                  <option value="">Select zone</option>
                  {data.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Destination zone">
                <select
                  className={input}
                  value={flatDraft.destinationZoneId}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, destinationZoneId: event.target.value })
                  }
                >
                  <option value="">Select zone</option>
                  {data.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Included stops">
                <input
                  className={input}
                  type="number"
                  min="0"
                  value={flatDraft.includedStops}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, includedStops: event.target.value })
                  }
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={flatDraft.isBidirectional}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, isBidirectional: event.target.checked })
                  }
                />{" "}
                Apply both directions
              </label>
              <label className="flex items-end gap-2 pb-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={flatDraft.isActive}
                  onChange={(event) =>
                    setFlatDraft({ ...flatDraft, isActive: event.target.checked })
                  }
                />
                Flat rate active
              </label>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await savePricingFlatRate({
                    data: {
                      adminKey,
                      id: flatDraft.id || undefined,
                      pricingProfileId: flatDraft.profileId,
                      originZoneId: flatDraft.originZoneId,
                      destinationZoneId: flatDraft.destinationZoneId,
                      priceCents: toCents(flatDraft.price),
                      includedStops: Number(flatDraft.includedStops),
                      isBidirectional: flatDraft.isBidirectional,
                      isActive: flatDraft.isActive,
                      startsAt: null,
                      endsAt: null,
                    },
                  });
                  await load();
                  setFlatDraft((current) => ({
                    ...current,
                    id: "",
                    originZoneId: "",
                    destinationZoneId: "",
                    price: "",
                    includedStops: "0",
                  }));
                }, "Flat rate saved.")
              }
              className="mt-4 rounded-lg bg-[#E6CE20] px-3 py-2 text-xs font-semibold text-black disabled:opacity-60"
            >
              Save flat rate
            </button>
            <RecordList
              items={data.flatRates}
              render={(rate) => (
                <button type="button" onClick={() => editFlat(rate)} className="text-left">
                  <span>
                    {data.zones.find((zone) => zone.id === rate.origin_zone_id)?.name || "Zone"} ↔{" "}
                    {data.zones.find((zone) => zone.id === rate.destination_zone_id)?.name ||
                      "Zone"}
                  </span>
                  <small>
                    {usd(rate.price_cents)} ·{" "}
                    {data.profiles.find((profile) => profile.id === rate.pricing_profile_id)?.name}
                  </small>
                </button>
              )}
            />
          </Section>

          <Section
            title="Promotions and referrals"
            hint="A promotion is recorded only when a linked booking quote is sent. Referral commission becomes payable only after the ride is completed."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-white">Promotion</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Code">
                    <input
                      className={smallInput}
                      value={promoDraft.code}
                      onChange={(event) =>
                        setPromoDraft({ ...promoDraft, code: event.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                  <Field label="Name">
                    <input
                      className={smallInput}
                      value={promoDraft.name}
                      onChange={(event) =>
                        setPromoDraft({ ...promoDraft, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Discount type">
                    <select
                      className={smallInput}
                      value={promoDraft.type}
                      onChange={(event) =>
                        setPromoDraft({
                          ...promoDraft,
                          type: event.target.value as "fixed" | "percent",
                        })
                      }
                    >
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                  </Field>
                  <Field label={promoDraft.type === "fixed" ? "Discount $" : "Discount %"}>
                    <input
                      className={smallInput}
                      type="number"
                      min="0"
                      value={promoDraft.value}
                      onChange={(event) =>
                        setPromoDraft({ ...promoDraft, value: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Starts (optional)">
                    <input
                      className={smallInput}
                      type="datetime-local"
                      value={promoDraft.startsAt}
                      onChange={(event) =>
                        setPromoDraft({ ...promoDraft, startsAt: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Expires (optional)">
                    <input
                      className={smallInput}
                      type="datetime-local"
                      value={promoDraft.endsAt}
                      onChange={(event) =>
                        setPromoDraft({ ...promoDraft, endsAt: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs text-white/65">
                  <input
                    type="checkbox"
                    checked={promoDraft.isActive}
                    onChange={(event) =>
                      setPromoDraft({ ...promoDraft, isActive: event.target.checked })
                    }
                  />
                  Promotion active
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await savePricingPromotion({
                        data: {
                          adminKey,
                          id: promoDraft.id || undefined,
                          code: promoDraft.code,
                          name: promoDraft.name,
                          discountType: promoDraft.type,
                          discountValue:
                            promoDraft.type === "fixed"
                              ? toCents(promoDraft.value)
                              : Number(promoDraft.value),
                          startsAt: localToIso(promoDraft.startsAt),
                          endsAt: localToIso(promoDraft.endsAt),
                          isActive: promoDraft.isActive,
                        },
                      });
                      await load();
                      setPromoDraft({
                        id: "",
                        code: "",
                        name: "",
                        type: "percent",
                        value: "",
                        startsAt: "",
                        endsAt: "",
                        isActive: true,
                      });
                    }, "Promotion saved.")
                  }
                  className="rounded-lg border border-[#E6CE20]/60 px-3 py-2 text-xs font-semibold text-[#E6CE20] disabled:opacity-60"
                >
                  Save promotion
                </button>
                <RecordList
                  items={data.promotions}
                  render={(promo) => (
                    <button type="button" onClick={() => editPromo(promo)} className="text-left">
                      <span>
                        {promo.code} · {promo.name}
                      </span>
                      <small>
                        {promo.discount_type === "fixed"
                          ? usd(promo.discount_value)
                          : `${promo.discount_value}%`}{" "}
                        {promo.is_active ? "" : "· Inactive"}
                      </small>
                    </button>
                  )}
                />
              </div>
              <div className="space-y-3 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-xs font-semibold text-white">Referral partner</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Partner">
                    <input
                      className={smallInput}
                      value={referralDraft.name}
                      onChange={(event) =>
                        setReferralDraft({ ...referralDraft, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Type">
                    <input
                      className={smallInput}
                      value={referralDraft.referralType}
                      onChange={(event) =>
                        setReferralDraft({ ...referralDraft, referralType: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Passenger discount">
                    <select
                      className={smallInput}
                      value={referralDraft.passengerDiscountType}
                      onChange={(event) =>
                        setReferralDraft({
                          ...referralDraft,
                          passengerDiscountType: event.target.value as "fixed" | "percent",
                        })
                      }
                    >
                      <option value="fixed">Fixed $</option>
                      <option value="percent">Percent</option>
                    </select>
                  </Field>
                  <Field label="Passenger value (blank none)">
                    <input
                      className={smallInput}
                      type="number"
                      min="0"
                      value={referralDraft.passengerDiscountValue}
                      onChange={(event) =>
                        setReferralDraft({
                          ...referralDraft,
                          passengerDiscountValue: event.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Commission">
                    <select
                      className={smallInput}
                      value={referralDraft.commissionType}
                      onChange={(event) =>
                        setReferralDraft({
                          ...referralDraft,
                          commissionType: event.target.value as "fixed" | "percent",
                        })
                      }
                    >
                      <option value="fixed">Fixed $</option>
                      <option value="percent">Percent</option>
                    </select>
                  </Field>
                  <Field label="Commission value">
                    <input
                      className={smallInput}
                      type="number"
                      min="0"
                      value={referralDraft.commissionValue}
                      onChange={(event) =>
                        setReferralDraft({ ...referralDraft, commissionValue: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs text-white/65">
                  <input
                    type="checkbox"
                    checked={referralDraft.isActive}
                    onChange={(event) =>
                      setReferralDraft({ ...referralDraft, isActive: event.target.checked })
                    }
                  />
                  Referral active
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const passengerValue = referralDraft.passengerDiscountValue
                        ? referralDraft.passengerDiscountType === "fixed"
                          ? toCents(referralDraft.passengerDiscountValue)
                          : Number(referralDraft.passengerDiscountValue)
                        : null;
                      await saveReferralPartner({
                        data: {
                          adminKey,
                          id: referralDraft.id || undefined,
                          name: referralDraft.name,
                          referralType: referralDraft.referralType,
                          passengerDiscountType: passengerValue
                            ? referralDraft.passengerDiscountType
                            : null,
                          passengerDiscountValue: passengerValue,
                          commissionType: referralDraft.commissionType,
                          commissionValue:
                            referralDraft.commissionType === "fixed"
                              ? toCents(referralDraft.commissionValue)
                              : Number(referralDraft.commissionValue),
                          isActive: referralDraft.isActive,
                        },
                      });
                      await load();
                      setReferralDraft({
                        id: "",
                        name: "",
                        referralType: "hotel",
                        passengerDiscountType: "fixed",
                        passengerDiscountValue: "",
                        commissionType: "fixed",
                        commissionValue: "",
                        isActive: true,
                      });
                    }, "Referral partner saved.")
                  }
                  className="rounded-lg border border-[#E6CE20]/60 px-3 py-2 text-xs font-semibold text-[#E6CE20] disabled:opacity-60"
                >
                  Save referral
                </button>
                <RecordList
                  items={data.referrals}
                  render={(referral) => (
                    <button
                      type="button"
                      onClick={() => editReferral(referral)}
                      className="text-left"
                    >
                      <span>{referral.name}</span>
                      <small>
                        {referral.commission_type === "fixed"
                          ? usd(referral.commission_value)
                          : `${referral.commission_value}%`}{" "}
                        commission {referral.is_active ? "" : "· Inactive"}
                      </small>
                    </button>
                  )}
                />
              </div>
            </div>
          </Section>
        </div>
      </details>

      <Section title="Recent pricing quotes">
        <RecordList
          items={data.quotes}
          render={(quote) => (
            <div>
              <span>
                {quote.customer_name || "Internal quote"} · {quote.pickup} → {quote.destination}
              </span>
              <small>
                {usd(quote.final_cents ?? quote.recommended_cents)} · {quote.status} · commission{" "}
                {quote.commission_status}
              </small>
            </div>
          )}
        />
      </Section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function RecordList<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  if (!items.length) return <p className="mt-4 text-xs text-white/40">No saved records yet.</p>;
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/80 [&_small]:mt-0.5 [&_small]:block [&_small]:text-[10px] [&_small]:text-white/45"
        >
          {render(item)}
        </div>
      ))}
    </div>
  );
}
