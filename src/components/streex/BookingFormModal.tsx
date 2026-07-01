import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ChevronDown, Minus, Plus } from "lucide-react";
import { createBooking } from "@/lib/booking.functions";
import { getAvailableSlots, type AvailableSlot } from "@/lib/availability.functions";
import { PlacesAutocompleteInput } from "./PlacesAutocompleteInput";
import { trackEvent } from "@/lib/analytics";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  serviceType: "ride" | "hourly";
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  durationHours: number;
  passengers: number;
  notes: string;
};

const EMPTY: FormState = {
  serviceType: "ride",
  name: "",
  phone: "",
  email: "",
  pickup: "",
  destination: "",
  date: "",
  time: "",
  durationHours: 2,
  passengers: 1,
  notes: "",
};

const todayLocalISO = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const COUNTRY_CODES = [
  { label: "🇺🇸 +1 — United States", value: "+1" },
  { label: "🇲🇽 +52 — Mexico", value: "+52" },
  { label: "🇬🇧 +44 — United Kingdom", value: "+44" },
  { label: "🇪🇸 +34 — Spain", value: "+34" },
  { label: "🇦🇷 +54 — Argentina", value: "+54" },
  { label: "🌍 Other", value: "other" },
];

const HOURLY_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

const fieldCls =
  "block w-full box-border rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 backdrop-blur-xl focus:outline-none focus:border-[#E6CE20]/50 transition-colors";

const fieldStyle: React.CSSProperties = {
  padding: "14px 16px",
  width: "100%",
  maxWidth: "100%",
};

const labelCls = "block text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold mb-2";

export function BookingFormModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [customCode, setCustomCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const minRideDate = todayLocalISO();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setError(null);
      setForm(EMPTY);
      setCountryCode("+1");
      setCustomCode("");
      setAvailableSlots([]);
      setSlotsError(null);
      startedRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !form.date) {
      setAvailableSlots([]);
      setSlotsError(null);
      setSlotsLoading(false);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    getAvailableSlots({
      data: {
        date: form.date,
        durationMinutes: form.serviceType === "hourly" ? form.durationHours * 60 : undefined,
      },
    })
      .then((result) => {
        if (cancelled) return;
        setAvailableSlots(result.slots);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setAvailableSlots([]);
        setSlotsError("Available times could not be loaded. Please try another date.");
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.date, form.durationHours, form.serviceType, open]);

  if (!open || typeof document === "undefined") return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawCode = countryCode === "other" ? customCode : countryCode;
    const codeDigits = rawCode.replace(/\D/g, "");
    const numberDigits = form.phone.replace(/\D/g, "");
    const fullPhone = codeDigits && numberDigits ? `+${codeDigits}${numberDigits}` : "";

    const trimmed = {
      serviceType: form.serviceType,
      name: form.name.trim(),
      phone: fullPhone,
      email: form.email.trim(),
      pickup: form.pickup.trim(),
      destination:
        form.serviceType === "hourly"
          ? form.destination.trim() || "Hourly service"
          : form.destination.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
      durationMinutes: form.serviceType === "hourly" ? form.durationHours * 60 : undefined,
      passengers: Number(form.passengers),
      notes: form.notes.trim() || null,
    };

    if (
      !trimmed.name ||
      !trimmed.phone ||
      !codeDigits ||
      !numberDigits ||
      !trimmed.email ||
      !trimmed.pickup ||
      (trimmed.serviceType === "ride" && !trimmed.destination) ||
      !trimmed.date ||
      !trimmed.time
    ) {
      trackEvent("booking_failed", { reason: "missing_required_fields" });
      setError("Please complete all required fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed.email)) {
      trackEvent("booking_failed", { reason: "invalid_email" });
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmed.passengers < 1 || trimmed.passengers > 8) {
      trackEvent("booking_failed", { reason: "invalid_passenger_count" });
      setError("Passengers must be between 1 and 8.");
      return;
    }
    if (trimmed.date < minRideDate) {
      trackEvent("booking_failed", { reason: "invalid_date" });
      setError("Please choose today or a future date.");
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({ data: trimmed });
      trackEvent("booking_submitted", {
        service_type: trimmed.serviceType,
        duration_hours:
          trimmed.serviceType === "hourly" ? form.durationHours : undefined,
        passengers: trimmed.passengers,
      });
      setSubmitted(true);
    } catch (err) {
      trackEvent("booking_failed", { reason: "server_error" });
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const node = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0F0F0F] border border-white/10 shadow-2xl"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(230,206,32,0.08) 0%, transparent 60%)",
          contain: "paint",
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#E6CE20] font-semibold mb-2">
            Schedule Ride
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Request a Ride</h2>
          <p className="text-sm text-white/55 mb-6">
            Tell Juan your details — you&rsquo;ll receive a personal quote shortly.
          </p>

          {submitted ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-14 w-14 rounded-full bg-[#E6CE20]/15 border border-[#E6CE20]/40 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-[#E6CE20]" strokeWidth={2.4} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Request received</h3>
              <p className="text-sm text-white/65 mb-6 max-w-xs">
                Your ride request was received. Juan will review and send you a quote shortly.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-[#E6CE20] text-black font-semibold text-sm px-6 py-3"
              >
                Done
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              onChangeCapture={() => {
                if (startedRef.current) return;
                startedRef.current = true;
                trackEvent("booking_started", { service_type: form.serviceType });
              }}
              className="space-y-4"
            >
              <div>
                <label className={labelCls}>Service Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      key: "ride" as const,
                      label: "Point to Point",
                      sub: "Pickup and destination",
                    },
                    { key: "hourly" as const, label: "Hourly", sub: "Reserve by time" },
                  ].map((option) => {
                    const selected = form.serviceType === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          trackEvent("service_selected", { service_type: option.key });
                          setForm((f) => ({
                            ...f,
                            serviceType: option.key,
                            time: "",
                          }));
                        }}
                        className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                          selected
                            ? "border-[#E6CE20] bg-[#E6CE20]/15"
                            : "border-white/10 bg-white/[0.04] hover:border-white/20"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-white/45">{option.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={fieldCls}
                  style={fieldStyle}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Country Code</label>
                <select
                  className={fieldCls}
                  style={fieldStyle}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#0F0F0F] text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {countryCode === "other" ? (
                <div>
                  <label className={labelCls}>Country Code</label>
                  <input
                    className={fieldCls}
                    style={fieldStyle}
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.slice(0, 4))}
                    placeholder="+__"
                    maxLength={4}
                  />
                </div>
              ) : null}
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  className={fieldCls}
                  style={fieldStyle}
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Your number"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={fieldCls}
                  style={fieldStyle}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Pickup Location</label>
                <PlacesAutocompleteInput
                  className={fieldCls}
                  style={fieldStyle}
                  value={form.pickup}
                  onChange={(v) => set("pickup", v)}
                  placeholder="Address or place"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  {form.serviceType === "hourly" ? "Itinerary / Area (optional)" : "Destination"}
                </label>
                <PlacesAutocompleteInput
                  className={fieldCls}
                  style={fieldStyle}
                  value={form.destination}
                  onChange={(v) => set("destination", v)}
                  placeholder={
                    form.serviceType === "hourly" ? "Optional route or service area" : "Where to?"
                  }
                  required={form.serviceType === "ride"}
                />
              </div>
              {form.serviceType === "hourly" && (
                <div>
                  <label className={labelCls}>Reserved Time</label>
                  <div className="relative">
                    <select
                      className={`${fieldCls} appearance-none`}
                      style={fieldStyle}
                      value={form.durationHours}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          durationHours: Number(e.target.value),
                          time: "",
                        }))
                      }
                    >
                      {HOURLY_OPTIONS.map((hours) => (
                        <option key={hours} value={hours} className="bg-[#0F0F0F] text-white">
                          {hours} {hours === 1 ? "hour" : "hours"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/40">
                    Availability will reserve the full time window.
                  </p>
                </div>
              )}
              <div>
                <label className={labelCls}>Date</label>
                <input
                  className={fieldCls}
                  style={{
                    ...fieldStyle,
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: "0",
                    boxSizing: "border-box",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                  type="date"
                  min={minRideDate}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: "" }))}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  {form.serviceType === "hourly" ? "Start Time" : "Pickup Time"}
                </label>
                {!form.date ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/40">
                    Choose a date first.
                  </div>
                ) : slotsLoading ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
                    Loading available times...
                  </div>
                ) : slotsError ? (
                  <div className="rounded-xl border border-red-400/25 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                    {slotsError}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
                    No available times for this date. Please choose another date.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className={`${fieldCls} appearance-none font-semibold`}
                      style={fieldStyle}
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                      required
                    >
                      <option value="" className="bg-[#0F0F0F] text-white">
                        Select available time
                      </option>
                      {availableSlots.map((slot) => {
                        return (
                          <option
                            key={slot.startAt}
                            value={slot.time}
                            className="bg-[#0F0F0F] text-white"
                          >
                            {slot.label}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Passengers</label>
                <div className="w-full rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl px-4 py-3 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => set("passengers", Math.max(1, form.passengers - 1))}
                    disabled={form.passengers <= 1}
                    aria-label="Decrease passengers"
                    className="h-9 w-9 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 text-white transition-transform focus:outline-none focus:border-[#E6CE20]/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    className="text-white text-center"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      minWidth: 32,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    {form.passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => set("passengers", Math.min(8, form.passengers + 1))}
                    disabled={form.passengers >= 8}
                    aria-label="Increase passengers"
                    className="h-9 w-9 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 text-white transition-transform focus:outline-none focus:border-[#E6CE20]/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <textarea
                  className={`${fieldCls} min-h-[88px] resize-none`}
                  style={fieldStyle}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything Juan should know?"
                  maxLength={1000}
                />
              </div>

              {error && <p className="text-xs text-red-400/90 text-center">{error}</p>}

              <button
                type="submit"
                disabled={submitting || slotsLoading}
                className="w-full rounded-xl bg-[#E6CE20] text-black font-semibold text-sm py-3.5 hover:bg-[#E6CE20]/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Request Ride"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
