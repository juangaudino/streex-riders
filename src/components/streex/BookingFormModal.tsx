import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { createBooking } from "@/lib/booking.functions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  notes: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  pickup: "",
  destination: "",
  date: "",
  time: "",
  passengers: 1,
  notes: "",
};

const fieldCls =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-xl focus:outline-none focus:border-[#E6CE20]/50 transition-colors";

const labelCls =
  "block text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold mb-2";

export function BookingFormModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      pickup: form.pickup.trim(),
      destination: form.destination.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
      passengers: Number(form.passengers),
      notes: form.notes.trim() || null,
    };

    if (
      !trimmed.name ||
      !trimmed.phone ||
      !trimmed.email ||
      !trimmed.pickup ||
      !trimmed.destination ||
      !trimmed.date ||
      !trimmed.time
    ) {
      setError("Please complete all required fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmed.passengers < 1 || trimmed.passengers > 8) {
      setError("Passengers must be between 1 and 8.");
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({ data: trimmed });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
              <h3 className="text-lg font-semibold text-white mb-2">
                Request received
              </h3>
              <p className="text-sm text-white/65 mb-6 max-w-xs">
                Your ride request was received. Juan will review and send you a
                quote shortly.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-[#E6CE20] text-black font-semibold text-sm px-6 py-3"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={fieldCls}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={fieldCls}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+1 ..."
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    className={fieldCls}
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Pickup Location</label>
                <input
                  className={fieldCls}
                  value={form.pickup}
                  onChange={(e) => set("pickup", e.target.value)}
                  placeholder="Address or place"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Destination</label>
                <input
                  className={fieldCls}
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="Where to?"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date</label>
                  <input
                    className={fieldCls}
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Time</label>
                  <input
                    className={fieldCls}
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Passengers</label>
                <input
                  className={fieldCls}
                  type="number"
                  min={1}
                  max={8}
                  value={form.passengers}
                  onChange={(e) =>
                    set("passengers", Math.max(1, Math.min(8, Number(e.target.value) || 1)))
                  }
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <textarea
                  className={`${fieldCls} min-h-[88px] resize-none`}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything Juan should know?"
                  maxLength={1000}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400/90 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
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