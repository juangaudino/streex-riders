import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { listPublicReviews } from "@/lib/review.functions";
import { useTenant } from "./TenantContext";

type Review = {
  name: string;
  location: string | null;
  stars: number;
  text: string;
};

export function Reviews() {
  const { tenantId } = useTenant();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listPublicReviews({ data: { tenantId } }).catch((error) => {
        console.error("[Reviews] approved reviews read error", error);
        return null;
      });
      if (cancelled || !result?.reviews) return;
      setReviews(
        result.reviews.map((r) => ({
          name: r.name?.trim() || "Streex Passenger",
          location: r.location,
          stars: r.rating,
          text: r.message,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (reviews.length === 0) return null;

  return (
    <section className="px-6 mt-16">
      <h2 className="text-2xl font-bold mb-5">What Passengers Say</h2>
      <div className="space-y-4">
        {reviews.map((r, idx) => (
          <div key={`${r.name}-${idx}`} className="streex-glass p-5 relative overflow-hidden">
            <span
              aria-hidden
              className="absolute top-1 right-4 text-[#E6CE20] select-none pointer-events-none"
              style={{ fontFamily: "Montserrat", fontSize: 72, lineHeight: 1, opacity: 0.12 }}
            >
              &ldquo;
            </span>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: r.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-[#E6CE20]" fill="#E6CE20" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[14px] leading-relaxed text-white/85" style={{ fontWeight: 400 }}>
              {r.text}
            </p>
            <div className="mt-4">
              <div className="text-white" style={{ fontWeight: 700, fontSize: 14 }}>
                {r.name}
              </div>
              {r.location && <div className="text-xs text-white/55 mt-0.5">{r.location}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
