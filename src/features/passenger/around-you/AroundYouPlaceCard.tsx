import { useState } from "react";
import {
  Building2,
  Compass,
  Landmark,
  MapPin,
  Mountain,
  Plane,
  Trophy,
  Trees,
  University,
} from "lucide-react";
import { aroundYouCopy } from "./around-you-copy";
import { formatAroundYouDistance, formatAroundYouElevation } from "./around-you-utils";
import type { AroundYouLanguage, AroundYouMatch, AroundYouPlaceCategory } from "./around-you-types";

const CATEGORY_ICON: Record<AroundYouPlaceCategory, typeof MapPin> = {
  city: Building2,
  culture: Landmark,
  history: Landmark,
  nature: Trees,
  mountain: Mountain,
  sports: Trophy,
  transportation: Plane,
  university: University,
  viewpoint: Compass,
};

export function AroundYouPlaceCard({
  language,
  match,
  onSelect,
  showDistance,
  selected = false,
  variant = "nearby",
}: {
  language: AroundYouLanguage;
  match: AroundYouMatch;
  onSelect?: () => void;
  showDistance: boolean;
  selected?: boolean;
  variant?: "hero" | "nearby" | "browse";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const t = aroundYouCopy[language];
  const Icon = CATEGORY_ICON[match.place.category];
  const hasImage = Boolean(match.place.imageSrc && !imageFailed);
  const isHero = variant === "hero";
  const distance = formatAroundYouDistance(match.distanceMeters, language);

  const content = (
    <>
      {hasImage && (
        <img
          alt=""
          aria-hidden="true"
          className="passenger-around-place-image"
          src={match.place.imageSrc}
          onError={() => setImageFailed(true)}
        />
      )}
      <span className="passenger-around-place-overlay" aria-hidden="true" />
      <span className="passenger-around-place-content">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E6CE20]">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#E6CE20]/30 bg-black/35 text-[#E6CE20]">
            <Icon className="h-4 w-4" />
          </span>
          {t.categories[match.place.category]}
          {showDistance && (
            <span className="ml-auto normal-case tracking-normal text-white/65">{distance}</span>
          )}
        </span>
        <span className={isHero ? "mt-5 block max-w-2xl" : "mt-3 block"}>
          <span
            className={
              isHero
                ? "block text-3xl font-extrabold tracking-tight"
                : "block text-base font-extrabold"
            }
          >
            {match.place.title[language]}
          </span>
          <span
            className={
              isHero
                ? "mt-2 block max-w-xl text-sm leading-relaxed text-white/75"
                : "mt-1 line-clamp-2 block text-xs leading-relaxed text-white/65"
            }
          >
            {match.place.description[language]}
          </span>
        </span>
        {isHero && (match.place.funFact || match.place.elevationFeet) && (
          <span className="mt-5 flex flex-wrap gap-2 text-xs">
            {match.place.funFact && (
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-white/75">
                <b className="mr-1 text-[#E6CE20]">{t.funFact}:</b> {match.place.funFact[language]}
              </span>
            )}
            {match.place.elevationFeet && (
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-white/75">
                <b className="mr-1 text-[#E6CE20]">{t.elevation}:</b>{" "}
                {formatAroundYouElevation(match.place.elevationFeet, language)}
              </span>
            )}
          </span>
        )}
      </span>
    </>
  );

  const className = `passenger-around-place-card passenger-around-place-card--${variant} ${
    selected ? "is-selected" : ""
  } ${hasImage ? "has-image" : "has-fallback"}`;

  if (!onSelect) return <article className={className}>{content}</article>;

  return (
    <button type="button" onClick={onSelect} className={`${className} text-left`}>
      {content}
    </button>
  );
}
