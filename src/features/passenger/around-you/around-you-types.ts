export type AroundYouLanguage = "en" | "es";

export type AroundYouPlaceCategory =
  | "city"
  | "culture"
  | "history"
  | "nature"
  | "sports"
  | "transportation";

export type AroundYouContextType = "landmark" | "region";

export type LocalizedText = Record<AroundYouLanguage, string>;

export type AroundYouPlace = {
  id: string;
  enabled: boolean;
  latitude: number;
  longitude: number;
  category: AroundYouPlaceCategory;
  contextType: AroundYouContextType;
  priority: number;
  triggerRadiusMeters: number;
  discoveryRadiusMeters: number;
  title: LocalizedText;
  description: LocalizedText;
  sourceUrl: string;
};

export type PassengerPosition = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: number;
};

export type PassengerLocationStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "degraded"
  | "stale"
  | "denied"
  | "unavailable"
  | "unsupported";

export type PassengerLocationState = {
  status: PassengerLocationStatus;
  position: PassengerPosition | null;
  lastGoodPositionAgeMs: number | null;
};

export type AroundYouMatch = {
  place: AroundYouPlace;
  distanceMeters: number;
  score: number;
  insideTriggerRadius: boolean;
};

export type RecentlyShownPlace = {
  placeId: string;
  shownAt: number;
};

export type AroundYouSelectionState = {
  currentPlaceId: string | null;
  selectedAt: number | null;
  recentlyShown: RecentlyShownPlace[];
};

export type AroundYouSelectionOptions = {
  nearbyLimit: number;
  minimumFeaturedDwellMs: number;
  exitRadiusMultiplier: number;
  challengerScoreRatio: number;
  recentlyShownCooldownMs: number;
};

export type AroundYouEngineState = {
  status: PassengerLocationStatus;
  featured: AroundYouMatch | null;
  nearby: AroundYouMatch[];
  hasUsablePosition: boolean;
};
