import { Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listPublicReviews } from "@/lib/review.functions";
import { useTenant } from "./TenantContext";

const MAX_VISIBLE_REVIEWS = 3;
const REVIEW_ROTATION_MS = 10_000;

type Review = {
  name: string;
  location: string | null;
  stars: number;
  text: string;
};

export function Reviews() {
  const { tenantId, tenantSlug, previewToken } = useTenant();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const interactionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listPublicReviews({
        data: { tenantId, tenantSlug, previewToken },
      }).catch((error) => {
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
  }, [previewToken, tenantId, tenantSlug]);

  const visibleReviews = useMemo(() => {
    if (reviews.length <= MAX_VISIBLE_REVIEWS) return reviews;

    // Select a different, small set on each page session without reshuffling
    // on every render. The selected cards stay stable while this section lives.
    const shuffled = [...reviews];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled.slice(0, MAX_VISIBLE_REVIEWS);
  }, [reviews]);

  const isPaused = hoverPaused || focusPaused || interactionPaused;

  const scrollToReview = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      if (visibleReviews.length === 0) return;
      const nextIndex = (index + visibleReviews.length) % visibleReviews.length;
      setActiveIndex(nextIndex);
      const track = trackRef.current;
      if (!track) return;
      const target = track.children[nextIndex] as HTMLElement | undefined;
      const left = target
        ? track.scrollLeft +
          target.getBoundingClientRect().left -
          track.getBoundingClientRect().left
        : nextIndex * track.clientWidth;
      track.scrollTo({ left, behavior });
    },
    [visibleReviews.length],
  );

  const pauseAfterInteraction = useCallback(() => {
    setInteractionPaused(true);
    if (interactionTimeoutRef.current !== null) {
      window.clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = window.setTimeout(() => {
      setInteractionPaused(false);
      interactionTimeoutRef.current = null;
    }, REVIEW_ROTATION_MS);
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    activeIndexRef.current = 0;
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [visibleReviews]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener?.("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current !== null) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visibleReviews.length < 2 || isPaused || prefersReducedMotion) return;
    const interval = window.setInterval(() => {
      scrollToReview(activeIndexRef.current + 1);
    }, REVIEW_ROTATION_MS);
    return () => window.clearInterval(interval);
  }, [isPaused, prefersReducedMotion, scrollToReview, visibleReviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="px-6 mt-16">
      <h2 className="text-2xl font-bold mb-5">What Passengers Say</h2>
      <div
        className="relative"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocus={() => setFocusPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocusPaused(false);
          }
        }}
        onPointerDown={pauseAfterInteraction}
      >
        <div
          ref={trackRef}
          className={`flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden ${
            prefersReducedMotion ? "" : "scroll-smooth"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={() => {
            const track = trackRef.current;
            if (!track || track.clientWidth === 0) return;
            const nextIndex = Array.from(track.children).reduce((closestIndex, child, index) => {
              const trackLeft = track.getBoundingClientRect().left;
              const closestDistance = Math.abs(
                (track.children[closestIndex] as HTMLElement).getBoundingClientRect().left -
                  trackLeft,
              );
              const childDistance = Math.abs(
                (child as HTMLElement).getBoundingClientRect().left - trackLeft,
              );
              return childDistance < closestDistance ? index : closestIndex;
            }, 0);
            setActiveIndex(nextIndex);
          }}
          aria-label="Passenger reviews"
        >
          {visibleReviews.map((r, idx) => (
            <article
              key={`${r.name}-${idx}`}
              className="w-full min-w-0 shrink-0 snap-start streex-glass p-5 relative overflow-hidden"
              style={{ flex: "0 0 100%" }}
              aria-roledescription="review"
              aria-label={`${idx + 1} of ${visibleReviews.length}`}
            >
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
              <p
                className="max-w-full whitespace-normal break-words text-[14px] leading-relaxed text-white/85"
                style={{ fontWeight: 400, overflowWrap: "anywhere" }}
              >
                {r.text}
              </p>
              <div className="mt-4">
                <div className="text-white" style={{ fontWeight: 700, fontSize: 14 }}>
                  {r.name}
                </div>
                {r.location && <div className="text-xs text-white/55 mt-0.5">{r.location}</div>}
              </div>
            </article>
          ))}
        </div>
        {visibleReviews.length > 1 && (
          <div
            className="mt-4 flex items-center justify-center gap-2"
            aria-label="Review navigation"
          >
            {visibleReviews.map((r, idx) => (
              <button
                key={`${r.name}-${idx}-indicator`}
                type="button"
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? "w-6 bg-[#E6CE20]" : "w-2 bg-white/30"
                }`}
                aria-label={`Show review ${idx + 1}`}
                aria-current={idx === activeIndex ? "true" : undefined}
                onClick={() => scrollToReview(idx, prefersReducedMotion ? "auto" : "smooth")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
