import alpineLake from "@/assets/passenger-games/this-or-that/alpine-lake.webp";
import alpineSpa from "@/assets/passenger-games/this-or-that/alpine-spa.webp";
import alpineSnow from "@/assets/passenger-games/this-or-that/alpine-snow.webp";
import canyonTrail from "@/assets/passenger-games/this-or-that/canyon-trail.webp";
import cityBoulevard from "@/assets/passenger-games/this-or-that/city-boulevard.webp";
import cityViolet from "@/assets/passenger-games/this-or-that/city-violet.webp";
import coffeeDawn from "@/assets/passenger-games/this-or-that/coffee-dawn.webp";
import desertCampfire from "@/assets/passenger-games/this-or-that/desert-campfire.webp";
import desertSunrise from "@/assets/passenger-games/this-or-that/desert-sunrise.webp";
import eveningReservation from "@/assets/passenger-games/this-or-that/evening-reservation.webp";
import goldenDrive from "@/assets/passenger-games/this-or-that/golden-drive.webp";
import hiddenCourtyard from "@/assets/passenger-games/this-or-that/hidden-courtyard.webp";
import localBakery from "@/assets/passenger-games/this-or-that/local-bakery.webp";
import localFestival from "@/assets/passenger-games/this-or-that/local-festival.webp";
import mountainLodge from "@/assets/passenger-games/this-or-that/mountain-lodge.webp";
import mountainTown from "@/assets/passenger-games/this-or-that/mountain-town.webp";
import musicRoom from "@/assets/passenger-games/this-or-that/music-room.webp";
import neighborhoodDusk from "@/assets/passenger-games/this-or-that/neighborhood-dusk.webp";
import nightTeal from "@/assets/passenger-games/this-or-that/night-teal.webp";
import paperMap from "@/assets/passenger-games/this-or-that/paper-map.webp";
import passengerWindow from "@/assets/passenger-games/this-or-that/passenger-window.webp";
import readingNook from "@/assets/passenger-games/this-or-that/reading-nook.webp";
import roadsideDiner from "@/assets/passenger-games/this-or-that/roadside-diner.webp";
import sunroofDrive from "@/assets/passenger-games/this-or-that/sunroof-drive.webp";
import viewpointCamera from "@/assets/passenger-games/this-or-that/viewpoint-camera.webp";
import vinylRitual from "@/assets/passenger-games/this-or-that/vinyl-ritual.webp";
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
  canyonTrail: {
    src: canyonTrail,
    objectPosition: "66% center",
    accent: "coral",
  },
  roadsideDiner: {
    src: roadsideDiner,
    objectPosition: "51% center",
    accent: "coral",
  },
  eveningReservation: {
    src: eveningReservation,
    objectPosition: "52% center",
    accent: "amber",
  },
  alpineSpa: {
    src: alpineSpa,
    objectPosition: "61% center",
    accent: "teal",
  },
  readingNook: {
    src: readingNook,
    objectPosition: "47% center",
    accent: "alpine",
  },
  sunroofDrive: {
    src: sunroofDrive,
    objectPosition: "50% center",
    accent: "alpine",
  },
  paperMap: {
    src: paperMap,
    objectPosition: "53% center",
    accent: "amber",
  },
  passengerWindow: {
    src: passengerWindow,
    objectPosition: "60% center",
    accent: "alpine",
  },
  cityBoulevard: {
    src: cityBoulevard,
    objectPosition: "50% center",
    accent: "violet",
  },
  mountainTown: {
    src: mountainTown,
    objectPosition: "50% center",
    accent: "alpine",
  },
  localFestival: {
    src: localFestival,
    objectPosition: "52% center",
    accent: "coral",
  },
  vinylRitual: {
    src: vinylRitual,
    objectPosition: "56% center",
    accent: "violet",
  },
  localBakery: {
    src: localBakery,
    objectPosition: "47% center",
    accent: "amber",
  },
  viewpointCamera: {
    src: viewpointCamera,
    objectPosition: "58% center",
    accent: "coral",
  },
  neighborhoodDusk: {
    src: neighborhoodDusk,
    objectPosition: "54% center",
    accent: "teal",
  },
  hiddenCourtyard: {
    src: hiddenCourtyard,
    objectPosition: "48% center",
    accent: "coral",
  },
};

export const THIS_OR_THAT_TRAILER_VISUALS = [
  THIS_OR_THAT_VISUALS.canyonTrail,
  THIS_OR_THAT_VISUALS.cityBoulevard,
  THIS_OR_THAT_VISUALS.vinylRitual,
] as const;

const preloadedVisualSources = new Set<string>();

export function preloadThisOrThatVisuals(
  options: ReadonlyArray<Pick<{ visualKey: ThisOrThatVisualKey }, "visualKey">>,
) {
  if (typeof window === "undefined") return;

  for (const { visualKey } of options) {
    const visual = THIS_OR_THAT_VISUALS[visualKey];
    if (!visual || preloadedVisualSources.has(visual.src)) continue;

    preloadedVisualSources.add(visual.src);
    const image = new Image();
    image.decoding = "async";
    image.src = visual.src;
    void image.decode?.().catch(() => undefined);
  }
}
