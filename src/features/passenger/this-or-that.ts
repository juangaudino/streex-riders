import type { TriviaLanguage } from "./utah-trivia";

export type RideVibe = "explorer" | "comfort" | "roadTrip";
export type LocalizedChoiceText = Record<TriviaLanguage, string>;

export type ThisOrThatOption = {
  label: LocalizedChoiceText;
  vibe: RideVibe;
};

export type ThisOrThatQuestion = {
  id: string;
  category: LocalizedChoiceText;
  prompt: LocalizedChoiceText;
  options: [ThisOrThatOption, ThisOrThatOption];
};

const localized = (en: string, es: string): LocalizedChoiceText => ({ en, es });

export const THIS_OR_THAT_QUESTIONS: ThisOrThatQuestion[] = [
  {
    id: "sunrise-or-brunch",
    category: localized("Utah morning", "Mañana en Utah"),
    prompt: localized("Your perfect morning starts with…", "Tu mañana perfecta comienza con…"),
    options: [
      { label: localized("A sunrise hike", "Una caminata al amanecer"), vibe: "explorer" },
      { label: localized("A slow brunch", "Un brunch tranquilo"), vibe: "comfort" },
    ],
  },
  {
    id: "scenic-or-direct",
    category: localized("On the road", "En el camino"),
    prompt: localized("Which route would you choose?", "¿Qué ruta elegirías?"),
    options: [
      { label: localized("The scenic detour", "El desvío panorámico"), vibe: "explorer" },
      {
        label: localized("The smooth direct route", "La ruta directa y tranquila"),
        vibe: "comfort",
      },
    ],
  },
  {
    id: "windows-or-climate",
    category: localized("Ride mode", "Modo de viaje"),
    prompt: localized("For the next stretch of road…", "Para el próximo tramo del viaje…"),
    options: [
      { label: localized("Windows down", "Ventanas abiertas"), vibe: "roadTrip" },
      { label: localized("Perfect climate control", "Climatización perfecta"), vibe: "comfort" },
    ],
  },
  {
    id: "canyon-or-city",
    category: localized("Utah views", "Vistas de Utah"),
    prompt: localized("Pick the view outside your window.", "Elige la vista desde tu ventana."),
    options: [
      { label: localized("Red-rock canyons", "Cañones de roca roja"), vibe: "explorer" },
      { label: localized("Salt Lake City lights", "Luces de Salt Lake City"), vibe: "roadTrip" },
    ],
  },
  {
    id: "classics-or-new",
    category: localized("Soundtrack", "Banda sonora"),
    prompt: localized("What gets the first play?", "¿Qué suena primero?"),
    options: [
      { label: localized("Road-trip classics", "Clásicos de carretera"), vibe: "roadTrip" },
      { label: localized("Something brand new", "Algo totalmente nuevo"), vibe: "explorer" },
    ],
  },
  {
    id: "mountain-or-desert",
    category: localized("Utah escape", "Escapada en Utah"),
    prompt: localized("Choose a weekend landscape.", "Elige un paisaje para el fin de semana."),
    options: [
      { label: localized("Snowy mountains", "Montañas nevadas"), vibe: "comfort" },
      { label: localized("Open desert", "Desierto abierto"), vibe: "explorer" },
    ],
  },
  {
    id: "coffee-or-snacks",
    category: localized("Road fuel", "Energía para el viaje"),
    prompt: localized("One stop before the highway…", "Una parada antes de la carretera…"),
    options: [
      { label: localized("Great coffee", "Un buen café"), vibe: "comfort" },
      { label: localized("Classic road snacks", "Snacks clásicos de viaje"), vibe: "roadTrip" },
    ],
  },
  {
    id: "plan-or-surprise",
    category: localized("Travel style", "Estilo de viaje"),
    prompt: localized("How do you like your day?", "¿Cómo prefieres organizar tu día?"),
    options: [
      { label: localized("Everything planned", "Todo planificado"), vibe: "comfort" },
      {
        label: localized("Leave room for surprises", "Dejar espacio para sorpresas"),
        vibe: "explorer",
      },
    ],
  },
  {
    id: "sing-or-listen",
    category: localized("Soundtrack", "Banda sonora"),
    prompt: localized("When your favorite song starts…", "Cuando comienza tu canción favorita…"),
    options: [
      { label: localized("Sing every word", "Cantar cada palabra"), vibe: "roadTrip" },
      { label: localized("Lean back and listen", "Recostarte y escuchar"), vibe: "comfort" },
    ],
  },
  {
    id: "local-or-favorite",
    category: localized("Food stop", "Parada para comer"),
    prompt: localized("What sounds better right now?", "¿Qué suena mejor ahora?"),
    options: [
      { label: localized("Try a local spot", "Probar un lugar local"), vibe: "explorer" },
      { label: localized("Order a familiar favorite", "Pedir algo conocido"), vibe: "comfort" },
    ],
  },
  {
    id: "photo-or-moment",
    category: localized("Scenic stop", "Parada panorámica"),
    prompt: localized("At an incredible viewpoint…", "Frente a una vista increíble…"),
    options: [
      { label: localized("Take the perfect photo", "Tomar la foto perfecta"), vibe: "explorer" },
      {
        label: localized("Just enjoy the moment", "Simplemente disfrutar el momento"),
        vibe: "comfort",
      },
    ],
  },
  {
    id: "day-or-night",
    category: localized("Drive time", "Hora de conducir"),
    prompt: localized("Which drive has the better energy?", "¿Qué viaje tiene mejor energía?"),
    options: [
      { label: localized("Golden-hour drive", "Viaje durante la hora dorada"), vibe: "explorer" },
      { label: localized("Late-night drive", "Viaje nocturno"), vibe: "roadTrip" },
    ],
  },
  {
    id: "conversation-or-quiet",
    category: localized("Ride mood", "Ambiente del viaje"),
    prompt: localized("Set the mood for the ride.", "Elige el ambiente para el viaje."),
    options: [
      { label: localized("Good conversation", "Una buena conversación"), vibe: "roadTrip" },
      { label: localized("Peaceful quiet", "Silencio y tranquilidad"), vibe: "comfort" },
    ],
  },
  {
    id: "park-city-or-moab",
    category: localized("Utah getaway", "Escapada en Utah"),
    prompt: localized("Pick your next Utah escape.", "Elige tu próxima escapada en Utah."),
    options: [
      { label: localized("Park City weekend", "Fin de semana en Park City"), vibe: "comfort" },
      { label: localized("Moab adventure", "Aventura en Moab"), vibe: "explorer" },
    ],
  },
  {
    id: "playlist-or-radio",
    category: localized("Soundtrack", "Banda sonora"),
    prompt: localized("Who chooses what plays next?", "¿Quién elige lo que suena después?"),
    options: [
      { label: localized("My perfect playlist", "Mi playlist perfecta"), vibe: "comfort" },
      {
        label: localized("Let the music surprise me", "Que la música me sorprenda"),
        vibe: "roadTrip",
      },
    ],
  },
  {
    id: "one-more-stop",
    category: localized("End of the day", "Final del día"),
    prompt: localized("The ride is almost over…", "El viaje está por terminar…"),
    options: [
      {
        label: localized("One more spontaneous stop", "Una parada espontánea más"),
        vibe: "explorer",
      },
      { label: localized("Head somewhere cozy", "Ir a un lugar acogedor"), vibe: "comfort" },
    ],
  },
  {
    id: "solo-or-friends",
    category: localized("Travel company", "Compañía de viaje"),
    prompt: localized("Your ideal road trip is…", "Tu viaje ideal por carretera es…"),
    options: [
      {
        label: localized("A peaceful solo escape", "Una escapada tranquila a solas"),
        vibe: "comfort",
      },
      { label: localized("A car full of friends", "Un auto lleno de amigos"), vibe: "roadTrip" },
    ],
  },
  {
    id: "map-or-instinct",
    category: localized("Navigation", "Navegación"),
    prompt: localized("When exploring somewhere new…", "Cuando exploras un lugar nuevo…"),
    options: [
      { label: localized("Follow the map", "Seguir el mapa"), vibe: "comfort" },
      { label: localized("Follow your curiosity", "Seguir tu curiosidad"), vibe: "explorer" },
    ],
  },
];

export function createChoiceRound(
  questions: readonly ThisOrThatQuestion[] = THIS_OR_THAT_QUESTIONS,
  count = 10,
  random: () => number = Math.random,
): ThisOrThatQuestion[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}

export function calculateRideVibe(selections: readonly RideVibe[]): RideVibe {
  const scores: Record<RideVibe, number> = { explorer: 0, comfort: 0, roadTrip: 0 };
  selections.forEach((vibe) => {
    scores[vibe] += 1;
  });
  const highestScore = Math.max(...Object.values(scores));
  const leaders = (Object.keys(scores) as RideVibe[]).filter(
    (vibe) => scores[vibe] === highestScore,
  );

  for (let index = selections.length - 1; index >= 0; index -= 1) {
    if (leaders.includes(selections[index])) return selections[index];
  }

  return "roadTrip";
}
