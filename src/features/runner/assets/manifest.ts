import constructionBarrier from "./sprites/construction_barrier.webp";
import coneCluster from "./sprites/cone_cluster.webp";
import crashFlash from "./sprites/crash_flash.webp";
import deer from "./sprites/deer.webp";
import icePatch from "./sprites/ice_patch.webp";
import liftedTruck from "./sprites/lifted_truck.webp";
import moose from "./sprites/moose.webp";
import mountainFar from "./sprites/mountain_background_far.webp";
import mountainNear from "./sprites/mountain_background_near.webp";
import airportRide from "./sprites/airport_ride.webp";
import collectGlow from "./sprites/collect_glow.webp";
import passengerPickup from "./sprites/passenger_pickup.webp";
import playerRav4Rear from "./sprites/player_rav4_rear.webp";
import playerRav4RearDamaged from "./sprites/player_rav4_rear_damaged.webp";
import reputationStar from "./sprites/reputation_star.webp";
import roadEdgeAlt from "./sprites/road_edge_alt.webp";
import roadTexture from "./sprites/road_texture.webp";
import horizonLogo from "./horizon_logo.webp";
import scoreCardFrame from "./sprites/horizon_score_card.webp";
import shadowSoft from "./sprites/shadow_soft.webp";
import skidMarksAlt from "./sprites/skid_marks_alt.webp";
import trafficPickup from "./sprites/traffic_pickup.webp";
import trafficSedan from "./sprites/traffic_sedan.webp";
import trafficSuv from "./sprites/traffic_suv.webp";
import vipRide from "./sprites/vip_ride.webp";
import asphaltTextureClean from "./asphalt_texture_clean.webp";
import horizonGroundBlend2 from "./horizon_ground_blend2.webp";
import roadShoulderLeft from "./road_shoulder_left.webp";
import roadShoulderRight from "./road_shoulder_right.webp";
import roadsideRockCluster from "./roadside_rock_cluster.webp";
import roadsideScrub01 from "./roadside_scrub_01.webp";
import roadsideScrub02 from "./roadside_scrub_02.webp";
import roadsideTreeCluster01 from "./roadside_tree_cluster_01.webp";
import sedanVip from "./sprites/sedan_vip.webp";
import trafficPickupSilver from "./sprites/traffic_pickup_silver.webp";
import trafficSport from "./sprites/traffic_sport.webp";

import altImg from "./alt_img.webp";
import asphaltTextureClean2 from "./asphalt_texture_clean2.webp";
import constructionBarrierAlt from "./sprites/construction_barrier_alt.webp";
import bidonNafta from "./sprites/bidon_nafta.webp";
import horizonGroundBlend from "./horizon_ground_blend.webp";
import liftedTruckSliding from "./sprites/lifted_truck_sliding.webp";
import mooseAlt from "./sprites/moose_alt.webp";
import roadEdgeLeft from "./sprites/road_edge_left.webp";
import roadEdgeRight from "./sprites/road_edge_right.webp";
import roadShoulderBoth from "./road_shoulder_both.webp";
import roadsideScrubVarios from "./roadside_scrub_varios.webp";
import skidMarks from "./sprites/skid_marks.webp";
import trafficSedanClassic from "./sprites/traffic_sedan_classic.webp";

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
  horizonLogo,
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
