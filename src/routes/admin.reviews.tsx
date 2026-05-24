// NOTE: MVP moderation page — protected by a simple password gate.
// TODO: Replace with proper authentication before
// sharing /admin/reviews URL publicly
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/streex-logo.png";

const ADMIN_PASSWORD = "Comedia-6789";
const SESSION_KEY = "streex_admin_authed";

type ReviewRow = {
  id: string;
  name: string | null;
  rating: number;
  message: string;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Admin — Reviews | Streex Rides" },
      { name: "description", content: "Internal review moderation panel." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReviewsGate,
});

function AdminReviewsGate() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (authed) return <AdminReviews />;

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

function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setReviews((data ?? []) as ReviewRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: ReviewRow["status"]) => {
    const prev = reviews;
    setReviews((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error: err } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (err) {
      setReviews(prev);
      setError(err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const prev = reviews;
    setReviews((r) => r.filter((x) => x.id !== id));
    const { error: err } = await supabase.from("reviews").delete().eq("id", id);
    if (err) {
      setReviews(prev);
      setError(err.message);
    }
  };

  const sections: { key: ReviewRow["status"]; label: string }[] = [
    { key: "pending", label: "Pending Reviews" },
    { key: "approved", label: "Approved Reviews" },
    { key: "rejected", label: "Rejected Reviews" },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Streex — Review Moderation</h1>
          <p className="text-xs text-white/40 mt-1">
            Internal MVP page. Add authentication before production.
          </p>
        </header>

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
      </div>
    </div>
  );
}