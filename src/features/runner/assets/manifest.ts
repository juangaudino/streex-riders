import constructionBarrier from "./sprites/construction_barrier.png";
import coneCluster from "./sprites/cone_cluster.png";
import crashFlash from "./sprites/crash_flash.png";
import deer from "./sprites/deer.png";
import icePatch from "./sprites/ice_patch.png";
import liftedTruck from "./sprites/lifted_truck.png";
import moose from "./sprites/moose.png";
import mountainFar from "./sprites/mountain_background_far.png";
import mountainNear from "./sprites/mountain_background_near.png";
import airportRide from "./sprites/airport_ride.png";
import collectGlow from "./sprites/collect_glow.png";
import passengerPickup from "./sprites/passenger_pickup.png";
import playerRav4Rear from "./sprites/player_rav4_rear.png";
import playerRav4RearDamaged from "./sprites/player_rav4_rear_damaged.png";
import reputationStar from "./sprites/reputation_star.png";
import roadEdgeAlt from "./sprites/road_edge_alt.png";
import roadTexture from "./sprites/road_texture.png";
import scoreCardFrame from "./sprites/score_card_frame.png";
import shadowSoft from "./sprites/shadow_soft.png";
import skidMarksAlt from "./sprites/skid_marks_alt.png";
import trafficPickup from "./sprites/traffic_pickup.png";
import trafficSedan from "./sprites/traffic_sedan.png";
import trafficSuv from "./sprites/traffic_suv.png";
import vipRide from "./sprites/vip_ride.png";
import asphaltTextureClean from "./asphalt_texture_clean.png";
import horizonGroundBlend2 from "./horizon_ground_blend2.png";
import roadShoulderLeft from "./road_shoulder_left.png";
import roadShoulderRight from "./road_shoulder_right.png";
import roadsideRockCluster from "./roadside_rock_cluster.png";
import roadsideScrub01 from "./roadside_scrub_01.png";
import roadsideScrub02 from "./roadside_scrub_02.png";
import roadsideTreeCluster01 from "./roadside_tree_cluster_01.png";
import sedanVip from "./sprites/sedan_vip.png";
import trafficPickupSilver from "./sprites/traffic_pickup_silver.png";
import trafficSport from "./sprites/traffic_sport.png";

import altImg from "./alt_img.png";
import asphaltTextureClean2 from "./asphalt_texture_clean2.png";
import constructionBarrierAlt from "./sprites/construction_barrier_alt.png";
import bidonNafta from "./sprites/bidon_nafta.png";
import horizonGroundBlend from "./horizon_ground_blend.png";
import liftedTruckSliding from "./sprites/lifted_truck_sliding.png";
import mooseAlt from "./sprites/moose_alt.png";
import roadEdgeLeft from "./sprites/road_edge_left.png";
import roadEdgeRight from "./sprites/road_edge_right.png";
import roadShoulderBoth from "./road_shoulder_both.png";
import roadsideScrubVarios from "./roadside_scrub_varios.png";
import skidMarks from "./sprites/skid_marks.png";
import trafficSedanClassic from "./sprites/traffic_sedan_classic.png";

export const RUNNER_SPRITES = {
  airportRide,
  asphaltTextureClean,
  collectGlow,
  coneCluster,
  constructionBarrier,
  crashFlash,
  deer,
  icePatch,
  liftedTruck,
  moose,
  mountainFar,
  mountainNear,
  horizonGroundBlend2,
  passengerPickup,
  playerRav4Rear,
  playerRav4RearDamaged,
  reputationStar,
  roadEdgeAlt,
  roadTexture,
  roadShoulderLeft,
  roadShoulderRight,
  roadsideRockCluster,
  roadsideScrub01,
  roadsideScrub02,
  roadsideTreeCluster01,
  sedanVip,
  scoreCardFrame,
  shadowSoft,
  skidMarksAlt,
  trafficPickup,
  trafficPickupSilver,
  trafficSedan,
  trafficSport,
  trafficSuv,
  vipRide,
};

export const RUNNER_EXTRA_SPRITES = {
  altImg,
  asphaltTextureClean2,
  bidonNafta,
  constructionBarrierAlt,
  horizonGroundBlend,
  liftedTruckSliding,
  mooseAlt,
  roadEdgeLeft,
  roadEdgeRight,
  roadShoulderBoth,
  roadsideScrubVarios,
  skidMarks,
  trafficSedanClassic,
};

export type RunnerSpriteKey = keyof typeof RUNNER_SPRITES;
