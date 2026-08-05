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
  {
    id: "window-seat-or-aisle",
    category: localized("Travel instinct", "Instinto viajero"),
    prompt: localized("On any trip, you are choosing…", "En cualquier viaje, tú eliges…"),
    options: [
      { label: localized("The window seat", "El asiento junto a la ventana"), vibe: "explorer" },
      { label: localized("The aisle seat", "El asiento del pasillo"), vibe: "comfort" },
    ],
  },
  {
    id: "sunset-or-city-lights",
    category: localized("Best view", "Mejor vista"),
    prompt: localized(
      "Which view makes you stop for a second?",
      "¿Qué vista te hace detenerte un segundo?",
    ),
    options: [
      { label: localized("A wide-open sunset", "Un atardecer abierto"), vibe: "explorer" },
      {
        label: localized("City lights after dark", "Luces de ciudad al anochecer"),
        vibe: "roadTrip",
      },
    ],
  },
  {
    id: "mountain-town-or-downtown",
    category: localized("Weekend plan", "Plan de fin de semana"),
    prompt: localized("Pick the weekend atmosphere.", "Elige el ambiente del fin de semana."),
    options: [
      {
        label: localized("A quiet mountain town", "Un tranquilo pueblo de montaña"),
        vibe: "comfort",
      },
      { label: localized("A lively downtown", "Un centro animado"), vibe: "roadTrip" },
    ],
  },
  {
    id: "first-light-or-last-light",
    category: localized("Golden hours", "Horas doradas"),
    prompt: localized(
      "Which part of the day feels more yours?",
      "¿Qué parte del día se siente más tuya?",
    ),
    options: [
      { label: localized("First light", "La primera luz del día"), vibe: "explorer" },
      { label: localized("Last light", "La última luz del día"), vibe: "roadTrip" },
    ],
  },
  {
    id: "treat-or-takeout",
    category: localized("Little luxury", "Pequeño lujo"),
    prompt: localized("What improves the ride instantly?", "¿Qué mejora el viaje al instante?"),
    options: [
      { label: localized("A favorite local treat", "Un antojo local favorito"), vibe: "explorer" },
      {
        label: localized("Comfort food to-go", "Comida reconfortante para llevar"),
        vibe: "comfort",
      },
    ],
  },
  {
    id: "dj-or-discover",
    category: localized("Music mode", "Modo música"),
    prompt: localized("For the next song, you would…", "Para la próxima canción, tú…"),
    options: [
      { label: localized("Hand over the aux", "Tomar el control de la música"), vibe: "roadTrip" },
      { label: localized("Discover something new", "Descubrir algo nuevo"), vibe: "explorer" },
    ],
  },
  {
    id: "lodge-or-campfire",
    category: localized("Mountain evening", "Noche de montaña"),
    prompt: localized(
      "After a day outside, choose your reset.",
      "Después de un día al aire libre, elige tu descanso.",
    ),
    options: [
      { label: localized("A warm lodge", "Un lodge acogedor"), vibe: "comfort" },
      {
        label: localized("A campfire under stars", "Una fogata bajo las estrellas"),
        vibe: "explorer",
      },
    ],
  },
  {
    id: "festival-or-hidden-gem",
    category: localized("Local plans", "Planes locales"),
    prompt: localized(
      "What would you rather find tonight?",
      "¿Qué preferirías encontrar esta noche?",
    ),
    options: [
      { label: localized("A local festival", "Un festival local"), vibe: "roadTrip" },
      { label: localized("A hidden gem", "Una joya escondida"), vibe: "explorer" },
    ],
  },
  {
    id: "slow-morning-or-big-day",
    category: localized("Day ahead", "El día que viene"),
    prompt: localized("How does your ideal day begin?", "¿Cómo comienza tu día ideal?"),
    options: [
      { label: localized("Coffee and no rush", "Café y sin apuro"), vibe: "comfort" },
      {
        label: localized("A full plan from the start", "Un plan completo desde el inicio"),
        vibe: "explorer",
      },
    ],
  },
  {
    id: "lake-or-trail",
    category: localized("Fresh air", "Aire libre"),
    prompt: localized(
      "Where are you spending a free afternoon?",
      "¿Dónde pasarías una tarde libre?",
    ),
    options: [
      { label: localized("By a quiet lake", "Junto a un lago tranquilo"), vibe: "comfort" },
      { label: localized("On a new trail", "En un sendero nuevo"), vibe: "explorer" },
    ],
  },
  {
    id: "lyrics-or-beat",
    category: localized("Soundtrack", "Banda sonora"),
    prompt: localized(
      "What pulls you into a song first?",
      "¿Qué te atrapa primero en una canción?",
    ),
    options: [
      { label: localized("The lyrics", "La letra"), vibe: "comfort" },
      { label: localized("The beat", "El ritmo"), vibe: "roadTrip" },
    ],
  },
  {
    id: "small-group-or-new-faces",
    category: localized("Good company", "Buena compañía"),
    prompt: localized("For a great night out…", "Para una gran noche fuera…"),
    options: [
      {
        label: localized("A small familiar group", "Un grupo pequeño y conocido"),
        vibe: "comfort",
      },
      { label: localized("Meet new people", "Conocer gente nueva"), vibe: "roadTrip" },
    ],
  },
  {
    id: "roadside-or-reservation",
    category: localized("Food stop", "Parada para comer"),
    prompt: localized("Choose the meal worth the detour.", "Elige la comida que vale el desvío."),
    options: [
      { label: localized("A roadside classic", "Un clásico de carretera"), vibe: "roadTrip" },
      { label: localized("A perfect reservation", "Una reserva perfecta"), vibe: "comfort" },
    ],
  },
  {
    id: "canyon-walk-or-spa-day",
    category: localized("Recharge", "Recargar energía"),
    prompt: localized("Your version of recharging is…", "Tu forma de recargar energía es…"),
    options: [
      { label: localized("A canyon walk", "Una caminata por el cañón"), vibe: "explorer" },
      { label: localized("A slow spa day", "Un relajado día de spa"), vibe: "comfort" },
    ],
  },
  {
    id: "backroads-or-boulevard",
    category: localized("Driving style", "Estilo al viajar"),
    prompt: localized(
      "Pick the road with the better story.",
      "Elige el camino con mejor historia.",
    ),
    options: [
      { label: localized("The backroads", "Los caminos secundarios"), vibe: "explorer" },
      { label: localized("The city boulevard", "El boulevard de la ciudad"), vibe: "roadTrip" },
    ],
  },
  {
    id: "read-or-look-out",
    category: localized("Passenger mode", "Modo pasajero"),
    prompt: localized("During a peaceful ride, you are…", "Durante un viaje tranquilo, tú…"),
    options: [
      { label: localized("Reading something good", "Lees algo bueno"), vibe: "comfort" },
      { label: localized("Watching the world go by", "Miras pasar el mundo"), vibe: "explorer" },
    ],
  },
  {
    id: "spontaneous-or-signature",
    category: localized("Best kind of memory", "Mejor tipo de recuerdo"),
    prompt: localized("The best stories begin with…", "Las mejores historias comienzan con…"),
    options: [
      { label: localized("An unexpected turn", "Un giro inesperado"), vibe: "explorer" },
      { label: localized("A favorite tradition", "Una tradición favorita"), vibe: "comfort" },
    ],
  },
  {
    id: "local-guide-or-go-with-it",
    category: localized("New city", "Ciudad nueva"),
    prompt: localized("When you arrive somewhere new…", "Cuando llegas a un lugar nuevo…"),
    options: [
      {
        label: localized(
          "Ask a local for the secret spot",
          "Preguntas a alguien local por el lugar secreto",
        ),
        vibe: "explorer",
      },
      {
        label: localized("Follow the plan that already works", "Sigues el plan que ya funciona"),
        vibe: "comfort",
      },
    ],
  },
  {
    id: "singalong-or-sunroof",
    category: localized("Ride energy", "Energía de viaje"),
    prompt: localized(
      "Choose the moment that feels most alive.",
      "Elige el momento que se siente más vivo.",
    ),
    options: [
      { label: localized("A full-car singalong", "Todos cantando en el auto"), vibe: "roadTrip" },
      { label: localized("The sunroof open", "El techo solar abierto"), vibe: "explorer" },
    ],
  },
  {
    id: "sweater-or-jacket",
    category: localized("Mountain weather", "Clima de montaña"),
    prompt: localized("Pack one layer for the day.", "Empaca una capa para el día."),
    options: [
      { label: localized("Your softest sweater", "Tu suéter más suave"), vibe: "comfort" },
      {
        label: localized("A ready-for-anything jacket", "Una chaqueta lista para todo"),
        vibe: "explorer",
      },
    ],
  },
  {
    id: "neighborhood-or-new-route",
    category: localized("After the ride", "Después del viaje"),
    prompt: localized(
      "Where should the day take you next?",
      "¿Adónde debería llevarte el día ahora?",
    ),
    options: [
      { label: localized("Your favorite neighborhood", "Tu vecindario favorito"), vibe: "comfort" },
      {
        label: localized("A route you have not tried", "Una ruta que no has probado"),
        vibe: "explorer",
      },
    ],
  },
  {
    id: "one-song-or-full-album",
    category: localized("Music ritual", "Ritual musical"),
    prompt: localized("How do you listen when there is time?", "¿Cómo escuchas cuando hay tiempo?"),
    options: [
      {
        label: localized("One perfect song on repeat", "Una canción perfecta en repetición"),
        vibe: "roadTrip",
      },
      {
        label: localized(
          "A full album from start to finish",
          "Un álbum completo de principio a fin",
        ),
        vibe: "comfort",
      },
    ],
  },
  {
    id: "snow-day-or-sun-day",
    category: localized("Utah season", "Temporada de Utah"),
    prompt: localized("Pick the day that calls your name.", "Elige el día que te llama."),
    options: [
      { label: localized("A fresh snow day", "Un día de nieve recién caída"), vibe: "comfort" },
      { label: localized("A bright desert day", "Un brillante día de desierto"), vibe: "explorer" },
    ],
  },
  {
    id: "conversation-or-playlist",
    category: localized("On the way", "En el camino"),
    prompt: localized(
      "What makes a long ride fly by?",
      "¿Qué hace que un viaje largo pase volando?",
    ),
    options: [
      { label: localized("A great conversation", "Una gran conversación"), vibe: "roadTrip" },
      {
        label: localized("A carefully made playlist", "Una playlist cuidadosamente creada"),
        vibe: "comfort",
      },
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
  const scores = calculateRideVibeScores(selections);
  const highestScore = Math.max(...Object.values(scores));
  const leaders = (Object.keys(scores) as RideVibe[]).filter(
    (vibe) => scores[vibe] === highestScore,
  );

  for (let index = selections.length - 1; index >= 0; index -= 1) {
    if (leaders.includes(selections[index])) return selections[index];
  }

  return "roadTrip";
}

export function calculateRideVibeScores(selections: readonly RideVibe[]): Record<RideVibe, number> {
  const scores: Record<RideVibe, number> = { explorer: 0, comfort: 0, roadTrip: 0 };
  selections.forEach((vibe) => {
    scores[vibe] += 1;
  });
  return scores;
}
