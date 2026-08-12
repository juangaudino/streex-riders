import { AroundYouPlaceCard } from "./AroundYouPlaceCard";
import type { AroundYouLanguage, AroundYouMatch } from "./around-you-types";

export function AroundYouNearbyList({
  language,
  matches,
  onSelect,
  showDistance,
}: {
  language: AroundYouLanguage;
  matches: AroundYouMatch[];
  onSelect: (match: AroundYouMatch) => void;
  showDistance: boolean;
}) {
  return (
    <div className="passenger-around-nearby-grid grid gap-3">
      {matches.map((match) => (
        <AroundYouPlaceCard
          key={match.place.id}
          language={language}
          match={match}
          onSelect={() => onSelect(match)}
          showDistance={showDistance}
        />
      ))}
    </div>
  );
}
