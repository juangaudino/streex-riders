import { useState } from "react";
import { ChevronRight, Compass, LocateFixed, MapPin } from "lucide-react";
import { aroundYouCopy } from "./around-you-copy";
import { formatAroundYouDistance } from "./around-you-utils";
import type { AroundYouEngineState, AroundYouLanguage } from "./around-you-types";

export function AroundYouHomeCard({
  language,
  onOpen,
  state,
  variant = "home",
}: {
  language: AroundYouLanguage;
  onOpen: () => void;
  state: AroundYouEngineState;
  variant?: "home" | "idle";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const t = aroundYouCopy[language];
  const featured = state.featured;
  const hasImage = Boolean(featured?.place.imageSrc && !imageFailed);
  const title = featured?.place.title[language] ?? t.fallbackTitle;
  const description = featured?.place.description[language] ?? t.homeDescription;

  return (
    <button
      data-testid="around-you-home-card"
      type="button"
      onClick={onOpen}
      className={`passenger-around-home-card group ${variant === "idle" ? "passenger-around-home-card--idle" : ""}`}
    >
      {hasImage && (
        <img
          alt=""
          aria-hidden="true"
          className="passenger-around-home-card-image"
          src={featured?.place.imageSrc}
          onError={() => setImageFailed(true)}
        />
      )}
      <span className="passenger-around-home-card-overlay" aria-hidden="true" />
      <span className="passenger-around-home-card-content">
        <span className="flex items-center justify-between gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E6CE20]/30 bg-black/35 text-[#E6CE20]">
            {featured ? <MapPin className="h-5 w-5" /> : <Compass className="h-5 w-5" />}
          </span>
          {featured && (
            <span className="rounded-full border border-[#E6CE20]/30 bg-black/25 px-2.5 py-1 text-[10px] font-bold text-[#E6CE20]">
              {formatAroundYouDistance(featured.distanceMeters, language)}
            </span>
          )}
        </span>
        <span className="mt-auto block pt-5">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6CE20]">
            <LocateFixed className="h-3.5 w-3.5" />
            {t.eyebrow}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xl font-extrabold">
            <span className="truncate">{title}</span>
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-white/70">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}
