import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Compass,
  LocateFixed,
  MapPinned,
  Navigation,
  Radio,
  Search,
} from "lucide-react";
import { AroundYouNearbyList } from "./AroundYouNearbyList";
import { AroundYouPlaceCard } from "./AroundYouPlaceCard";
import { aroundYouCopy } from "./around-you-copy";
import { getAroundYouTestPresets } from "./around-you-test-mode";
import type {
  AroundYouEngineState,
  AroundYouLanguage,
  AroundYouMatch,
  AroundYouPlace,
} from "./around-you-types";

function asBrowseMatch(place: AroundYouPlace): AroundYouMatch {
  return { place, distanceMeters: 0, score: 0, insideTriggerRadius: false };
}

export function AroundYouView({
  language,
  onBack,
  places,
  showDistance,
  state,
  testMode,
}: {
  language: AroundYouLanguage;
  onBack: () => void;
  places: AroundYouPlace[];
  showDistance: boolean;
  state: AroundYouEngineState;
  testMode?: {
    simulatedPlaceId: string | null;
    onSelectPreset: (placeId: string | null) => void;
  };
}) {
  const t = aroundYouCopy[language];
  const [manualSelection, setManualSelection] = useState<AroundYouMatch | null>(null);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const browseMatches = useMemo(
    () => places.filter(({ enabled }) => enabled).map(asBrowseMatch),
    [places],
  );
  const filteredBrowseMatches = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return browseMatches;

    return browseMatches.filter(({ place }) => {
      const searchable = [
        place.title.en,
        place.title.es,
        place.description.en,
        place.description.es,
        place.expandedDescription?.en,
        place.expandedDescription?.es,
        place.zone?.en,
        place.zone?.es,
        t.categories[place.category],
        ...(place.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(query);
    });
  }, [browseMatches, searchQuery, t.categories]);
  const displayed =
    manualSelection ?? state.featured ?? filteredBrowseMatches[0] ?? browseMatches[0] ?? null;
  const browseLimit = state.hasUsablePosition ? 6 : 8;
  const visibleBrowseMatches =
    searchQuery || showAllPlaces
      ? filteredBrowseMatches
      : filteredBrowseMatches.slice(0, browseLimit);
  const nearbyMatches = state.nearby.filter(({ place }) => place.id !== displayed?.place.id);

  useEffect(() => {
    if (
      manualSelection &&
      !places.some(({ id, enabled }) => enabled && id === manualSelection.place.id)
    ) {
      setManualSelection(null);
    }
  }, [manualSelection, places]);

  return (
    <div data-testid="around-you-view" className="passenger-around-layout">
      <div className="passenger-around-back-row">
        <button type="button" onClick={onBack} className="passenger-around-back-button">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
        <p className="passenger-around-status" aria-live="polite">
          <LocateFixed className="h-4 w-4 text-[#E6CE20]" />
          {t.status[state.status]}
        </p>
      </div>

      <header className="passenger-around-header">
        <p>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <span>{t.browseDescription}</span>
      </header>

      {testMode && (
        <section className="passenger-around-test-panel" aria-label={t.testModeLabel}>
          <div>
            <p>{t.testModeEyebrow}</p>
            <b>{t.testModeLabel}</b>
            <span>{t.testModeDescription}</span>
          </div>
          <div className="passenger-around-test-controls">
            <button
              type="button"
              className={!testMode.simulatedPlaceId ? "is-active" : ""}
              onClick={() => testMode.onSelectPreset(null)}
            >
              <LocateFixed className="h-4 w-4" />
              {t.testUseLiveGps}
            </button>
            {getAroundYouTestPresets(places).map((place) => (
              <button
                key={place.id}
                type="button"
                className={testMode.simulatedPlaceId === place.id ? "is-active" : ""}
                onClick={() => testMode.onSelectPreset(place.id)}
              >
                <MapPinned className="h-4 w-4" />
                {place.title[language]}
              </button>
            ))}
          </div>
        </section>
      )}

      <section
        className="passenger-around-featured"
        aria-label={displayed ? t.featured : t.fallbackTitle}
      >
        <p className="passenger-around-section-eyebrow">
          {displayed ? (manualSelection ? t.localStory : t.featured) : t.fallbackTitle}
        </p>
        {displayed ? (
          <>
            <AroundYouPlaceCard
              language={language}
              match={displayed}
              showDistance={showDistance && state.hasUsablePosition}
              variant="hero"
            />
            {manualSelection && (
              <button
                type="button"
                onClick={() => setManualSelection(null)}
                className="passenger-around-live-button"
              >
                <Radio className="h-3.5 w-3.5" />
                {t.liveContext}
              </button>
            )}
          </>
        ) : (
          <div className="passenger-around-fallback">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#E6CE20]/30 bg-[#E6CE20]/10 text-[#E6CE20]">
              <Compass className="h-6 w-6" />
            </span>
            <span>
              <b>{t.fallbackTitle}</b>
              <span>{state.hasUsablePosition ? t.noMatch : t.fallbackDescription}</span>
            </span>
          </div>
        )}
      </section>

      <div className="passenger-around-secondary">
        <section className="passenger-around-search" aria-label={t.searchPlaces}>
          <Search className="h-4 w-4 text-[#E6CE20]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowAllPlaces(true);
            }}
            placeholder={t.searchPlaces}
            aria-label={t.searchPlaces}
          />
        </section>
        {nearbyMatches.length > 0 && (
          <section className="passenger-around-nearby">
            <div className="passenger-around-section-heading">
              <div>
                <p>{t.nearby}</p>
                <span>{t.localStory}</span>
              </div>
              <Navigation className="h-5 w-5 text-[#E6CE20]" />
            </div>
            <AroundYouNearbyList
              language={language}
              matches={nearbyMatches}
              onSelect={setManualSelection}
              showDistance={showDistance}
            />
          </section>
        )}

        <section className="passenger-around-browse" aria-label={t.browse}>
          <div className="passenger-around-section-heading">
            <div>
              <p>{searchQuery ? t.searchResults : t.browse}</p>
              <span>{searchQuery ? t.browseDescription : t.browseDescription}</span>
            </div>
            <Compass className="h-5 w-5 text-[#E6CE20]" />
          </div>
          <div className="passenger-around-browse-grid">
            {visibleBrowseMatches.map((match) => (
              <AroundYouPlaceCard
                key={match.place.id}
                language={language}
                match={match}
                onSelect={() => setManualSelection(match)}
                selected={manualSelection?.place.id === match.place.id}
                showDistance={false}
                variant="browse"
              />
            ))}
          </div>
          {visibleBrowseMatches.length === 0 && (
            <p className="passenger-around-no-search-results">{t.noSearchResults}</p>
          )}
          {!searchQuery && browseMatches.length > browseLimit && (
            <button
              type="button"
              className="passenger-around-all-button"
              onClick={() => setShowAllPlaces((value) => !value)}
            >
              {showAllPlaces ? t.nearby : t.allPlaces}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
