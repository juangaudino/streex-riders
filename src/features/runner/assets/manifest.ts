import constructionBarrier from "./sprites/construction_barrier.png";
import icePatch from "./sprites/ice_patch.png";
import mountainFar from "./sprites/mountain_background_far.png";
import mountainNear from "./sprites/mountain_background_near.png";
import passengerPickup from "./sprites/passenger_pickup.png";
import playerRav4Rear from "./sprites/player_rav4_rear.png";
import reputationStar from "./sprites/reputation_star.png";
import roadTexture from "./sprites/road_texture.png";
import trafficSedan from "./sprites/traffic_sedan.png";

export const RUNNER_SPRITES = {
  constructionBarrier,
  icePatch,
  mountainFar,
  mountainNear,
  passengerPickup,
  playerRav4Rear,
  reputationStar,
  roadTexture,
  trafficSedan,
};

export type RunnerSpriteKey = keyof typeof RUNNER_SPRITES;
