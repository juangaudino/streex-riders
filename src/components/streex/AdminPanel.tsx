import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Gamepad2, MessageSquareQuote, Palette, Star } from "lucide-react";
import {
  deleteAdminReview,
  deleteAdminRunnerScore,
  listAdminBookings,
  listAdminReviews,
  listAdminRunnerScores,
  sendAdminQuote,
  updateAdminBookingStatus,
  updateAdminReviewStatus,
  updateAdminRunnerScore,
  updateAdminRunnerScoreStatus,
  updateAdminTickerTheme,
  verifyAdminKey,
} from "@/lib/admin.functions";
import { CONFIG } from "@/config";
import logo from "@/assets/streex-logo.png";

const SESSION_KEY = "streex_admin_key";

type AdminTab = "bookings" | "reviews" | "runner" | "themes";
type TickerStyle = "boarding" | "pill";

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
  status: "pending" | "quoted" | "confirmed" | "declined" | "completed" | "cancelled";
  created_at: string;
};

type ReviewRow = {
  id: string;
  name: string | null;
  rating: number;
  message: string;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type RunnerScoreRow = {
  id: string;
  name: string;
  score: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

const STATUS_TABS: { key: BookingRow["status"]; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "quoted", label: "Quoted" },
  { key: "confirmed", label: "Confirmed" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function AdminPanel({ initialTab = "bookings" }: { initialTab?: AdminTab }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setAdminKey(stored);
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      await verifyAdminKey({ data: { adminKey: password } });
      sessionStorage.setItem(SESSION_KEY, password);
      setAdminKey(password);
    } catch {
      setError("Access denied.");
    } finally {
      setChecking(false);
    }
  };

  if (!adminKey) {
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
                if (error) setError(null);
              }}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-xl focus:outline-none focus:border-[#E6CE20]/40 transition-colors"
            />
            <button
              type="submit"
              disabled={checking}
              className="w-full rounded-xl bg-[#E6CE20] text-black font-semibold text-sm py-3 hover:bg-[#E6CE20]/90 transition-colors disabled:opacity-60"
            >
              {checking ? "Checking..." : "Enter Admin"}
            </button>
            {error && <p className="text-center text-xs text-red-400/90 mt-1">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
    { key: "reviews", label: "Reviews", icon: <MessageSquareQuote className="h-4 w-4" /> },
    { key: "runner", label: "Runner", icon: <Gamepad2 className="h-4 w-4" /> },
    { key: "themes", label: "Themes", icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-5 sm:px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase streex-tracking text-[#E6CE20]/80 mb-2">
              Streex Admin
            </p>
            <h1 className="text-2xl font-bold">Control Center</h1>
            <p className="text-xs text-white/40 mt-1">
              Manage bookings, passenger reviews, and display themes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              setAdminKey(null);
            }}
            className="text-xs rounded-full px-3 py-1.5 border border-white/15 text-white/70 hover:text-white"
          >
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-7">
          {tabs.map((tab) => {
            const selected = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selected
                    ? "bg-[#E6CE20] text-black border-[#E6CE20]"
                    : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "bookings" && <AdminBookings adminKey={adminKey} />}
        {activeTab === "reviews" && <AdminReviews adminKey={adminKey} />}
        {activeTab === "runner" && <AdminRunnerScores adminKey={adminKey} />}
        {activeTab === "themes" && <AdminThemes adminKey={adminKey} />}
      </div>
    </div>
  );
}

function AdminBookings({ adminKey }: { adminKey: string }) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<BookingRow["status"]>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminBookings({ data: { adminKey } });
      setBookings((result.bookings ?? []) as BookingRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = Object.fromEntries(
    STATUS_TABS.map((s) => [s.key, bookings.filter((b) => b.status === s.key).length]),
  ) as Record<BookingRow["status"], number>;

  const visible = bookings.filter((b) => b.status === active);

  return (
    <section>
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
          <BookingCard
            key={b.id}
            adminKey={adminKey}
            booking={b}
            onChange={load}
            setError={setError}
          />
        ))}
      </div>
    </section>
  );
}

function BookingCard({
  booking,
  adminKey,
  onChange,
  setError,
}: {
  booking: BookingRow;
  adminKey: string;
  onChange: () => void;
  setError: (s: string | null) => void;
}) {
  const [price, setPrice] = useState<string>(booking.price != null ? String(booking.price) : "");
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
    wrap(() => sendAdminQuote({ data: { adminKey, id: booking.id, price: n } }));
  };

  const doStatus = (status: "confirmed" | "completed" | "cancelled") =>
    wrap(() => updateAdminBookingStatus({ data: { adminKey, id: booking.id, status } }));

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
            {" "}
            &middot; <span className="text-[#E6CE20]">${Number(booking.price).toFixed(2)}</span>
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
        <button
          disabled={busy}
          onClick={() => doStatus("cancelled")}
          className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
        >
          Cancel
        </button>
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

function AdminReviews({ adminKey }: { adminKey: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminReviews({ data: { adminKey } });
      setReviews((result.reviews ?? []) as ReviewRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: ReviewRow["status"]) => {
    const prev = reviews;
    setReviews((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await updateAdminReviewStatus({ data: { adminKey, id, status } });
    } catch (e) {
      setReviews(prev);
      setError(e instanceof Error ? e.message : "Failed to update review.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const prev = reviews;
    setReviews((r) => r.filter((x) => x.id !== id));
    try {
      await deleteAdminReview({ data: { adminKey, id } });
    } catch (e) {
      setReviews(prev);
      setError(e instanceof Error ? e.message : "Failed to delete review.");
    }
  };

  const sections: { key: ReviewRow["status"]; label: string }[] = [
    { key: "pending", label: "Pending Reviews" },
    { key: "approved", label: "Approved Reviews" },
    { key: "rejected", label: "Rejected Reviews" },
  ];

  return (
    <section>
      {error && (
        <div className="mb-4 text-xs text-red-400/90 border border-red-400/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {loading && <p className="text-sm text-white/50">Loading...</p>}

      {!loading &&
        sections.map((section) => {
          const items = reviews.filter((r) => r.status === section.key);
          return (
            <section key={section.key} className="mb-10">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-white/50 font-semibold mb-3">
                {section.label} ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-white/30">No reviews.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 text-[#E6CE20]"
                            fill="#E6CE20"
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                      <p className="text-[14px] text-white/85 mb-3 whitespace-pre-wrap">
                        {r.message}
                      </p>
                      <div className="text-xs text-white/55">
                        <span className="text-white/85 font-semibold">
                          {r.name?.trim() || "Streex Passenger"}
                        </span>
                        {" · "}
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(r.id, "approved")}
                            className="text-xs rounded-full px-3 py-1.5 bg-[#E6CE20] text-black font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => remove(r.id)}
                          className="text-xs rounded-full px-3 py-1.5 border border-red-400/30 text-red-400/90"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
    </section>
  );
}

function AdminRunnerScores({ adminKey }: { adminKey: string }) {
  const [scores, setScores] = useState<RunnerScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminRunnerScores({ data: { adminKey } });
      setScores((result.scores ?? []) as RunnerScoreRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load runner scores.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: RunnerScoreRow["status"]) => {
    const prev = scores;
    setScores((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await updateAdminRunnerScoreStatus({ data: { adminKey, id, status } });
    } catch (e) {
      setScores(prev);
      setError(e instanceof Error ? e.message : "Failed to update runner score.");
    }
  };

  const editScore = async (id: string, name: string, score: number) => {
    const prev = scores;
    setScores((items) => items.map((item) => (item.id === id ? { ...item, name, score } : item)));
    try {
      await updateAdminRunnerScore({ data: { adminKey, id, name, score } });
    } catch (e) {
      setScores(prev);
      setError(e instanceof Error ? e.message : "Failed to edit runner score.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this Runner score permanently?")) return;
    const prev = scores;
    setScores((items) => items.filter((item) => item.id !== id));
    try {
      await deleteAdminRunnerScore({ data: { adminKey, id } });
    } catch (e) {
      setScores(prev);
      setError(e instanceof Error ? e.message : "Failed to delete runner score.");
    }
  };

  const sections: { key: RunnerScoreRow["status"]; label: string }[] = [
    { key: "pending", label: "Pending Scores" },
    { key: "approved", label: "Approved Leaderboard" },
    { key: "rejected", label: "Rejected Scores" },
  ];

  return (
    <section>
      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-lg font-semibold">Runner Records</h2>
        <p className="mt-1 text-sm text-white/55">
          Approve scores before they appear publicly in the Runner leaderboard.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-xs text-red-400/90 border border-red-400/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {loading && <p className="text-sm text-white/50">Loading...</p>}

      {!loading &&
        sections.map((section) => {
          const items = scores.filter((score) => score.status === section.key);
          return (
            <section key={section.key} className="mb-10">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-white/50 font-semibold mb-3">
                {section.label} ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-white/30">No records.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((score) => (
                    <RunnerScoreCard
                      key={score.id}
                      score={score}
                      onEdit={editScore}
                      onStatus={updateStatus}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
    </section>
  );
}

function RunnerScoreCard({
  score,
  onEdit,
  onStatus,
  onDelete,
}: {
  score: RunnerScoreRow;
  onEdit: (id: string, name: string, score: number) => Promise<void>;
  onStatus: (id: string, status: RunnerScoreRow["status"]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(score.name);
  const [scoreValue, setScoreValue] = useState(String(score.score));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(score.name);
    setScoreValue(String(score.score));
  }, [score.name, score.score]);

  const changed = name.trim() !== score.name || Number(scoreValue) !== score.score;

  const saveEdit = async () => {
    const nextName = name.trim();
    const nextScore = Number(scoreValue);
    if (!nextName || !Number.isInteger(nextScore) || nextScore < 0) return;
    setBusy(true);
    try {
      await onEdit(score.id, nextName, nextScore);
    } finally {
      setBusy(false);
    }
  };

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#E6CE20]/80 font-semibold">
            {score.status}
          </span>
          <div className="mt-1 text-xs text-white/40">
            {new Date(score.created_at).toLocaleString()}
          </div>
        </div>
        <strong className="text-3xl leading-none text-[#E6CE20]">{score.score}</strong>
      </div>

      <div className="grid grid-cols-[1fr_96px] gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="min-w-0 rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40"
        />
        <input
          type="number"
          min="0"
          value={scoreValue}
          onChange={(e) => setScoreValue(e.target.value)}
          className="min-w-0 rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          disabled={busy || !changed}
          onClick={saveEdit}
          className="text-xs rounded-full px-3 py-1.5 bg-[#E6CE20] text-black font-semibold disabled:opacity-50"
        >
          Save Edit
        </button>
        {score.status !== "approved" && (
          <button
            disabled={busy}
            onClick={() => wrap(() => onStatus(score.id, "approved"))}
            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {score.status !== "pending" && (
          <button
            disabled={busy}
            onClick={() => wrap(() => onStatus(score.id, "pending"))}
            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
          >
            Pending
          </button>
        )}
        {score.status !== "rejected" && (
          <button
            disabled={busy}
            onClick={() => wrap(() => onStatus(score.id, "rejected"))}
            className="text-xs rounded-full px-3 py-1.5 border border-white/20 text-white/85 disabled:opacity-60"
          >
            Reject
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => wrap(() => onDelete(score.id))}
          className="text-xs rounded-full px-3 py-1.5 border border-red-400/30 text-red-400/90 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AdminThemes({ adminKey }: { adminKey: string }) {
  const [tickerStyle, setTickerStyle] = useState<TickerStyle>(
    CONFIG.tickerStyle === "pill" ? "pill" : "boarding",
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const themeOptions: Array<{
    key: TickerStyle;
    label: string;
    description: string;
  }> = [
    {
      key: "boarding",
      label: "Airport Boarding",
      description: "LED board inspired ticker using Streex black, yellow, and white.",
    },
    {
      key: "pill",
      label: "Clean Pills",
      description: "The simpler capsule ticker style kept as an alternate option.",
    },
  ];

  const saveTheme = async (nextStyle: TickerStyle) => {
    setSaving(nextStyle);
    setMessage(null);
    try {
      await updateAdminTickerTheme({ data: { adminKey, tickerStyle: nextStyle } });
      setTickerStyle(nextStyle);
      window.dispatchEvent(
        new CustomEvent("streex:ticker-theme-changed", { detail: { tickerStyle: nextStyle } }),
      );
      setMessage("Theme saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save theme.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-lg font-semibold">Ticker Theme</h2>
        <p className="mt-1 text-sm text-white/55">
          Current theme: <span className="text-[#E6CE20]">{tickerStyle}</span>
        </p>
        <p className="mt-3 text-xs text-white/40">
          This saves the active ticker style in Lovable Cloud. The code config remains the fallback.
        </p>
        {message && <p className="mt-3 text-xs text-white/65">{message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {themeOptions.map((theme) => {
          const selected = theme.key === tickerStyle;
          return (
            <button
              key={theme.key}
              type="button"
              onClick={() => saveTheme(theme.key)}
              disabled={saving !== null}
              className={`rounded-xl border p-4 ${
                selected ? "border-[#E6CE20]/70 bg-[#E6CE20]/10" : "border-white/10 bg-white/[0.03]"
              } text-left disabled:opacity-60`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{theme.label}</h3>
                {selected && (
                  <span className="rounded-full bg-[#E6CE20] px-2 py-0.5 text-[10px] font-semibold text-black">
                    {saving === theme.key ? "Saving" : "Active"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{theme.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
