import { useEffect, useState } from "react";
import { ArrowLeft, Compass, LocateFixed } from "lucide-react";
import { AroundYouNearbyList } from "./AroundYouNearbyList";
import { AroundYouPlaceCard } from "./AroundYouPlaceCard";
import { aroundYouCopy } from "./around-you-copy";
import type { AroundYouEngineState, AroundYouLanguage, AroundYouMatch } from "./around-you-types";

export function AroundYouView({
  language,
  onBack,
  showDistance,
  state,
}: {
  language: AroundYouLanguage;
  onBack: () => void;
  showDistance: boolean;
  state: AroundYouEngineState;
}) {
  const t = aroundYouCopy[language];
  const [manualSelection, setManualSelection] = useState<AroundYouMatch | null>(null);

  useEffect(() => {
    if (
      manualSelection &&
      !state.nearby.some(({ place }) => place.id === manualSelection.place.id) &&
      state.featured?.place.id !== manualSelection.place.id
    ) {
      setManualSelection(null);
    }
  }, [manualSelection, state.featured?.place.id, state.nearby]);

  const displayed = manualSelection ?? state.featured;

  return (
    <div
      data-testid="around-you-view"
      className="passenger-around-layout flex min-h-full flex-col gap-5"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-2 text-sm text-white/55 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
          {t.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t.title}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
          <LocateFixed className="h-4 w-4 text-[#E6CE20]" />
          {t.status[state.status]}
        </p>
      </header>

      <section className="rounded-[28px] border border-[#E6CE20]/20 bg-gradient-to-br from-[#E6CE20]/12 via-white/[0.045] to-transparent p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6CE20]">
          {displayed ? t.featured : t.fallbackTitle}
        </p>
        {displayed ? (
          <div className="mt-4">
            <AroundYouPlaceCard language={language} match={displayed} showDistance={showDistance} />
            {manualSelection && (
              <button
                type="button"
                onClick={() => setManualSelection(null)}
                className="mt-3 text-xs font-semibold text-[#E6CE20] underline underline-offset-4"
              >
                {t.featured}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E6CE20] text-black">
              <Compass className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-extrabold">{t.fallbackTitle}</span>
              <span className="mt-2 block text-sm leading-relaxed text-white/55">
                {state.hasUsablePosition ? t.noMatch : t.fallbackDescription}
              </span>
            </span>
          </div>
        )}
      </section>

      {state.nearby.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-white/60">
            {t.nearby}
          </h2>
          <AroundYouNearbyList
            language={language}
            matches={state.nearby}
            onSelect={setManualSelection}
            showDistance={showDistance}
          />
        </section>
      )}
    </div>
  );
}
