import { RUNNER_LANES } from "../runner.config";
import type { RunnerEntity } from "../runner.types";

export type CollisionResult =
  | { type: "none" }
  | { type: "collect"; entity: RunnerEntity }
  | { type: "hazard"; entity: RunnerEntity }
  | { type: "crash"; entity: RunnerEntity };

export function detectRunnerCollision(
  entity: RunnerEntity,
  playerLanePosition: number,
  playerY: number,
): CollisionResult {
  const entityX = laneCenter(entity.lane);
  const entityY = entity.y;
  const dx = Math.abs(entityX - playerLanePosition);
  const dy = Math.abs(entityY - playerY);
  const xLimit = (100 / RUNNER_LANES) * (entity.width * 0.42 + 0.18);
  const yLimit = 11 * entity.height + 3.2;

  if (dx > xLimit || dy > yLimit) return { type: "none" };
  if (entity.type === "collectible") return { type: "collect", entity };
  if (entity.type === "hazard") return { type: "hazard", entity };
  return { type: "crash", entity };
}

export function laneCenter(lane: number) {
  const insetCenters = [25, 50, 75];
  return insetCenters[lane] ?? lane * (100 / RUNNER_LANES) + 100 / RUNNER_LANES / 2;
}
