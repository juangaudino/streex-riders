export type RunnerScreen = "intro" | "transition" | "playing" | "results";

export type RunnerLane = 0 | 1 | 2;

export type RunnerStage = "warmRide" | "trafficBuilds" | "utahChaos" | "legendaryDriver";

export type RunnerObstacleKind =
  | "sedan"
  | "suv"
  | "pickup"
  | "liftedTruck"
  | "construction"
  | "ice"
  | "deer"
  | "moose";

export type RunnerCollectibleKind =
  | "reputationStar"
  | "passengerPickup"
  | "airportRide"
  | "vipRide";

export type RunnerEntityKind = RunnerObstacleKind | RunnerCollectibleKind;

export type RunnerEntityType = "obstacle" | "hazard" | "collectible";

export type RunnerEntity = {
  id: number;
  lane: RunnerLane;
  y: number;
  type: RunnerEntityType;
  kind: RunnerEntityKind;
  points?: number;
  width: number;
  height: number;
};

export type RunnerGameSnapshot = {
  score: number;
  rank: number;
  totalRiders: number;
  crashKind: RunnerEntityKind | null;
};

export type RunnerControls = {
  onGameOver: (snapshot: RunnerGameSnapshot) => void;
  onRestart: () => void;
  onBack: () => void;
};
