import { RUNNER_COLLECTIBLE_POINTS } from "../runner.config";
import type {
  RunnerCollectibleKind,
  RunnerEntity,
  RunnerObstacleKind,
  RunnerStage,
  RunnerLane,
} from "../runner.types";
import type { DifficultyState } from "./difficulty";

type SpawnMemory = {
  lastKinds: string[];
  nextId: number;
};

export function createSpawnMemory(): SpawnMemory {
  return { lastKinds: [], nextId: 1 };
}

export function createSpawnWave(difficulty: DifficultyState, memory: SpawnMemory): RunnerEntity[] {
  const occupiedLaneCount = difficulty.maxOccupiedLanes === 2 && Math.random() > 0.42 ? 2 : 1;
  const blockedLanes = pickUniqueLanes(occupiedLaneCount);
  const safeLane = pickSafeLane(blockedLanes);
  const entities: RunnerEntity[] = [];

  blockedLanes.forEach((lane) => {
    const useObstacle = Math.random() < difficulty.obstacleChance;
    entities.push(
      useObstacle
        ? createObstacle(memory, lane, difficulty.stage)
        : createCollectible(memory, lane, difficulty.stage),
    );
  });

  if (Math.random() < difficulty.collectibleChance) {
    entities.push(createCollectible(memory, safeLane, difficulty.stage, true));
  }

  memory.lastKinds = entities.map((entity) => entity.kind).slice(-5);
  return entities;
}

function createObstacle(memory: SpawnMemory, lane: RunnerLane, stage: RunnerStage): RunnerEntity {
  const kind = pickObstacleKind(stage, memory.lastKinds);
  const isIce = kind === "ice";
  return {
    id: memory.nextId++,
    lane,
    y: 30,
    type: isIce ? "hazard" : "obstacle",
    kind,
    width: isIce ? 0.76 : 0.68,
    height: isIce ? 0.24 : 0.56,
  };
}

function createCollectible(
  memory: SpawnMemory,
  lane: RunnerLane,
  stage: RunnerStage,
  preferred = false,
): RunnerEntity {
  const kind = pickCollectibleKind(stage, preferred);
  return {
    id: memory.nextId++,
    lane,
    y: preferred ? 25 : 30,
    type: "collectible",
    kind,
    points: RUNNER_COLLECTIBLE_POINTS[kind],
    width: 0.42,
    height: 0.36,
  };
}

function pickObstacleKind(stage: RunnerStage, lastKinds: string[]): RunnerObstacleKind {
  const pool: RunnerObstacleKind[] =
    stage === "legendaryDriver"
      ? ["sedan", "suv", "pickup", "liftedTruck", "construction", "ice"]
      : stage === "utahChaos"
        ? ["sedan", "suv", "pickup", "construction", "ice"]
        : stage === "trafficBuilds"
          ? ["sedan", "suv", "pickup", "construction", "ice"]
          : ["sedan", "suv", "construction"];

  const filtered = pool.filter((kind) => !lastKinds.includes(kind));
  const candidates = filtered.length > 0 ? filtered : pool;
  const rareRoll = Math.random();

  if (stage === "legendaryDriver" && rareRoll > 0.985) return "moose";
  if ((stage === "utahChaos" || stage === "legendaryDriver") && rareRoll > 0.965) return "deer";
  if ((stage === "utahChaos" || stage === "legendaryDriver") && rareRoll > 0.88) {
    return "liftedTruck";
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickCollectibleKind(stage: RunnerStage, preferred: boolean): RunnerCollectibleKind {
  const roll = Math.random();

  if (stage === "legendaryDriver" && roll > 0.96) return "vipRide";
  if (
    (stage === "trafficBuilds" || stage === "utahChaos" || stage === "legendaryDriver") &&
    roll > 0.82
  ) {
    return "airportRide";
  }
  if (preferred && roll > 0.56) return "passengerPickup";
  if (stage === "warmRide" && roll > 0.72) return "passengerPickup";
  return "reputationStar";
}

function pickUniqueLanes(count: 1 | 2): RunnerLane[] {
  const lanes: RunnerLane[] = [0, 1, 2];
  const first = lanes.splice(Math.floor(Math.random() * lanes.length), 1)[0];
  if (count === 1) return [first];
  const second = lanes.splice(Math.floor(Math.random() * lanes.length), 1)[0];
  return [first, second];
}

function pickSafeLane(blockedLanes: RunnerLane[]): RunnerLane {
  const lanes: RunnerLane[] = [0, 1, 2];
  const safeLanes = lanes.filter((lane) => !blockedLanes.includes(lane));
  return safeLanes[Math.floor(Math.random() * safeLanes.length)] ?? 1;
}
