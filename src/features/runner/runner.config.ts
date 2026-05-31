import type { RunnerCollectibleKind, RunnerObstacleKind, RunnerStage } from "./runner.types";

export const RUNNER_COLORS = {
  black: "#0B0B0B",
  yellow: "#E6CE20",
  white: "#FFFFFF",
  smoke: "rgba(255,255,255,0.58)",
  glass: "rgba(255,255,255,0.065)",
  border: "rgba(255,255,255,0.12)",
  road: "#1F1F1B",
  roadLight: "#2B2A24",
  mountainNear: "#20251F",
  mountainFar: "#34382E",
};

export const RUNNER_LANES = 3;
export const RUNNER_HORIZON = 0.28;

export const RUNNER_ASSET_SLOTS = {
  playerVehicle: {
    label: "Silver STREEX RAV4",
    src: null,
  },
  backgroundMountains: {
    label: "Utah mountain background",
    src: null,
  },
  roadLayer: {
    label: "Premium road layer",
    src: null,
  },
  traffic: {
    sedan: { label: "Sedan", src: null },
    suv: { label: "SUV", src: null },
    pickup: { label: "Pickup", src: null },
    liftedTruck: { label: "Lifted truck", src: null },
  },
  obstacles: {
    construction: { label: "Utah construction", src: null },
    ice: { label: "Black ice patch", src: null },
    deer: { label: "Deer", src: null },
    moose: { label: "Moose", src: null },
  },
  collectibles: {
    reputationStar: { label: "Streex reputation star", src: null },
    passengerPickup: { label: "Passenger pickup", src: null },
    airportRide: { label: "Airport ride", src: null },
    vipRide: { label: "VIP ride", src: null },
  },
};

export const RUNNER_STAGE_SCORE: Record<RunnerStage, number> = {
  warmRide: 0,
  trafficBuilds: 120,
  utahChaos: 300,
  legendaryDriver: 650,
};

export const RUNNER_COLLECTIBLE_POINTS: Record<RunnerCollectibleKind, number> = {
  reputationStar: 10,
  passengerPickup: 35,
  airportRide: 75,
  vipRide: 150,
};

export const RUNNER_OBSTACLE_LABELS: Record<RunnerObstacleKind, string> = {
  sedan: "traffic",
  suv: "traffic",
  pickup: "pickup",
  liftedTruck: "lifted truck",
  construction: "construction",
  ice: "black ice",
  deer: "deer",
  moose: "moose",
};
