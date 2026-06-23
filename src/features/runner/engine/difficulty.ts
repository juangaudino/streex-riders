import type { RunnerStage } from "../runner.types";

export const RUNNER_STAGE_LABELS: Record<RunnerStage, string> = {
  warmRide: "",
  trafficBuilds: "Traffic Builds",
  utahChaos: "Utah Chaos",
  legendaryDriver: "Legendary Driver",
};

export type DifficultyState = {
  stage: RunnerStage;
  speed: number;
  spawnEveryMs: number;
  obstacleChance: number;
  collectibleChance: number;
  maxOccupiedLanes: 1 | 2;
};

export function getRunnerStage(score: number): RunnerStage {
  if (score >= 950) return "legendaryDriver";
  if (score >= 520) return "utahChaos";
  if (score >= 220) return "trafficBuilds";
  return "warmRide";
}

export function getDifficulty(score: number, elapsedMs: number): DifficultyState {
  const stage = getRunnerStage(score);
  const timePressure = Math.min(elapsedMs / 125000, 1.45);
  const scorePressure = Math.min(score / 1300, 1.25);
  const pressure = timePressure + scorePressure;

  if (stage === "legendaryDriver") {
    return {
      stage,
      speed: 4.25 + pressure * 0.95,
      spawnEveryMs: Math.max(640, 1080 - pressure * 120),
      obstacleChance: 0.72,
      collectibleChance: 0.28,
      maxOccupiedLanes: 2,
    };
  }

  if (stage === "utahChaos") {
    return {
      stage,
      speed: 3.72 + pressure * 0.78,
      spawnEveryMs: Math.max(780, 1260 - pressure * 105),
      obstacleChance: 0.62,
      collectibleChance: 0.38,
      maxOccupiedLanes: 2,
    };
  }

  if (stage === "trafficBuilds") {
    return {
      stage,
      speed: 3.02 + pressure * 0.58,
      spawnEveryMs: Math.max(980, 1500 - pressure * 85),
      obstacleChance: 0.52,
      collectibleChance: 0.48,
      maxOccupiedLanes: 2,
    };
  }

  return {
    stage,
    speed: 2.12 + pressure * 0.32,
    spawnEveryMs: Math.max(1320, 1880 - pressure * 72),
    obstacleChance: 0.36,
    collectibleChance: 0.64,
    maxOccupiedLanes: 1,
  };
}
