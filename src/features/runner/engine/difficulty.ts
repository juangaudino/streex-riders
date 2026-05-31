import type { RunnerStage } from "../runner.types";

export type DifficultyState = {
  stage: RunnerStage;
  speed: number;
  spawnEveryMs: number;
  obstacleChance: number;
  collectibleChance: number;
  maxOccupiedLanes: 1 | 2;
};

export function getRunnerStage(score: number): RunnerStage {
  if (score >= 650) return "legendaryDriver";
  if (score >= 300) return "utahChaos";
  if (score >= 120) return "trafficBuilds";
  return "warmRide";
}

export function getDifficulty(score: number, elapsedMs: number): DifficultyState {
  const stage = getRunnerStage(score);
  const timePressure = Math.min(elapsedMs / 90000, 1.8);
  const scorePressure = Math.min(score / 900, 1.6);
  const pressure = timePressure + scorePressure;

  if (stage === "legendaryDriver") {
    return {
      stage,
      speed: 4.6 + pressure * 1.25,
      spawnEveryMs: Math.max(520, 920 - pressure * 150),
      obstacleChance: 0.76,
      collectibleChance: 0.24,
      maxOccupiedLanes: 2,
    };
  }

  if (stage === "utahChaos") {
    return {
      stage,
      speed: 4.1 + pressure,
      spawnEveryMs: Math.max(650, 1050 - pressure * 130),
      obstacleChance: 0.68,
      collectibleChance: 0.32,
      maxOccupiedLanes: 2,
    };
  }

  if (stage === "trafficBuilds") {
    return {
      stage,
      speed: 3.5 + pressure * 0.8,
      spawnEveryMs: Math.max(820, 1250 - pressure * 110),
      obstacleChance: 0.58,
      collectibleChance: 0.42,
      maxOccupiedLanes: 2,
    };
  }

  return {
    stage,
    speed: 3.1 + pressure * 0.45,
    spawnEveryMs: Math.max(1050, 1450 - pressure * 100),
    obstacleChance: 0.48,
    collectibleChance: 0.52,
    maxOccupiedLanes: 1,
  };
}
