import { MapPin } from "lucide-react";
import { formatAroundYouDistance } from "./around-you-utils";
import type { AroundYouLanguage, AroundYouMatch } from "./around-you-types";

export function AroundYouPlaceCard({
  language,
  match,
  onSelect,
  showDistance,
}: {
  language: AroundYouLanguage;
  match: AroundYouMatch;
  onSelect?: () => void;
  showDistance: boolean;
}) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/12 text-[#E6CE20]">
        <MapPin className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{match.place.title[language]}</span>
        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-white/55">
          {match.place.description[language]}
        </span>
      </span>
      {showDistance && (
        <span className="shrink-0 text-xs font-semibold text-[#E6CE20]">
          {formatAroundYouDistance(match.distanceMeters)}
        </span>
      )}
    </>
  );

  if (!onSelect) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-[#E6CE20]/35 hover:bg-white/[0.04]"
    >
      {content}
    </button>
  );
}
