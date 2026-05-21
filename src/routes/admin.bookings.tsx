// NOTE: MVP moderation page — protected by a simple password gate.
// TODO: Replace with proper authentication before
// sharing /admin/bookings URL publicly
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendQuote, updateBookingStatus } from "@/lib/booking.functions";
import logo from "@/assets/streex-logo.png";

const ADMIN_PASSWORD = "Comedia-6789";
const SESSION_KEY = "streex_admin_authed";

type BookingRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  notes: string | null;
  price: number | null;
  status:
    | "pending"
    | "quoted"
    | "confirmed"
    | "declined"
    | "completed"
    | "cancelled";
  created_at: string;
};

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsGate,
});

function AdminBookingsGate() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (authed) return <AdminBookings />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0B] px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230,206,32,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-xs flex flex-col items-center">
        <img src={logo} alt="Streex" className="w-40 h-auto streex-logo-glow" />
        <p className="mt-6 text-[10px] streex-tracking text-white/60 uppercase">
          Restricted Area
        </p>
        <form onSubmit={submit} className="mt-8 w-full flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-xl focus:outline-none focus:border-[#E6CE20]/40 transition-colors"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#E6CE20] text-black font-semibold text-sm py-3 hover:bg-[#E6CE20]/90 transition-colors"
          >
            Enter
          </button>
          {error && (
            <p className="text-center text-xs text-red-400/90 mt-1">Access denied.</p>
          )}
        </form>
      </div>
    </div>
  );
}

const STATUS_TABS: { key: BookingRow["status"]; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "quoted", label: "Quoted" },
  { key: "confirmed", label: "Confirmed" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<BookingRow["status"]>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setBookings((data ?? []) as BookingRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = Object.fromEntries(
    STATUS_TABS.map((s) => [s.key, bookings.filter((b) => b.status === s.key).length]),
  ) as Record<BookingRow["status"], number>;

  const visible = bookings.filter((b) => b.status === active);

  return (
    <div className="min-h-screen bg-black text-white px-5 sm:px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Streex &mdash; Bookings</h1>
          <p className="text-xs text-white/40 mt-1">
            Internal MVP page. Add authentication before production.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  isActive
                    ? "bg-[#E6CE20] text-black border-[#E6CE20] font-semibold"
                    : "border-white/15 text-white/70 hover:text-white"
                }`}
              >
                {tab.label}{" "}
                <span className={isActive ? "opacity-70" : "opacity-50"}>
                  ({counts[tab.key] ?? 0})
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400/90 border border-red-400/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {loading && <p className="text-sm text-white/50">Loading...</p>}

        {!loading && visible.length === 0 && (
          <p className="text-sm text-white/30">No bookings in this category.</p>
        )}

        <div className="space-y-3">
          {visible.map((b) => (
            <BookingCard key={b.id} booking={b} onChange={load} setError={setError} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onChange,
  setError,
}: {
  booking: BookingRow;
  onChange: () => void;
  setError: (s: string | null) => void;
}) {
  const [price, setPrice] = useState<string>(
    booking.price != null ? String(booking.price) : "",
  );
  const [busy, setBusy] = useState(false);

  const wrap = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await onChange();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const doQuote = () => {
    const n = Number(price);
    if (!n || n <= 0) {
      setError("Enter a valid price.");
      return;
    }
    wrap(() => sendQuote({ data: { id: booking.id, price: n } }));
  };

  const doStatus = (status: "confirmed" | "completed" | "cancelled") =>
    wrap(() => updateBookingStatus({ data: { id: booking.id, status } }));

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[15px] font-semibold text-white">{booking.name}</div>
          <div className="text-xs text-white/55 mt-0.5">
            {booking.phone} &middot; {booking.email}
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#E6CE20]/90 font-semibold">
          {booking.status}
        </span>
      </div>

      <div className="text-sm text-white/85 mb-1">
        <span className="text-white/55">From</span> {booking.pickup}{" "}
        <span className="text-white/55">→</span> {booking.destination}
      </div>
      <div className="text-xs text-white/60 mb-2">
        {booking.date} at {booking.time} &middot; {booking.passengers} passenger
        {booking.passengers === 1 ? "" : "s"}
        {booking.price != null && (
          <>
            {" "}&middot; <span className="text-[#E6CE20]">${Number(booking.price).toFixed(2)}</span>
          </>
        )}
      </div>
      {booking.notes && (
        <p className="text-xs text-white/55 italic mb-2 whitespace-pre-wrap">
          &ldquo;{booking.notes}&rdquo;
        </p>
      )}
      <div className="text-[11px] text-white/35 mb-3">
        {new Date(booking.created_at).toLocaleString()}
      </div>

      {booking.status === "pending" && (
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="w-full rounded-full bg-white/[0.05] border border-white/10 pl-7 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40"
            />
          </div>
          <button
            disabled={busy}
            onClick={doQuote}
            className="text-xs rounded-full px-4 py-2 bg-[#E6CE20] text-black font-semibold disabled:opacity-60"
          >
            {busy ? "Sending..." : "Send Quote"}
          </button>
        </div>
      )}

      {booking.status === "quoted" && (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => doStatus("cancelled")}
            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}

      {booking.status === "confirmed" && (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => doStatus("completed")}
            className="text-xs rounded-full px-3 py-1.5 bg-[#E6CE20] text-black font-semibold disabled:opacity-60"
          >
            Mark as Completed
          </button>
          <button
            disabled={busy}
            onClick={() => doStatus("cancelled")}
            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}