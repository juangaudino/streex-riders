import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  Gamepad2,
  MessageSquareQuote,
  Palette,
  Settings2,
  Star,
} from "lucide-react";
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
import { getTickerTheme } from "@/lib/ticker-theme.functions";
import { CONFIG } from "@/config";
import logo from "@/assets/streex-logo.webp";

const SESSION_KEY = "streex_admin_key";

type AdminTab = "bookings" | "reviews" | "runner" | "themes" | "config" | "availability";
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
    { key: "config", label: "Config", icon: <Settings2 className="h-4 w-4" /> },
    { key: "availability", label: "Availability", icon: <CalendarClock className="h-4 w-4" /> },
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

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-7">
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
        {activeTab === "config" && <AdminConfig />}
        {activeTab === "availability" && <AdminAvailability />}
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

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

type AvailabilityBlock = {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: string;
};

const DAY_LABELS: { key: DayKey; label: string }[] = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

function AdminAvailability() {
  const [activeDays, setActiveDays] = useState<Record<DayKey, boolean>>({
    sun: false,
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
  });
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("23:00");
  const [minNotice, setMinNotice] = useState(3);
  const [slotDuration, setSlotDuration] = useState(30);
  const [rideDuration, setRideDuration] = useState(45);
  const [savedFlash, setSavedFlash] = useState(false);

  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [draft, setDraft] = useState<AvailabilityBlock>(emptyBlock());
  const [adding, setAdding] = useState(false);

  const toggleDay = (key: DayKey) => setActiveDays((d) => ({ ...d, [key]: !d[key] }));

  const saveWindow = () => {
    // UI-only: backend wiring comes later.
    console.info("[availability] draft window", {
      activeDays,
      startTime,
      endTime,
      minNotice,
      slotDuration,
      rideDuration,
      timezone: "America/Denver",
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const addBlock = () => {
    if (!draft.startDate || !draft.endDate) return;
    setBlocks((b) => [...b, { ...draft, id: crypto.randomUUID() }]);
    setDraft(emptyBlock());
    setAdding(false);
  };

  const removeBlock = (id: string) => setBlocks((b) => b.filter((x) => x.id !== id));

  return (
    <section className="flex flex-col gap-5">
      <AvailabilityCard
        title="Default availability window"
        subtitle="Hours and rules used when no manual block applies."
      >
        <div>
          <p className="text-[10px] uppercase streex-tracking text-white/40 mb-2">Active days</p>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((d) => {
              const on = activeDays[d.key];
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={`h-10 rounded-lg text-[11px] font-semibold transition-colors ${
                    on
                      ? "bg-[#E6CE20] text-black"
                      : "bg-white/[0.04] text-white/55 border border-white/10 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AvField label="Start time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={avInput}
            />
          </AvField>
          <AvField label="End time">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={avInput}
            />
          </AvField>
          <AvField label="Min. notice (hours)">
            <input
              type="number"
              min={0}
              value={minNotice}
              onChange={(e) => setMinNotice(Number(e.target.value))}
              className={avInput}
            />
          </AvField>
          <AvField label="Slot duration (min)">
            <input
              type="number"
              min={5}
              step={5}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className={avInput}
            />
          </AvField>
          <AvField label="Default ride (min)">
            <input
              type="number"
              min={5}
              step={5}
              value={rideDuration}
              onChange={(e) => setRideDuration(Number(e.target.value))}
              className={avInput}
            />
          </AvField>
          <AvField label="Timezone">
            <div className={`${avInput} flex items-center text-white/70`}>America/Denver</div>
          </AvField>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-white/40">
            {savedFlash ? "Draft saved locally." : "Saved here for layout only — backend later."}
          </p>
          <button
            type="button"
            onClick={saveWindow}
            className="rounded-xl bg-[#E6CE20] text-black text-xs font-semibold px-4 py-2 hover:bg-[#E6CE20]/90"
          >
            Save window
          </button>
        </div>
      </AvailabilityCard>

      <AvailabilityCard
        title="Manual blocks"
        subtitle="Hold time off the calendar for personal commitments or maintenance."
      >
        {blocks.length === 0 && !adding && (
          <p className="text-xs text-white/40">No manual blocks. Add one below.</p>
        )}

        {blocks.length > 0 && (
          <ul className="flex flex-col gap-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    {b.startDate} {b.startTime} → {b.endDate} {b.endTime}
                  </p>
                  {b.reason && (
                    <p className="text-[11px] text-white/50 mt-0.5 truncate">{b.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeBlock(b.id)}
                  className="shrink-0 text-[11px] text-white/50 hover:text-red-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <AvField label="Start date">
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                  className={avInput}
                />
              </AvField>
              <AvField label="Start time">
                <input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                  className={avInput}
                />
              </AvField>
              <AvField label="End date">
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                  className={avInput}
                />
              </AvField>
              <AvField label="End time">
                <input
                  type="time"
                  value={draft.endTime}
                  onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                  className={avInput}
                />
              </AvField>
            </div>
            <AvField label="Reason (optional)">
              <input
                type="text"
                value={draft.reason}
                placeholder="e.g. Family commitment"
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                className={avInput}
              />
            </AvField>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setDraft(emptyBlock());
                }}
                className="rounded-lg px-3 py-2 text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addBlock}
                className="rounded-lg bg-[#E6CE20] text-black text-xs font-semibold px-3 py-2 hover:bg-[#E6CE20]/90"
              >
                Add block
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="self-start rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs text-white/70 hover:border-[#E6CE20]/50 hover:text-white"
          >
            + Add block
          </button>
        )}
      </AvailabilityCard>

      <div className="rounded-2xl border border-[#E6CE20]/20 bg-[#E6CE20]/[0.05] px-4 py-3">
        <p className="text-[11px] uppercase streex-tracking text-[#E6CE20]/80 mb-1">
          Booking protection
        </p>
        <p className="text-xs text-white/70 leading-relaxed">
          Confirmed and quoted rides block availability automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white/80">Google Calendar sync</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Two-way sync with your personal calendar — coming later.
            </p>
          </div>
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase streex-tracking text-white/50">
            Soon
          </span>
        </div>
      </div>
    </section>
  );
}

const avInput =
  "w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40 transition-colors";

function AvField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase streex-tracking text-white/40">{label}</span>
      {children}
    </label>
  );
}

function AvailabilityCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-4">
      <header>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-[11px] text-white/45 mt-1">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function emptyBlock(): AvailabilityBlock {
  return { id: "", startDate: "", startTime: "08:00", endDate: "", endTime: "10:00", reason: "" };
}

// ─────────────────────────────────────────────────────────────────────────────
function AdminConfig() {
  type ServiceDraft = {
    id: string;
    name: string;
    price: string;
    enabled: boolean;
  };

  const [profile, setProfile] = useState({
    brandName: CONFIG.brandName,
    ownerName: CONFIG.ownerName,
    phone: CONFIG.phoneDisplay,
    email: CONFIG.email,
    website: CONFIG.website,
    instagram: CONFIG.instagram,
    whatsapp: CONFIG.whatsapp,
    google: CONFIG.googleReviews,
    nextdoor: CONFIG.nextdoor,
    tagline: CONFIG.tagline,
    subheadline: CONFIG.subheadline,
  });

  const [services, setServices] = useState<ServiceDraft[]>(
    CONFIG.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      enabled: s.enabled,
    })),
  );

  const [sections, setSections] = useState<Record<string, boolean>>(
    () => ({ ...CONFIG.sections }) as Record<string, boolean>,
  );

  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = (key: keyof typeof profile, value: string) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const updateService = (id: string, patch: Partial<ServiceDraft>) =>
    setServices((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const toggleSection = (key: string) => setSections((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      console.info("[config-v2] draft profile", { profile, services, sections });
      setMessage("Draft saved locally for UI exploration.");
      window.setTimeout(() => setMessage(null), 3200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const sectionLabels: Record<string, string> = {
    wifi: "Wi-Fi",
    textMe: "Text Me",
    callMe: "Call Me",
    saveContact: "Save Contact",
    scheduleRide: "Schedule Ride",
    moreOptions: "More Options",
    experienceGallery: "Experience Gallery",
    servicesGrid: "Services Grid",
    reviews: "Reviews",
    whyStreex: "Why Streex",
    meetJuan: "Meet Juan",
    paymentOptions: "Payment Options",
    findUs: "Find Us",
    feedbackForm: "Feedback Form",
  };

  return (
    <form onSubmit={handleSave} className="relative space-y-6">
      <div className="rounded-2xl border border-[#E6CE20]/15 bg-[#E6CE20]/[0.04] px-4 py-3">
        <div className="flex items-start gap-3">
          <Settings2 className="h-4 w-4 mt-0.5 text-[#E6CE20]" />
          <div>
            <p className="text-[11px] uppercase streex-tracking text-[#E6CE20]/90 font-semibold">
              Config v2
            </p>
            <p className="mt-1 text-xs text-white/55 leading-relaxed">
              Edit the public Streex profile. The landing uses these saved values with code config
              as fallback.
            </p>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-white/50">Loading config...</p>}

      {error && (
        <div className="text-xs text-red-400/90 border border-red-400/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {message && (
        <div className="text-xs text-[#E6CE20] border border-[#E6CE20]/25 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      <ConfigGroup title="Identity" subtitle="How Streex is presented to passengers.">
        <ConfigField
          label="Business name"
          value={profile.brandName}
          onChange={(v) => updateProfile("brandName", v)}
        />
        <ConfigField
          label="Driver name"
          value={profile.ownerName}
          onChange={(v) => updateProfile("ownerName", v)}
        />
        <ConfigField
          label="Tagline"
          value={profile.tagline}
          onChange={(v) => updateProfile("tagline", v)}
          placeholder="Private rides. Elevated."
        />
        <ConfigField
          label="Subheadline"
          value={profile.subheadline}
          onChange={(v) => updateProfile("subheadline", v)}
          multiline
        />
      </ConfigGroup>

      <ConfigGroup title="Contact" subtitle="Direct lines passengers can use.">
        <div className="grid gap-3 sm:grid-cols-2">
          <ConfigField
            label="Phone"
            value={profile.phone}
            onChange={(v) => updateProfile("phone", v)}
          />
          <ConfigField
            label="Email"
            value={profile.email}
            onChange={(v) => updateProfile("email", v)}
            type="email"
          />
          <ConfigField
            label="Website"
            value={profile.website}
            onChange={(v) => updateProfile("website", v)}
          />
          <ConfigField
            label="Instagram"
            value={profile.instagram}
            onChange={(v) => updateProfile("instagram", v)}
            prefix="@"
          />
          <ConfigField
            label="WhatsApp"
            value={profile.whatsapp}
            onChange={(v) => updateProfile("whatsapp", v)}
          />
          <ConfigField
            label="Google link"
            value={profile.google}
            onChange={(v) => updateProfile("google", v)}
          />
          <ConfigField
            label="Nextdoor link"
            value={profile.nextdoor}
            onChange={(v) => updateProfile("nextdoor", v)}
          />
        </div>
      </ConfigGroup>

      <ConfigGroup title="Services" subtitle="Toggle and name what appears in the services grid.">
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[10px] uppercase streex-tracking text-white/40">{s.id}</span>
                <button
                  type="button"
                  onClick={() => updateService(s.id, { enabled: !s.enabled })}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    s.enabled ? "bg-[#E6CE20]" : "bg-white/15"
                  }`}
                  aria-pressed={s.enabled}
                  aria-label={`Toggle ${s.name}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                      s.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={s.name}
                  onChange={(e) => updateService(s.id, { name: e.target.value })}
                  className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40"
                />
                <input
                  value={s.price}
                  onChange={(e) => updateService(s.id, { price: e.target.value })}
                  className="w-full sm:w-44 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-[#E6CE20] placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40"
                />
              </div>
            </div>
          ))}
        </div>
      </ConfigGroup>

      <ConfigGroup title="Sections" subtitle="Show or hide sections on the public landing page.">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.keys(sectionLabels).map((key) => {
            const on = !!sections[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSection(key)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  on
                    ? "border-[#E6CE20]/40 bg-[#E6CE20]/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <span className="text-sm text-white/85">{sectionLabels[key]}</span>
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    on ? "bg-[#E6CE20]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                      on ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </ConfigGroup>

      <div className="sticky bottom-3 z-10 -mx-1">
        <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
          <p className="text-[11px] text-white/50">
            {message ? "Draft saved locally." : "UI exploration only — backend later."}
          </p>
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-full bg-[#E6CE20] text-black text-xs font-semibold px-4 py-2 hover:bg-[#E6CE20]/90 transition-colors"
          >
            {saving ? "Saving..." : "Save config"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ConfigGroup({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 sm:p-5">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/45 mt-1">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function ConfigField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  prefix?: string;
}) {
  const base =
    "w-full rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E6CE20]/40 transition-colors";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase streex-tracking text-white/45 mb-1.5">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} px-3 py-2 resize-none`}
        />
      ) : (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${base} ${prefix ? "pl-7 pr-3" : "px-3"} py-2`}
          />
        </div>
      )}
    </label>
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
  const fallback: TickerStyle = CONFIG.tickerStyle === "pill" ? "pill" : "boarding";
  const [tickerStyle, setTickerStyle] = useState<TickerStyle>(fallback);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getTickerTheme();
        if (!cancelled) setTickerStyle(result.tickerStyle);
      } catch (error) {
        console.warn("[AdminThemes] Using default ticker style.", error);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
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
    const previous = tickerStyle;
    try {
      const result = await updateAdminTickerTheme({
        data: { adminKey, tickerStyle: nextStyle },
      });
      if (!result?.ok || result.tickerStyle !== nextStyle) {
        throw new Error("Server did not confirm the theme change.");
      }
      setTickerStyle(nextStyle);
      window.dispatchEvent(
        new CustomEvent("streex:ticker-theme-changed", { detail: { tickerStyle: nextStyle } }),
      );
      setMessage("Theme saved.");
    } catch (e) {
      setTickerStyle(previous);
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
          Current theme: <span className="text-[#E6CE20]">{loaded ? tickerStyle : "loading…"}</span>
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
