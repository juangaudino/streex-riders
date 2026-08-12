import { ChevronRight, Compass, MapPin } from "lucide-react";
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
  const t = aroundYouCopy[language];
  const featured = state.featured;
  const title = featured?.place.title[language] ?? t.fallbackTitle;
  const description = featured?.place.description[language] ?? t.homeDescription;

  return (
    <button
      data-testid="around-you-home-card"
      type="button"
      onClick={onOpen}
      className={`group relative flex w-full overflow-hidden rounded-[24px] border border-[#E6CE20]/25 bg-gradient-to-br from-[#E6CE20]/14 via-white/[0.045] to-white/[0.02] text-left transition hover:border-[#E6CE20]/50 ${
        variant === "idle" ? "min-h-[150px] items-center gap-5 p-6" : "min-h-[166px] flex-col p-4"
      }`}
    >
      <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E6CE20]/10 blur-3xl" />
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20] text-black">
        {featured ? <MapPin className="h-6 w-6" /> : <Compass className="h-6 w-6" />}
      </span>
      <span className={`relative min-w-0 flex-1 ${variant === "home" ? "mt-auto pt-5" : ""}`}>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6CE20]">
          {t.eyebrow}
        </span>
        <span className="mt-1 flex items-center gap-2 text-xl font-extrabold">
          <span className="truncate">{title}</span>
          <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-white/55">
          {description}
        </span>
      </span>
      {featured && (
        <span className="relative shrink-0 self-start rounded-full border border-[#E6CE20]/25 px-3 py-1 text-[10px] font-bold text-[#E6CE20]">
          {formatAroundYouDistance(featured.distanceMeters)}
        </span>
      )}
    </button>
  );
}
