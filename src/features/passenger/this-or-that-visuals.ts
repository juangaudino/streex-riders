import alpineLake from "@/assets/passenger-games/this-or-that/alpine-lake.webp";
import alpineSnow from "@/assets/passenger-games/this-or-that/alpine-snow.webp";
import cityViolet from "@/assets/passenger-games/this-or-that/city-violet.webp";
import coffeeDawn from "@/assets/passenger-games/this-or-that/coffee-dawn.webp";
import desertCampfire from "@/assets/passenger-games/this-or-that/desert-campfire.webp";
import desertSunrise from "@/assets/passenger-games/this-or-that/desert-sunrise.webp";
import goldenDrive from "@/assets/passenger-games/this-or-that/golden-drive.webp";
import mountainLodge from "@/assets/passenger-games/this-or-that/mountain-lodge.webp";
import musicRoom from "@/assets/passenger-games/this-or-that/music-room.webp";
import nightMarket from "@/assets/passenger-games/this-or-that/night-market.webp";
import nightTeal from "@/assets/passenger-games/this-or-that/night-teal.webp";
import wildflowerTrail from "@/assets/passenger-games/this-or-that/wildflower-trail.webp";
import type { ThisOrThatVisualKey } from "./this-or-that";

export type ThisOrThatVisual = {
  src: string;
  objectPosition: string;
  accent: "amber" | "coral" | "alpine" | "teal" | "violet";
};

export const THIS_OR_THAT_VISUALS: Record<ThisOrThatVisualKey, ThisOrThatVisual> = {
  desertSunrise: {
    src: desertSunrise,
    objectPosition: "52% center",
    accent: "coral",
  },
  alpineSnow: {
    src: alpineSnow,
    objectPosition: "50% center",
    accent: "alpine",
  },
  cityViolet: {
    src: cityViolet,
    objectPosition: "50% center",
    accent: "violet",
  },
  goldenDrive: {
    src: goldenDrive,
    objectPosition: "54% center",
    accent: "amber",
  },
  nightTeal: {
    src: nightTeal,
    objectPosition: "50% center",
    accent: "teal",
  },
  coffeeDawn: {
    src: coffeeDawn,
    objectPosition: "50% center",
    accent: "coral",
  },
  mountainLodge: {
    src: mountainLodge,
    objectPosition: "50% center",
    accent: "amber",
  },
  desertCampfire: {
    src: desertCampfire,
    objectPosition: "52% center",
    accent: "coral",
  },
  alpineLake: {
    src: alpineLake,
    objectPosition: "52% center",
    accent: "alpine",
  },
  wildflowerTrail: {
    src: wildflowerTrail,
    objectPosition: "50% center",
    accent: "coral",
  },
  musicRoom: {
    src: musicRoom,
    objectPosition: "50% center",
    accent: "violet",
  },
  nightMarket: {
    src: nightMarket,
    objectPosition: "50% center",
    accent: "teal",
  },
};

export const THIS_OR_THAT_TRAILER_VISUALS = [
  THIS_OR_THAT_VISUALS.desertSunrise,
  THIS_OR_THAT_VISUALS.cityViolet,
  THIS_OR_THAT_VISUALS.musicRoom,
] as const;
