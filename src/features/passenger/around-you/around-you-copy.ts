import type { AroundYouLanguage, PassengerLocationStatus } from "./around-you-types";

export const aroundYouCopy = {
  en: {
    eyebrow: "Your local guide",
    title: "Around You",
    homeDescription: "Discover the places passing by your window.",
    open: "Explore",
    back: "Back to Home",
    featured: "Right around you",
    nearby: "Nearby",
    noMatch: "Keep moving — a local story will appear when one is nearby.",
    fallbackTitle: "Explore Utah",
    fallbackDescription: "Location context is unavailable, but local discovery is still here.",
    status: {
      idle: "Local discovery is ready when enabled.",
      requesting: "Finding where the tablet is…",
      ready: "Live local context",
      degraded: "Using the last reliable location",
      stale: "Waiting for a fresh GPS signal",
      denied: "Location permission is off",
      unavailable: "GPS is temporarily unavailable",
      unsupported: "Location is not supported in this browser",
    } satisfies Record<PassengerLocationStatus, string>,
  },
  es: {
    eyebrow: "Tu guía local",
    title: "A tu alrededor",
    homeDescription: "Descubre los lugares que pasan por tu ventana.",
    open: "Explorar",
    back: "Volver a Inicio",
    featured: "Justo a tu alrededor",
    nearby: "Cerca de aquí",
    noMatch: "Sigue avanzando: aparecerá una historia local cuando haya una cerca.",
    fallbackTitle: "Explora Utah",
    fallbackDescription:
      "El contexto de ubicación no está disponible, pero aún puedes descubrir Utah.",
    status: {
      idle: "El descubrimiento local estará listo cuando se active.",
      requesting: "Buscando la ubicación de la tablet…",
      ready: "Contexto local en vivo",
      degraded: "Usando la última ubicación confiable",
      stale: "Esperando una señal GPS reciente",
      denied: "El permiso de ubicación está desactivado",
      unavailable: "El GPS no está disponible temporalmente",
      unsupported: "Este navegador no admite ubicación",
    } satisfies Record<PassengerLocationStatus, string>,
  },
} as const satisfies Record<AroundYouLanguage, unknown>;
