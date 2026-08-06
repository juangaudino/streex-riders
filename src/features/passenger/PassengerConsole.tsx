import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@/config";
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarPlus,
  ChevronRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  CreditCard,
  Gamepad2,
  Globe2,
  HandCoins,
  Languages,
  Mail,
  Menu,
  MessageCircle,
  MoonStar,
  Music2,
  MapPin,
  Pause,
  Phone,
  Play,
  QrCode,
  Search,
  SkipForward,
  Sparkles,
  Star,
  Sun,
  Snowflake,
  Wifi,
  Wind,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceTicker } from "@/components/streex/ServiceTicker";
import { BookingFormModal } from "@/components/streex/BookingFormModal";
import { FeedbackForm } from "@/components/streex/FeedbackForm";
import { ExperienceGallery } from "@/components/streex/ExperienceGallery";
import { ServiceAreas } from "@/components/streex/ServiceAreas";
import { ServicesSection } from "@/components/streex/ServicesSection";
import { QRCodeSVG } from "qrcode.react";
import {
  controlPersonalSpotifyPlayback,
  getPersonalSpotifyPlayback,
  playPersonalSpotifyTrack,
  searchPersonalSpotifyTracks,
} from "@/lib/spotify.functions";
import type { PassengerWeatherCondition, PassengerWeatherSnapshot } from "@/lib/weather";
import {
  useClock,
  useOnlineStatus,
  usePassengerIdleReset,
  usePassengerWeather,
  type PassengerWeatherStatus,
} from "./usePassengerState";
import { UtahTrivia } from "./UtahTrivia";
import { ThisOrThat } from "./ThisOrThat";
import { HoneycombMark } from "./game-marks";
import { THIS_OR_THAT_TRAILER_VISUALS } from "./this-or-that-visuals";
import horizonQuickActionCard from "@/features/runner/assets/quick-action/horizon_quick_action_card.webp";
import utahTriviaSymbols from "@/assets/passenger-games/utah-trivia-symbols.jpg";
import passengerRav4Front from "@/assets/streex-gallery/passenger-rav4-front.jpg";
import passengerRav4Rear from "@/assets/streex-gallery/passenger-rav4-rear.jpg";
import passengerRav4Snow from "@/assets/streex-gallery/passenger-rav4-snow.jpg";
import passengerRav4Side from "@/assets/streex-gallery/rav4.jpg";

type Language = "en" | "es";
type View =
  | "home"
  | "music"
  | "games"
  | "streex"
  | "meet-juan"
  | "services"
  | "contact"
  | "reviews"
  | "tip"
  | "where-we-ride";

type PassengerConsoleProps = {
  config: AppConfig;
};

const MUSIC_LIBRARY = [
  { title: "Midnight Drive", artist: "The Wayfarers", album: "Neon Roads", duration: "3:42" },
  { title: "Canyon Light", artist: "Sable & Sun", album: "Utah Skies", duration: "4:11" },
  { title: "Golden Hour", artist: "Rivera", album: "West Coast Nights", duration: "3:58" },
  { title: "Quiet Passenger", artist: "Marlow", album: "Backseat Tapes", duration: "2:47" },
];

const MUSIC_VIBES = [
  { query: "chill", labelKey: "vibeChill" },
  { query: "throwbacks", labelKey: "vibeThrowbacks" },
  { query: "latin", labelKey: "vibeLatin" },
  { query: "pop", labelKey: "vibePop" },
  { query: "r&b", labelKey: "vibeRnB" },
  { query: "spotify top 50 usa", labelKey: "vibeTopUs" },
  { query: "spotify top 50 global", labelKey: "vibeTopGlobal" },
  { query: "today's top hits", labelKey: "vibeToday" },
] as const;

const copy = {
  en: {
    home: "Home",
    music: "Music",
    games: "Games",
    streex: "Streex",
    privateRide: "Private ride",
    streexDifference: "The Streex difference",
    welcome: "Welcome to your ride",
    subtitle: "A private ride, with a little more built in.",
    exploreCue: "Tap to explore your ride",
    hostedBy: "Hosted by",
    hostCardEyebrow: "Your Streex host",
    hostCardDescription: "A local, bilingual ride with a little more built in.",
    localTime: "Local time",
    newYork: "New York",
    dallas: "Dallas",
    losAngeles: "Los Angeles",
    weather: "Weather",
    weatherHint: "Tap for the forecast",
    weatherDetailTitle: "Weather forecast",
    weatherDetailDescription: "A quick look at the next few hours in",
    nextHours: "Next few hours",
    precipitation: "Precipitation",
    wind: "Wind",
    updated: "Updated",
    weatherUnavailable: "Live weather unavailable",
    weatherUnavailableDescription: "The last forecast will return when the connection is restored.",
    conditionClear: "Clear",
    conditionMostlyClear: "Mostly clear",
    conditionPartlyCloudy: "Partly cloudy",
    conditionCloudy: "Cloudy",
    conditionRain: "Rain",
    conditionThunderstorms: "Thunderstorms",
    conditionSnow: "Snow",
    conditionFog: "Fog",
    conditionSmoke: "Smoke",
    conditionWind: "Windy",
    conditionUnknown: "Current conditions",
    clearSkies: "Clear skies",
    partlyCloudy: "Partly cloudy",
    nowPlaying: "Now playing",
    chooseMusic: "Choose music",
    musicHint: "Tap to search songs and artists.",
    quickAccess: "Quick access",
    musicDescription: "Curated sound for your ride",
    gamesDescription: "Utah trivia & light games",
    streexDescription: "Book, tip, review & more",
    open: "Open",
    online: "Online",
    offline: "Offline",
    preview: "Simulated preview — no live music provider",
    spotifyPersonal: "Personal Spotify connection",
    musicEyebrow: "Your soundtrack",
    musicGettingReady: "Music is getting ready",
    musicGettingReadyDescription: "Start Spotify on the vehicle audio, then tap Refresh.",
    musicUnavailableTitle: "Music is unavailable right now",
    musicUnavailableDescription: "Please ask your driver to get the vehicle audio ready.",
    spotifyDisabled: "The personal Spotify connection is not enabled.",
    spotifyDriverSetup:
      "Your driver can finish the private Spotify setup before controls become available.",
    spotifyNotConnected: "Your driver has not connected Spotify yet.",
    spotifyNoDevice: "Start Spotify on the vehicle audio, then return here to choose music.",
    spotifyDevice: "Vehicle audio",
    spotifyActive: "Active",
    spotifyRefresh: "Refresh",
    spotifyControlError: "Spotify could not update playback. Please try again.",
    searchSpotify: "Search Spotify",
    searchSpotifyHint: "Find a song to play on the active vehicle audio device.",
    musicDiscoveryTitle: "Choose what plays next",
    musicDiscoveryDescription: "Search for a song or start with one of the collections above.",
    searchButton: "Search",
    searchResults: "Song results",
    searchEmpty: "No songs found. Try another search.",
    searchMinLength: "Enter at least two characters to search Spotify.",
    playSong: "Play song",
    explicit: "Explicit",
    musicTitle: "Music",
    musicSubtitle: "Search songs and shape the soundtrack for your ride.",
    pickVibe: "Pick a vibe",
    exploreMusic: "Explore music",
    vibeChill: "Chill",
    vibeThrowbacks: "Throwbacks",
    vibeLatin: "Latin",
    vibePop: "Pop",
    vibeRnB: "R&B",
    vibeTopUs: "Top 50 U.S.",
    vibeTopGlobal: "Top 50 Global",
    vibeToday: "Today's Top Hits",
    jamTitle: "Spotify Jam",
    jamDescription:
      "Want to add your own music? Ask your driver to host a Jam, then scan the QR shown in Spotify with your phone.",
    jamStatus: "Available when hosted by your driver",
    search: "Search songs, artists, moods…",
    results: "Results",
    gamesTitle: "Games",
    gamesSubtitle: "Light entertainment for the road.",
    gamesEyebrow: "Take a break",
    comingSoon: "Coming soon",
    playNow: "Play now",
    utahTrivia: "Utah Trivia",
    utahTriviaDescription: "Test what you know about the Beehive State.",
    triviaPreview: "Utah edition",
    thisOrThat: "This or That",
    thisOrThatDescription: "Quick, playful choices between two options.",
    choicePreview: "Pick a side",
    choiceFirst: "THIS",
    choiceSecond: "THAT",
    horizonTabletSoon: "Coming soon to your tablet experience",
    horizonPhone: "Play on your phone",
    futureGameTitle: "Next up",
    futureGameDescription: "A new road-side game is in the works.",
    streexTitle: "Private rides. Elevated.",
    streexSubtitle: "Designed around you.",
    streexExperienceTitle: "The Streex Experience",
    yourRideGallery: "Your Streex ride",
    whereWeRide: "Where We Ride",
    whereWeRideTitle: "Utah roots. Longer horizons.",
    whereWeRideDescription:
      "Private transportation throughout Northern Utah, Park City and beyond — with every route planned around your schedule.",
    serviceArea: "Service Area",
    moreDestinations: "More Destinations",
    extendedRides: "Extended Rides",
    bookRide: "Book another ride",
    services: "Services",
    contact: "Contact",
    reviews: "Reviews",
    tip: "Leave a tip",
    continuePhone: "Continue on your phone",
    continuePhoneDescription: "Scan to continue your Streex experience on your phone.",
    meetJuan: "Meet Juan",
    guestNotesEyebrow: "Streex guest notes",
    guestNotesTitle: "A few words from the road",
    guestNotesPreview: "Sample layout — live reviews will appear here later.",
    guestNoteOne: "“Thoughtful, smooth, and exactly what I needed after a long flight.”",
    guestNoteOneBy: "Airport guest",
    guestNoteTwo: "“The small details made the ride feel genuinely personal.”",
    guestNoteTwoBy: "Park City guest",
    guestNoteThree: "“Comfortable, easy, and wonderfully professional.”",
    guestNoteThreeBy: "Salt Lake City guest",
    unavailable: "Coming soon",
    meetIntro: "Hi, I’m Juan.",
    gratitude:
      "If your ride felt right, a review or a tip is always appreciated — only if you feel like it.",
    leaveReview: "Leave a review",
    leaveTip: "Leave a tip",
    back: "Back to Streex",
    bilingual: "English + Español",
    hospitality: "Hospitality first",
    qrNote: "The phone continuation link will appear here when configured.",
    servicesTitle: "Services for every kind of ride.",
    contactTitle: "Contact Streex",
    contactSubtitle: "Contact details to use from your own phone.",
    contactNote: "This tablet does not place calls or send messages.",
    phoneAndText: "Call or text",
    whatsapp: "WhatsApp",
    email: "Email",
    website: "Website",
    reviewTitle: "Share your experience",
    reviewSubtitle: "Your feedback helps us make every ride better.",
    tipTitle: "Thank you for riding with Streex",
    tipSubtitle: "Optional ways to show your appreciation.",
    tipOptionsTitle: "Choose a convenient option",
    tipOptionsNote: "Only if you wish — thank you for riding with Streex.",
    tipInstruction: "Choose a method, then scan the QR with your phone.",
    tipScan: "Scan to continue on your phone",
    tipSecure: "Your payment is completed securely on your own device.",
    venmo: "Venmo",
    cashApp: "Cash App",
    cardAndWallet: "Apple Pay, Google Pay & Card",
    stripeDetail: "Choose your preferred option in the secure checkout",
    stripePending: "Stripe setup pending",
    idleTitle: "Ready for your Streex experience?",
    idleDescription: "Your music, games and Streex experience are one tap away.",
    idleAction: "Tap anywhere to explore",
    idleNowPlaying: "Now playing on Streex",
    idleMusicReady: "Your Streex soundtrack",
    idleMusicPrompt: "Your soundtrack starts here",
    idleChooseMusic: "Choose the soundtrack for your ride",
    idleChooseMusicDescription: "Search songs, explore Top 50, or pick a vibe for the road.",
    idleMusicSearch: "Search songs",
    idleMusicTop: "Top 50",
    idleMusicVibes: "Pick a vibe",
    idleHost: "Your Streex host",
  },
  es: {
    home: "Inicio",
    music: "Música",
    games: "Juegos",
    streex: "Streex",
    privateRide: "Viaje privado",
    streexDifference: "La diferencia Streex",
    welcome: "Bienvenido a tu viaje",
    subtitle: "Un viaje privado, con algo más para disfrutar.",
    exploreCue: "Toca para explorar tu viaje",
    hostedBy: "Atendido por",
    hostCardEyebrow: "Tu anfitrión Streex",
    hostCardDescription: "Un viaje local y bilingüe, con algo más para disfrutar.",
    localTime: "Hora local",
    newYork: "Nueva York",
    dallas: "Dallas",
    losAngeles: "Los Ángeles",
    weather: "Clima",
    weatherHint: "Toca para ver el pronóstico",
    weatherDetailTitle: "Pronóstico del clima",
    weatherDetailDescription: "Una vista rápida de las próximas horas en",
    nextHours: "Próximas horas",
    precipitation: "Precipitación",
    wind: "Viento",
    updated: "Actualizado",
    weatherUnavailable: "Clima en vivo no disponible",
    weatherUnavailableDescription:
      "El último pronóstico volverá cuando se restablezca la conexión.",
    conditionClear: "Despejado",
    conditionMostlyClear: "Mayormente despejado",
    conditionPartlyCloudy: "Parcialmente nublado",
    conditionCloudy: "Nublado",
    conditionRain: "Lluvia",
    conditionThunderstorms: "Tormentas eléctricas",
    conditionSnow: "Nieve",
    conditionFog: "Niebla",
    conditionSmoke: "Humo",
    conditionWind: "Ventoso",
    conditionUnknown: "Condiciones actuales",
    clearSkies: "Cielo despejado",
    partlyCloudy: "Parcialmente nublado",
    nowPlaying: "Reproduciendo",
    chooseMusic: "Elige la música",
    musicHint: "Toca para buscar canciones y artistas.",
    quickAccess: "Accesos rápidos",
    musicDescription: "Sonido seleccionado para su viaje",
    gamesDescription: "Trivia de Utah y juegos ligeros",
    streexDescription: "Reservar, propina, reseñas y más",
    open: "Abrir",
    online: "En línea",
    offline: "Sin conexión",
    preview: "Vista simulada — sin proveedor de música en vivo",
    spotifyPersonal: "Conexión personal de Spotify",
    musicEyebrow: "Tu banda sonora",
    musicGettingReady: "La música se está preparando",
    musicGettingReadyDescription:
      "Inicia Spotify en el audio del vehículo y luego toca Actualizar.",
    musicUnavailableTitle: "La música no está disponible en este momento",
    musicUnavailableDescription: "Consulta a tu conductor para preparar el audio del vehículo.",
    spotifyDisabled: "La conexión personal de Spotify no está habilitada.",
    spotifyDriverSetup:
      "Tu conductor puede terminar la configuración privada de Spotify antes de que los controles estén disponibles.",
    spotifyNotConnected: "Tu conductor todavía no ha conectado Spotify.",
    spotifyNoDevice: "Inicia Spotify en el audio del vehículo y vuelve aquí para elegir música.",
    spotifyDevice: "Audio del vehículo",
    spotifyActive: "Activo",
    spotifyRefresh: "Actualizar",
    spotifyControlError: "Spotify no pudo actualizar la reproducción. Inténtalo de nuevo.",
    searchSpotify: "Buscar en Spotify",
    searchSpotifyHint:
      "Encuentra una canción para reproducir en el dispositivo de audio activo del vehículo.",
    musicDiscoveryTitle: "Elige qué sonará después",
    musicDiscoveryDescription: "Busca una canción o comienza con una de las colecciones de arriba.",
    searchButton: "Buscar",
    searchResults: "Resultados de canciones",
    searchEmpty: "No se encontraron canciones. Prueba otra búsqueda.",
    searchMinLength: "Escribe al menos dos caracteres para buscar en Spotify.",
    playSong: "Reproducir canción",
    explicit: "Explícito",
    musicTitle: "Música",
    musicSubtitle: "Busca canciones y crea la banda sonora de tu viaje.",
    pickVibe: "Elige un ambiente",
    exploreMusic: "Explora música",
    vibeChill: "Chill",
    vibeThrowbacks: "Clásicos",
    vibeLatin: "Latino",
    vibePop: "Pop",
    vibeRnB: "R&B",
    vibeTopUs: "Top 50 EE. UU.",
    vibeTopGlobal: "Top 50 Global",
    vibeToday: "Éxitos de hoy",
    jamTitle: "Spotify Jam",
    jamDescription:
      "¿Quieres agregar tu propia música? Pide a tu conductor que inicie una Jam y escanea el QR que aparece en Spotify desde tu teléfono.",
    jamStatus: "Disponible cuando la inicie tu conductor",
    search: "Buscar canciones, artistas o moods…",
    results: "Resultados",
    gamesTitle: "Juegos",
    gamesSubtitle: "Entretenimiento ligero para el camino.",
    gamesEyebrow: "Tómate un descanso",
    comingSoon: "Próximamente",
    playNow: "Jugar ahora",
    utahTrivia: "Utah Trivia",
    utahTriviaDescription: "Ponga a prueba lo que sabe del Beehive State.",
    triviaPreview: "Edición Utah",
    thisOrThat: "This or That",
    thisOrThatDescription: "Elecciones rápidas y divertidas entre dos opciones.",
    choicePreview: "Elige un lado",
    choiceFirst: "ESTO",
    choiceSecond: "AQUELLO",
    horizonTabletSoon: "Próximamente en tu experiencia de tablet",
    horizonPhone: "Juega en tu teléfono",
    futureGameTitle: "Próximamente",
    futureGameDescription: "Estamos preparando un nuevo juego para el camino.",
    streexTitle: "Viajes privados. Elevados.",
    streexSubtitle: "Diseñado para ti.",
    streexExperienceTitle: "La experiencia Streex",
    yourRideGallery: "Tu viaje Streex",
    whereWeRide: "Dónde viajamos",
    whereWeRideTitle: "Raíces en Utah. Horizontes más amplios.",
    whereWeRideDescription:
      "Transporte privado en el norte de Utah, Park City y más allá, con cada ruta planificada según su horario.",
    serviceArea: "Área de servicio",
    moreDestinations: "Más destinos",
    extendedRides: "Viajes extendidos",
    bookRide: "Reservar otro viaje",
    services: "Servicios",
    contact: "Contacto",
    reviews: "Reseñas",
    tip: "Dejar propina",
    continuePhone: "Continuar en su teléfono",
    continuePhoneDescription: "Escanee para continuar su experiencia Streex en su teléfono.",
    meetJuan: "Conoce a Juan",
    guestNotesEyebrow: "Notas de huéspedes Streex",
    guestNotesTitle: "Algunas palabras del camino",
    guestNotesPreview: "Diseño de ejemplo — las reseñas en vivo aparecerán aquí más adelante.",
    guestNoteOne:
      "“Considerado, fluido y exactamente lo que necesitaba después de un vuelo largo.”",
    guestNoteOneBy: "Huésped de aeropuerto",
    guestNoteTwo: "“Los pequeños detalles hicieron que el viaje se sintiera realmente personal.”",
    guestNoteTwoBy: "Huésped de Park City",
    guestNoteThree: "“Cómodo, sencillo y maravillosamente profesional.”",
    guestNoteThreeBy: "Huésped de Salt Lake City",
    unavailable: "Próximamente",
    meetIntro: "Hola, soy Juan.",
    gratitude:
      "Si su viaje se sintió bien, una reseña o propina siempre se agradece — solo si lo desea.",
    leaveReview: "Dejar una reseña",
    leaveTip: "Dejar una propina",
    back: "Volver a Streex",
    bilingual: "Inglés + Español",
    hospitality: "Hospitalidad primero",
    qrNote: "El enlace para continuar en su teléfono aparecerá aquí cuando se configure.",
    servicesTitle: "Servicios para cada tipo de viaje.",
    contactTitle: "Contactar a Streex",
    contactSubtitle: "Datos de contacto para usar desde su propio teléfono.",
    contactNote: "Esta tablet no realiza llamadas ni envía mensajes.",
    phoneAndText: "Llamar o enviar mensaje",
    whatsapp: "WhatsApp",
    email: "Email",
    website: "Sitio web",
    reviewTitle: "Comparta su experiencia",
    reviewSubtitle: "Sus comentarios nos ayudan a mejorar cada viaje.",
    tipTitle: "Gracias por viajar con Streex",
    tipSubtitle: "Formas opcionales de mostrar su agradecimiento.",
    tipOptionsTitle: "Elija la opción más conveniente",
    tipOptionsNote: "Solo si lo desea — gracias por viajar con Streex.",
    tipInstruction: "Elija un método y escanee el QR con su teléfono.",
    tipScan: "Escanee para continuar en su teléfono",
    tipSecure: "El pago se completa de forma segura en su propio dispositivo.",
    venmo: "Venmo",
    cashApp: "Cash App",
    cardAndWallet: "Apple Pay, Google Pay y tarjeta",
    stripeDetail: "Elija su opción preferida en el pago seguro",
    stripePending: "Configuración de Stripe pendiente",
    idleTitle: "¿Listo para tu experiencia Streex?",
    idleDescription: "Tu música, juegos y experiencia Streex están a un toque.",
    idleAction: "Toca cualquier lugar para explorar",
    idleNowPlaying: "Reproduciendo en Streex",
    idleMusicReady: "Tu banda sonora Streex",
    idleMusicPrompt: "Tu banda sonora empieza aquí",
    idleChooseMusic: "Elige la música para tu viaje",
    idleChooseMusicDescription:
      "Busca canciones, explora el Top 50 o elige un estilo para el viaje.",
    idleMusicSearch: "Buscar canciones",
    idleMusicTop: "Top 50",
    idleMusicVibes: "Elige un estilo",
    idleHost: "Tu anfitrión Streex",
  },
} as const;

export function PassengerConsole({ config }: PassengerConsoleProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<View>("home");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const t = copy[language];
  const online = useOnlineStatus();

  const consoleConfig = config.passengerConsole;
  const weather = usePassengerWeather(online, consoleConfig.weather.refreshMinutes);
  const resetPassengerSession = useCallback(() => {
    setBookingOpen(false);
    setView("home");
    setLanguage(consoleConfig.idleReset.defaultLanguage);
    setSessionKey((current) => current + 1);
  }, [consoleConfig.idleReset.defaultLanguage]);
  const idleReset = usePassengerIdleReset({
    inactivitySeconds: consoleConfig.idleReset.inactivitySeconds,
    onReset: resetPassengerSession,
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/passenger-sw.js", { scope: "/passenger" }).catch(() => {
      // Offline recovery is progressive enhancement; the console stays usable without it.
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="h-dvh overflow-hidden bg-[#0B0B0B] text-white">
      <div
        className="passenger-console-shell mx-auto flex h-dvh w-full max-w-[740px] flex-col px-7 pb-4 pt-5"
        data-music-layout={
          consoleConfig.music.mode === "provider" && consoleConfig.music.providerName === "Spotify"
            ? "spotify"
            : "simulated"
        }
        data-view={view}
      >
        <ConsoleHeader
          config={config}
          language={language}
          online={online}
          setLanguage={setLanguage}
          status={online ? t.online : t.offline}
        />
        <main
          key={sessionKey}
          className="mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-5 pt-5"
        >
          {view === "home" && (
            <HomeView
              config={config}
              language={language}
              onNavigate={setView}
              fallbackTemperatureFahrenheit={consoleConfig.weather.fallbackTemperatureFahrenheit}
              weather={weather.snapshot}
              weatherCity={consoleConfig.weather.city}
              weatherStatus={weather.status}
              t={t}
            />
          )}
          {view === "music" && <MusicView config={config} onNavigate={setView} t={t} />}
          {view === "games" && (
            <GamesView
              language={language}
              phoneContinuation={consoleConfig.links.phoneContinuation}
              t={t}
              thisOrThatEnabled={consoleConfig.games.thisOrThatEnabled}
              utahTriviaEnabled={consoleConfig.games.utahTriviaEnabled}
            />
          )}
          {view === "streex" && (
            <StreexView
              config={config}
              onBookRide={() => setBookingOpen(true)}
              onNavigate={setView}
              phoneContinuation={consoleConfig.links.phoneContinuation}
              t={t}
            />
          )}
          {view === "meet-juan" && (
            <MeetJuanView config={config} language={language} onNavigate={setView} t={t} />
          )}
          {view === "services" && <ServicesView config={config} onNavigate={setView} t={t} />}
          {view === "contact" && <ContactView config={config} onNavigate={setView} t={t} />}
          {view === "reviews" && <ReviewsView language={language} onNavigate={setView} t={t} />}
          {view === "tip" && <TipView config={config} onNavigate={setView} t={t} />}
          {view === "where-we-ride" && (
            <WhereWeRideView config={config} onNavigate={setView} t={t} />
          )}
        </main>
        <ConsoleNavigation activeView={view} onNavigate={setView} t={t} />
      </div>
      <BookingFormModal language={language} open={bookingOpen} onOpenChange={setBookingOpen} />
      {idleReset.promptOpen && (
        <PassengerIdlePrompt
          config={config}
          fallbackTemperatureFahrenheit={consoleConfig.weather.fallbackTemperatureFahrenheit}
          language={language}
          onExploreMusic={() => {
            idleReset.resume();
            setView("music");
          }}
          onResume={idleReset.resume}
          weather={weather.snapshot}
        />
      )}
    </div>
  );
}

function PassengerIdlePrompt({
  config,
  fallbackTemperatureFahrenheit,
  language,
  onExploreMusic,
  onResume,
  weather,
}: {
  config: AppConfig;
  fallbackTemperatureFahrenheit: number;
  language: Language;
  onExploreMusic: () => void;
  onResume: () => void;
  weather: PassengerWeatherSnapshot | null;
}) {
  const primary = copy[language];
  const secondary = copy[language === "en" ? "es" : "en"];
  const now = useClock();
  const time = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: config.passengerConsole.clock.localTimeZone,
      })
    : "--:--";
  const temperatureFahrenheit =
    weather?.periods[0]?.temperatureFahrenheit ?? fallbackTemperatureFahrenheit;
  const temperatureCelsius = Math.round(((temperatureFahrenheit - 32) * 5) / 9);

  return (
    <div
      onClick={onResume}
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-[#080808]/95 p-8 text-left text-white backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#E6CE20]/60"
    >
      <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6CE20]/10 blur-[130px]" />
      <div className="passenger-idle-content relative flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="passenger-idle-header flex w-full items-center justify-between gap-5">
          <img
            src={config.logoSrc}
            alt={config.brandName}
            className="h-14 w-auto max-w-[220px] object-contain"
          />
          <span className="passenger-idle-meta flex shrink-0 items-center gap-4 text-right">
            <span className="text-3xl font-black tabular-nums tracking-tight sm:text-4xl">
              {time}
            </span>
            <span className="h-9 w-px bg-[#E6CE20]/45" aria-hidden="true" />
            <span className="flex items-center gap-2 text-base font-semibold text-white/65 sm:text-lg">
              <Cloud className="h-5 w-5 text-[#E6CE20]" />
              {Math.round(temperatureFahrenheit)}°F · {temperatureCelsius}°C
            </span>
          </span>
        </div>

        <IdleSpotifyNowPlaying
          enabled={
            config.passengerConsole.music.mode === "provider" &&
            config.passengerConsole.music.providerName === "Spotify"
          }
          onExploreMusic={onExploreMusic}
          t={primary}
        />

        <div className="w-full text-center">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#E6CE20]">Streex Rides</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {primary.idleTitle}
          </h1>
          <p className="mt-2 text-lg font-semibold text-white/45">{secondary.idleTitle}</p>
          <p className="mt-4 text-sm text-white/50">{primary.idleDescription}</p>
        </div>

        <div className="passenger-idle-ticker w-full" aria-hidden="true">
          <ServiceTicker config={config} />
        </div>

        <div className="passenger-idle-footer flex w-full items-center justify-between gap-4">
          <span className="passenger-idle-host flex items-center gap-3 text-left">
            <img
              src={config.meetPhoto}
              alt={config.ownerName}
              className="h-14 w-14 shrink-0 rounded-2xl border border-[#E6CE20]/45 object-cover shadow-[0_0_24px_rgba(230,206,32,0.12)]"
            />
            <span>
              <span className="block text-base font-extrabold">{config.ownerName}</span>
              <span className="mt-1 block text-xs font-semibold text-white/50">
                {primary.idleHost} · {secondary.idleHost}
              </span>
            </span>
          </span>
          <span className="passenger-idle-action rounded-full border border-[#E6CE20] bg-[#E6CE20] px-8 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(230,206,32,0.26)] sm:min-w-[300px]">
            <span className="block">{primary.idleAction}</span>
            <span className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold normal-case tracking-normal text-black/65">
              <Sparkles className="h-3 w-3" />
              Music · Games · Streex
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function IdleSpotifyNowPlaying({
  enabled,
  onExploreMusic,
  t,
}: {
  enabled: boolean;
  onExploreMusic: () => void;
  t: (typeof copy)[Language];
}) {
  const [status, setStatus] = useState<SpotifyPlaybackState | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;

    const refresh = async () => {
      try {
        const next = await getPersonalSpotifyPlayback({ data: {} });
        if (isMounted) setStatus(next);
      } catch {
        if (isMounted) setStatus(null);
      }
    };

    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 5_000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [enabled]);

  const playback = status?.state === "ready" ? status.playback : null;
  const track = playback?.track ?? null;
  const isDiscoverable = !track;
  const className = `passenger-idle-music grid w-full max-w-4xl items-center gap-7${
    isDiscoverable ? " passenger-idle-music--discover" : ""
  }`;

  const content = (
    <>
      {track?.artworkUrl ? (
        <img
          src={track.artworkUrl}
          alt=""
          className="passenger-idle-artwork aspect-square w-full rounded-[28px] object-cover shadow-2xl"
        />
      ) : (
        <span
          aria-hidden="true"
          className="passenger-idle-artwork passenger-idle-soundboard grid aspect-square w-full place-items-center rounded-[28px] text-black shadow-2xl"
        >
          <span className="passenger-idle-soundboard-orbit passenger-idle-soundboard-orbit--outer" />
          <span className="passenger-idle-soundboard-orbit passenger-idle-soundboard-orbit--inner" />
          <span className="passenger-idle-soundboard-choices">
            <span>{t.idleMusicSearch}</span>
            <span>{t.idleMusicTop}</span>
            <span>{t.idleMusicVibes}</span>
          </span>
          <span className="passenger-idle-soundboard-core">
            <span className="passenger-idle-soundboard-equalizer">
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>
            <Music2 className="passenger-idle-soundboard-note" />
          </span>
        </span>
      )}
      <span className="passenger-idle-track-copy min-w-0">
        <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#E6CE20]">
          {playback?.isPlaying && (
            <span className="flex h-5 items-end gap-1" aria-hidden="true">
              <span className="h-2 w-1 animate-pulse rounded-full bg-[#E6CE20]" />
              <span className="h-5 w-1 animate-pulse rounded-full bg-[#E6CE20]" />
              <span className="h-3 w-1 animate-pulse rounded-full bg-[#E6CE20]" />
            </span>
          )}
          {playback?.isPlaying
            ? t.idleNowPlaying
            : isDiscoverable
              ? t.idleMusicPrompt
              : t.idleMusicReady}
        </span>
        <span className="mt-4 block text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {track?.title ?? t.idleChooseMusic}
        </span>
        <span className="mt-3 block text-lg text-white/55">
          {track
            ? `${track.artist}${track.album ? ` · ${track.album}` : ""}`
            : t.idleChooseMusicDescription}
        </span>
        {isDiscoverable && (
          <span className="passenger-idle-discovery mt-5 flex flex-wrap items-center gap-3">
            <span className="passenger-idle-discovery-pills flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
              <span>{t.idleMusicSearch}</span>
              <span>{t.idleMusicTop}</span>
              <span>{t.idleMusicVibes}</span>
            </span>
            <span className="passenger-idle-discovery-action inline-flex items-center gap-2 rounded-full bg-[#E6CE20] px-4 py-2 text-xs font-black text-black shadow-[0_0_25px_rgba(230,206,32,0.18)]">
              <Search className="h-4 w-4" />
              {t.chooseMusic}
              <ChevronRight className="h-4 w-4" />
            </span>
          </span>
        )}
      </span>
    </>
  );

  if (!isDiscoverable) return <div className={className}>{content}</div>;

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        onExploreMusic();
      }}
    >
      {content}
    </button>
  );
}

function ConsoleHeader({
  config,
  language,
  online,
  setLanguage,
  status,
}: {
  config: AppConfig;
  language: Language;
  online: boolean;
  setLanguage: (language: Language) => void;
  status: string;
}) {
  return (
    <header className="passenger-console-header relative z-20 flex shrink-0 items-center justify-between gap-3 bg-[#0B0B0B]">
      <div className="flex min-w-0 items-center">
        <img
          src={config.logoSrc}
          alt={config.brandName}
          className="h-11 w-auto max-w-[154px] shrink-0 object-contain"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${online ? "bg-[#E6CE20] shadow-[0_0_10px_#E6CE20]" : "bg-white/35"}`}
          />
          {status}
          <Wifi className="h-3.5 w-3.5" />
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 text-sm font-semibold">
          {(["en", "es"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={language === option}
              onClick={() => setLanguage(option)}
              className={`rounded-full px-3 py-1.5 transition ${
                language === option ? "bg-[#E6CE20] text-black" : "text-white/55"
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function HomeView({
  config,
  language,
  onNavigate,
  fallbackTemperatureFahrenheit,
  weather,
  weatherCity,
  weatherStatus,
  t,
}: {
  config: AppConfig;
  language: Language;
  onNavigate: (view: View) => void;
  fallbackTemperatureFahrenheit: number;
  weather: PassengerWeatherSnapshot | null;
  weatherCity: string;
  weatherStatus: PassengerWeatherStatus;
  t: (typeof copy)[Language];
}) {
  const now = useClock();
  const [weatherOpen, setWeatherOpen] = useState(false);
  const locale = language === "es" ? "es-MX" : "en-US";
  const clockConfig = config.passengerConsole.clock;
  const time = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: clockConfig.localTimeZone,
      })
    : "--:--";
  const date = now
    ? now.toLocaleDateString(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: clockConfig.localTimeZone,
      })
    : "";
  const eastTime = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: clockConfig.secondaryTimeZones.east,
      })
    : "--:--";
  const pacificTime = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: clockConfig.secondaryTimeZones.pacific,
      })
    : "--:--";
  const centralTime = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: clockConfig.secondaryTimeZones.central,
      })
    : "--:--";
  const temperatureFahrenheit =
    weather?.periods[0]?.temperatureFahrenheit ?? fallbackTemperatureFahrenheit;
  const temperature =
    language === "es"
      ? `${Math.round(((temperatureFahrenheit - 32) * 5) / 9)}°C`
      : `${Math.round(temperatureFahrenheit)}°F`;

  return (
    <div className="passenger-home-layout flex flex-1 flex-col gap-5">
      <section className="passenger-home-hero relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#E6CE20]/15 p-6">
        <img
          src={passengerRav4Front}
          alt=""
          aria-hidden="true"
          className="passenger-home-hero-image absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center"
        />
        <span className="passenger-home-hero-image-scrim absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E6CE20]/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E6CE20]">
              {t.privateRide}
            </p>
            <p className="shrink-0 text-[10px] font-semibold text-white/45">
              {t.hostedBy} {config.ownerName}
            </p>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{t.welcome}</h1>
          <p className="mt-2 text-base text-white/60">{t.subtitle}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#E6CE20]">
            <Sparkles className="h-3.5 w-3.5" />
            {t.exploreCue}
          </p>
          <div className="passenger-home-time mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {t.localTime}
              </p>
              <p className="text-5xl font-black tracking-tight tabular-nums sm:text-6xl">{time}</p>
              <p className="mt-1 text-sm capitalize text-white/55">{date}</p>
            </div>
            <button
              type="button"
              onClick={() => setWeatherOpen(true)}
              aria-label={`${t.weather}: ${weatherCity}. ${t.weatherHint}`}
              className="min-w-[208px] rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-left backdrop-blur transition hover:border-[#E6CE20]/40 hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-[#E6CE20]/60"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                {t.weather}
              </p>
              <span className="mt-2 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E6CE20]/10 text-[#E6CE20]">
                  <WeatherConditionIcon
                    condition={weather?.periods[0]?.condition ?? "unknown"}
                    className="h-7 w-7"
                    night={isNightAt(now, clockConfig.localTimeZone)}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-3xl font-black leading-none tracking-tight">
                    {temperature}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-white/75">
                    {weatherConditionLabel(weather?.periods[0]?.condition ?? "unknown", t)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-white/55">{weatherCity}</span>
                </span>
              </span>
              <span className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-[#E6CE20]">
                {weatherStatus === "unavailable" && !weather ? t.weatherUnavailable : t.weatherHint}{" "}
                <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-3">
            <SecondaryClock label={t.newYork} time={eastTime} />
            <SecondaryClock label={t.dallas} time={centralTime} />
            <SecondaryClock label={t.losAngeles} time={pacificTime} />
          </div>
        </div>
      </section>

      <WeatherDetailDialog
        city={weatherCity}
        language={language}
        open={weatherOpen}
        onOpenChange={setWeatherOpen}
        fallbackTemperatureFahrenheit={fallbackTemperatureFahrenheit}
        weather={weather}
        weatherStatus={weatherStatus}
        timeZone={clockConfig.localTimeZone}
        t={t}
      />

      <div className="passenger-home-music">
        {config.passengerConsole.music.mode === "provider" &&
        config.passengerConsole.music.providerName === "Spotify" ? (
          <PersonalSpotifyHomeCard onNavigate={onNavigate} t={t} />
        ) : (
          <button
            type="button"
            onClick={() => onNavigate("music")}
            className="flex min-h-[96px] w-full items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#E6CE20] to-amber-600 text-black">
              <Play className="h-7 w-7 fill-current" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
                {t.nowPlaying}
              </span>
              <span className="mt-1 block truncate text-lg font-bold">
                {MUSIC_LIBRARY[0].title}
              </span>
              <span className="block truncate text-sm text-white/55">
                {MUSIC_LIBRARY[0].artist} · {MUSIC_LIBRARY[0].album}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#E6CE20]/35 bg-[#E6CE20]/10 px-3 py-2 text-right text-[#E6CE20]">
              <span className="hidden max-w-32 text-xs leading-tight sm:block">
                <span className="block font-semibold">{t.chooseMusic}</span>
                <span className="mt-0.5 block text-[10px] text-white/55">{t.musicHint}</span>
              </span>
              <span className="text-xs font-semibold sm:hidden">{t.chooseMusic}</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>

      <section className="passenger-home-quick-access">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          {t.quickAccess}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAccessCard
            accent
            badge={t.playNow}
            icon={<Gamepad2 />}
            label={t.utahTrivia}
            description={t.utahTriviaDescription}
            onClick={() => onNavigate("games")}
          />
          <PhoneContinuationCard
            compact
            description={t.continuePhoneDescription}
            href={config.passengerConsole.links.phoneContinuation}
            label={t.continuePhone}
            unavailable={t.unavailable}
          />
        </div>
      </section>

      <section className="passenger-home-ticker overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025]">
        <ServiceTicker config={config} />
      </section>
      <button
        type="button"
        onClick={() => onNavigate("meet-juan")}
        className="passenger-home-host group relative flex min-h-[104px] items-center gap-4 overflow-hidden rounded-[26px] border border-[#E6CE20]/20 bg-gradient-to-r from-[#E6CE20]/10 via-white/[0.045] to-white/[0.02] p-4 text-left transition hover:border-[#E6CE20]/45 hover:bg-[#E6CE20]/[0.1]"
      >
        <span className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#E6CE20]/15 blur-3xl" />
        <img
          src={config.meetPhoto}
          alt={config.ownerName}
          loading="lazy"
          decoding="async"
          className="relative h-16 w-16 shrink-0 rounded-2xl border border-[#E6CE20]/35 object-cover shadow-[0_0_20px_rgba(230,206,32,0.12)]"
        />
        <span className="relative min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
            {t.hostCardEyebrow}
          </span>
          <span className="mt-1 block text-lg font-extrabold">{config.ownerName}</span>
          <span className="mt-1 block truncate text-sm text-white/60">{t.hostCardDescription}</span>
        </span>
        <span className="relative flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#E6CE20]">
          {t.meetJuan}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>
    </div>
  );
}

function SecondaryClock({ label, time }: { label: string; time: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55">
        {label}
      </span>
      <span className="text-[10px] font-semibold tabular-nums text-white/75">{time}</span>
    </div>
  );
}

function isNightAt(now: Date | null, timeZone: string) {
  if (!now) return false;
  const hour = Number(
    now.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }),
  );
  return Number.isFinite(hour) && (hour >= 19 || hour < 6);
}

function WeatherDetailDialog({
  city,
  fallbackTemperatureFahrenheit,
  language,
  onOpenChange,
  open,
  timeZone,
  t,
  weather,
  weatherStatus,
}: {
  city: string;
  fallbackTemperatureFahrenheit: number;
  language: Language;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  timeZone: string;
  t: (typeof copy)[Language];
  weather: PassengerWeatherSnapshot | null;
  weatherStatus: PassengerWeatherStatus;
}) {
  const locale = language === "es" ? "es-MX" : "en-US";
  const formatTemperature = (temperatureFahrenheit: number) =>
    language === "es"
      ? `${Math.round(((temperatureFahrenheit - 32) * 5) / 9)}°C`
      : `${Math.round(temperatureFahrenheit)}°F`;
  const forecast = (weather?.periods ?? []).slice(0, 4).map((period) => {
    const forecastDate = new Date(period.startTime);
    return {
      label: forecastDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        timeZone,
      }),
      temperature: formatTemperature(period.temperatureFahrenheit),
      condition: weatherConditionLabel(period.condition, t),
    };
  });
  const current = weather?.periods[0];
  const updatedAt = weather
    ? new Date(weather.updatedAt).toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%_-_2rem)] max-w-xl rounded-[28px] border-white/10 bg-[#151515] text-white">
        <DialogHeader>
          <DialogTitle className="text-left text-2xl font-extrabold">
            {t.weatherDetailTitle}
          </DialogTitle>
          <DialogDescription className="text-left text-white/55">
            {t.weatherDetailDescription} {city}.
          </DialogDescription>
        </DialogHeader>

        {current ? (
          <>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <WeatherMetric
                label={t.weather}
                value={weatherConditionLabel(current.condition, t)}
              />
              <WeatherMetric
                label={t.precipitation}
                value={
                  current.precipitationChance === null ? "—" : `${current.precipitationChance}%`
                }
              />
              <WeatherMetric
                label={t.wind}
                value={[current.windDirection, current.windSpeed].filter(Boolean).join(" ") || "—"}
              />
            </div>

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
                {t.nextHours}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {forecast.map((hour, index) => (
                  <div
                    key={`${hour.label}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <p className="text-xs font-semibold text-white/55">{hour.label}</p>
                    <p className="mt-2 text-xl font-bold">{hour.temperature}</p>
                    <p className="mt-1 text-[10px] leading-tight text-white/50">{hour.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-[#E6CE20]/25 bg-[#E6CE20]/[0.06] p-4">
            <p className="text-lg font-bold">{formatTemperature(fallbackTemperatureFahrenheit)}</p>
            <p className="mt-2 font-semibold text-white/80">{t.weatherUnavailable}</p>
            <p className="mt-1 text-sm text-white/55">{t.weatherUnavailableDescription}</p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/50">
          <Cloud className="h-4 w-4 text-[#E6CE20]" />
          <span>
            {updatedAt ? `${t.updated} ${updatedAt}` : t.weatherUnavailable}
            {weatherStatus === "unavailable" && weather ? ` · ${t.offline}` : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function weatherConditionLabel(condition: PassengerWeatherCondition, t: (typeof copy)[Language]) {
  const labels: Record<PassengerWeatherCondition, string> = {
    clear: t.conditionClear,
    "mostly-clear": t.conditionMostlyClear,
    "partly-cloudy": t.conditionPartlyCloudy,
    cloudy: t.conditionCloudy,
    rain: t.conditionRain,
    thunderstorms: t.conditionThunderstorms,
    snow: t.conditionSnow,
    fog: t.conditionFog,
    smoke: t.conditionSmoke,
    wind: t.conditionWind,
    unknown: t.conditionUnknown,
  };
  return labels[condition];
}

function WeatherConditionIcon({
  className,
  condition,
  night = false,
}: {
  className?: string;
  condition: PassengerWeatherCondition;
  night?: boolean;
}) {
  const Icon =
    condition === "clear" || condition === "mostly-clear"
      ? night
        ? MoonStar
        : Sun
      : condition === "partly-cloudy" || condition === "cloudy"
        ? CloudSun
        : condition === "rain"
          ? CloudRain
          : condition === "thunderstorms"
            ? CloudLightning
            : condition === "snow"
              ? Snowflake
              : condition === "fog" || condition === "smoke"
                ? CloudFog
                : condition === "wind"
                  ? Wind
                  : Cloud;

  return <Icon className={className} aria-hidden="true" />;
}

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function QuickAccessCard({
  accent = false,
  badge,
  description,
  icon,
  label,
  onClick,
}: {
  accent?: boolean;
  badge?: string;
  description: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[166px] flex-col overflow-hidden rounded-[24px] border p-4 text-left transition ${
        accent
          ? "border-[#E6CE20] bg-[#E6CE20] text-black"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent ? "bg-black/10" : "bg-[#E6CE20]/15 text-[#E6CE20]"}`}
        >
          {icon}
        </span>
        {badge && (
          <span
            className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${
              accent ? "bg-black/10 text-black/65" : "bg-[#E6CE20]/10 text-[#E6CE20]"
            }`}
          >
            {badge}
          </span>
        )}
      </span>
      <span className="mt-auto block text-base font-bold leading-tight">
        {label} <ChevronRight className="inline h-4 w-4" />
      </span>
      <span
        className={`mt-1 block text-xs leading-snug ${accent ? "text-black/70" : "text-white/55"}`}
      >
        {description}
      </span>
    </button>
  );
}

function MusicView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const music = config.passengerConsole.music;
  if (music.mode === "provider" && music.providerName === "Spotify") {
    return (
      <PersonalSpotifyMusicView
        onNavigate={onNavigate}
        catalogMarket={music.catalogMarket}
        searchEnabled={music.searchEnabled}
        searchResultLimit={music.searchResultLimit}
        t={t}
      />
    );
  }

  return <SimulatedMusicView config={config} onNavigate={onNavigate} t={t} />;
}

type SpotifyPlaybackState =
  | { state: "disabled" }
  | { state: "driver-setup-required" }
  | { state: "not-connected" }
  | {
      state: "ready";
      playback: {
        hasActiveDevice: boolean;
        isPlaying: boolean;
        track: {
          title: string;
          artist: string;
          album: string | null;
          artworkUrl: string | null;
        } | null;
      };
    };

type SpotifySearchTrack = {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string | null;
  artworkUrl: string | null;
  durationMs: number | null;
  explicit: boolean;
};

function PersonalSpotifyHomeCard({
  onNavigate,
  t,
}: {
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const [status, setStatus] = useState<SpotifyPlaybackState | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      try {
        const next = await getPersonalSpotifyPlayback({ data: {} });
        if (isMounted) setStatus(next);
      } catch {
        // The detailed recovery state stays in Music; Home remains a safe entry point.
        if (isMounted) setStatus(null);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const playback = status?.state === "ready" ? status.playback : null;
  const track = playback?.track ?? null;
  const hasActiveDevice = playback?.hasActiveDevice ?? false;

  return (
    <button
      type="button"
      onClick={() => onNavigate("music")}
      className="group relative flex min-h-[174px] w-full min-w-0 items-center gap-5 overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.04] to-[#E6CE20]/[0.09] p-5 text-left transition hover:border-[#E6CE20]/35 hover:bg-white/[0.07]"
    >
      <span className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-[#E6CE20]/10 blur-3xl" />
      {track?.artworkUrl ? (
        <img
          src={track.artworkUrl}
          alt=""
          className="relative h-24 w-24 shrink-0 rounded-[22px] object-cover shadow-xl"
        />
      ) : (
        <span className="relative grid h-24 w-24 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#E6CE20] to-amber-600 text-black shadow-xl">
          <Music2 className="h-9 w-9" />
        </span>
      )}
      <span className="relative min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
          {t.nowPlaying}
        </span>
        <span className="mt-2 block truncate text-xl font-black tracking-tight">
          {track?.title ?? t.chooseMusic}
        </span>
        <span className="mt-1 block truncate text-sm text-white/60">
          {track ? `${track.artist}${track.album ? ` · ${track.album}` : ""}` : t.spotifyNoDevice}
        </span>
        <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {t.spotifyDevice}: {hasActiveDevice ? t.spotifyActive : "—"}
        </span>
      </span>
      <span className="relative flex shrink-0 items-center gap-2 rounded-2xl border border-[#E6CE20]/40 bg-[#E6CE20]/12 px-4 py-3 text-right text-[#E6CE20] transition group-hover:bg-[#E6CE20]/18">
        <span className="hidden max-w-36 text-xs leading-tight sm:block">
          <span className="block font-semibold">{t.chooseMusic}</span>
          <span className="mt-0.5 block text-[10px] text-white/55">{t.musicHint}</span>
        </span>
        <span className="text-xs font-semibold sm:hidden">{t.chooseMusic}</span>
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function PersonalSpotifyMusicView({
  catalogMarket,
  onNavigate,
  searchEnabled,
  searchResultLimit,
  t,
}: {
  catalogMarket: string;
  onNavigate: (view: View) => void;
  searchEnabled: boolean;
  searchResultLimit: number;
  t: (typeof copy)[Language];
}) {
  const [status, setStatus] = useState<SpotifyPlaybackState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifySearchTrack[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const refresh = useCallback(
    async (silent = false) => {
      if (!silent) setError(null);
      try {
        const next = await getPersonalSpotifyPlayback({ data: {} });
        setStatus(next);
        return next;
      } catch (requestError) {
        if (!silent) {
          setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
        }
        return null;
      }
    },
    [t.spotifyControlError],
  );

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(true);
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [refresh]);

  const trackKey = (playbackStatus: SpotifyPlaybackState | null) => {
    if (playbackStatus?.state !== "ready" || !playbackStatus.playback.track) return null;
    const { artist, title } = playbackStatus.playback.track;
    return `${artist}\u0000${title}`;
  };

  const refreshUntilTrackChanges = async (previousTrackKey: string | null) => {
    for (const delay of [500, 800, 1_200]) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      const next = await refresh(true);
      const nextTrackKey = trackKey(next);
      if (nextTrackKey && nextTrackKey !== previousTrackKey) return;
    }
  };

  const control = async (command: "play" | "pause" | "next") => {
    setBusy(true);
    setError(null);
    try {
      const previousTrackKey = trackKey(status);
      await controlPersonalSpotifyPlayback({ data: { command } });
      if (command === "next") {
        await refreshUntilTrackChanges(previousTrackKey);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
        await refresh();
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
    } finally {
      setBusy(false);
    }
  };

  const searchTracks = async (rawQuery: string) => {
    const normalizedQuery = rawQuery.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setSearchMessage(t.searchMinLength);
      return;
    }

    setSearching(true);
    setError(null);
    setSearchMessage(null);
    try {
      const response = await searchPersonalSpotifyTracks({
        data: { query: normalizedQuery, limit: searchResultLimit, market: catalogMarket },
      });
      setResults(response.tracks);
      setSearchMessage(response.tracks.length ? null : t.searchEmpty);
    } catch (requestError) {
      setResults([]);
      setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
    } finally {
      setSearching(false);
    }
  };

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void searchTracks(query);
  };

  const searchVibe = (vibe: string) => {
    setQuery(vibe);
    void searchTracks(vibe);
  };

  const playTrack = async (uri: string) => {
    setBusy(true);
    setError(null);
    try {
      const previousTrackKey = trackKey(status);
      await playPersonalSpotifyTrack({ data: { uri } });
      await refreshUntilTrackChanges(previousTrackKey);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
    } finally {
      setBusy(false);
    }
  };

  const isMusicUnavailable = status?.state === "disabled";
  const message = isMusicUnavailable
    ? t.musicUnavailableDescription
    : status?.state === "driver-setup-required" || status?.state === "not-connected"
      ? t.musicGettingReadyDescription
      : null;
  const playback = status?.state === "ready" ? status.playback : null;

  return (
    <div className="passenger-music-layout flex flex-col gap-5">
      <div className="passenger-music-header">
        <ViewHeader eyebrow={t.musicEyebrow} title={t.musicTitle} description={t.musicSubtitle} />
      </div>
      {message ? (
        <section className="passenger-music-playback passenger-music-now-playing flex min-h-[312px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.04] to-[#E6CE20]/[0.13] p-6 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-[26px] bg-gradient-to-br from-[#E6CE20] to-amber-600 text-black shadow-2xl">
            <Music2 className="h-10 w-10" />
          </span>
          <p className="mt-5 text-xl font-black tracking-tight">
            {isMusicUnavailable ? t.musicUnavailableTitle : t.musicGettingReady}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{message}</p>
        </section>
      ) : playback ? (
        <section className="passenger-music-playback passenger-music-now-playing passenger-music-now-playing-ready relative flex min-h-[286px] items-center gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.04] to-[#E6CE20]/[0.13] p-7 text-left">
          <span className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-[#E6CE20]/15 blur-3xl" />
          {playback.track?.artworkUrl ? (
            <img
              src={playback.track.artworkUrl}
              alt=""
              className="passenger-music-now-playing-art relative h-52 w-52 shrink-0 rounded-[28px] object-cover shadow-2xl"
            />
          ) : (
            <div className="passenger-music-now-playing-art relative h-52 w-52 shrink-0 rounded-[28px] bg-gradient-to-br from-[#E6CE20] via-amber-500 to-orange-700 shadow-2xl" />
          )}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center self-stretch">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
              {t.nowPlaying}
            </p>
            <p className="mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-tight">
              {playback.track?.title ?? t.chooseMusic}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/60">
              {playback.track
                ? `${playback.track.artist}${playback.track.album ? ` · ${playback.track.album}` : ""}`
                : t.spotifyNoDevice}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {t.spotifyDevice}: {playback.hasActiveDevice ? t.spotifyActive : "—"}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={busy || !playback.hasActiveDevice}
                onClick={() => void control(playback.isPlaying ? "pause" : "play")}
                className="grid h-12 w-12 place-items-center rounded-full bg-[#E6CE20] text-black disabled:opacity-45"
                aria-label={playback.isPlaying ? "Pause" : "Play"}
              >
                {playback.isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </button>
              <button
                type="button"
                disabled={busy || !playback.hasActiveDevice}
                onClick={() => void control("next")}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/15 disabled:opacity-45"
                aria-label="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="passenger-music-playback passenger-music-now-playing flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.05] p-5 text-sm text-white/60">
          <Music2 className="h-10 w-10 text-[#E6CE20]" />
          <p className="mt-4">{t.spotifyRefresh}</p>
        </section>
      )}
      <div className="passenger-music-actions flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 disabled:opacity-45"
        >
          {t.spotifyRefresh}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="text-sm text-white/55 underline underline-offset-4"
        >
          {t.home}
        </button>
      </div>
      {error && <p className="passenger-music-error text-sm text-red-300">{error}</p>}
      {searchEnabled && (
        <section className="passenger-music-search rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
            {t.searchSpotify}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{t.searchSpotifyHint}</p>
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {t.exploreMusic}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MUSIC_VIBES.map((vibe) => (
                <button
                  key={vibe.query}
                  type="button"
                  disabled={searching}
                  onClick={() => searchVibe(vibe.query)}
                  className="rounded-full border border-[#E6CE20]/30 bg-[#E6CE20]/[0.08] px-3 py-1.5 text-xs font-semibold text-[#E6CE20] transition hover:bg-[#E6CE20]/[0.16] disabled:opacity-45"
                >
                  {t[vibe.labelKey]}
                </button>
              ))}
            </div>
          </div>
          <form className="mt-4 flex gap-2" onSubmit={(event) => void search(event)}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={100}
              placeholder={t.search}
              aria-label={t.searchSpotify}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#E6CE20]/70"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-2xl bg-[#E6CE20] px-4 text-sm font-bold text-black disabled:opacity-45"
            >
              {searching ? "…" : t.searchButton}
            </button>
          </form>
          {searchMessage && <p className="mt-3 text-sm text-white/55">{searchMessage}</p>}
          {!searchMessage && results.length === 0 && (
            <div className="passenger-music-landscape-prompt hidden">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[#E6CE20]/25 bg-[#E6CE20]/10 text-[#E6CE20]">
                <Search className="h-7 w-7" />
              </span>
              <p className="mt-4 text-xl font-bold">{t.musicDiscoveryTitle}</p>
              <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-white/50">
                {t.musicDiscoveryDescription}
              </p>
              <div className="passenger-music-landscape-quick-picks mt-6 grid w-full max-w-lg grid-cols-3 gap-3">
                {[
                  { label: t.vibeTopUs, query: "spotify top 50 usa" },
                  { label: t.vibeTopGlobal, query: "spotify top 50 global" },
                  { label: t.vibeToday, query: "today's top hits" },
                ].map((pick) => (
                  <button
                    key={pick.query}
                    type="button"
                    disabled={searching}
                    onClick={() => searchVibe(pick.query)}
                    className="rounded-2xl border border-[#E6CE20]/25 bg-[#E6CE20]/[0.06] px-3 py-4 text-left text-xs font-bold text-[#E6CE20] transition hover:bg-[#E6CE20]/[0.14] disabled:opacity-45"
                  >
                    {pick.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {t.searchResults}
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {results.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    disabled={busy || !playback?.hasActiveDevice}
                    onClick={() => void playTrack(track.uri)}
                    className="flex w-full items-center gap-3 border-b border-white/10 bg-black/10 p-3 text-left last:border-b-0 hover:bg-white/[0.05] disabled:opacity-45"
                    aria-label={`${t.playSong}: ${track.title}`}
                  >
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
                        <Music2 className="h-4 w-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{track.title}</span>
                      <span className="block truncate text-xs text-white/55">
                        {track.artist}
                        {track.album ? ` · ${track.album}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[#E6CE20]">
                      {track.explicit && (
                        <span className="text-[9px] font-bold uppercase">{t.explicit}</span>
                      )}
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      <aside className="passenger-music-jam rounded-[24px] border border-[#E6CE20]/25 bg-[#E6CE20]/[0.06] p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
            <Music2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">{t.jamTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/65">{t.jamDescription}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E6CE20]">
              {t.jamStatus}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SimulatedMusicView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const [query, setQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return MUSIC_LIBRARY;
    return MUSIC_LIBRARY.filter((track) =>
      `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(normalized),
    );
  }, [query]);
  const current = MUSIC_LIBRARY[currentIndex];

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader eyebrow={t.preview} title={t.musicTitle} description={t.musicSubtitle} />
      <section className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-[#E6CE20] via-amber-500 to-orange-700" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
            {t.nowPlaying}
          </p>
          <p className="mt-1 truncate text-lg font-bold">{current.title}</p>
          <p className="truncate text-sm text-white/55">
            {current.artist} · {current.album}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-[#E6CE20]" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            className="grid h-12 w-12 place-items-center rounded-full bg-[#E6CE20] text-black"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => (index + 1) % MUSIC_LIBRARY.length)}
            className="grid h-12 w-12 place-items-center rounded-full border border-white/15"
            aria-label="Next"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </section>
      {config.passengerConsole.music.jamNoticeEnabled && (
        <aside className="rounded-[24px] border border-[#E6CE20]/25 bg-[#E6CE20]/[0.06] p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
              <Music2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">{t.jamTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{t.jamDescription}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E6CE20]">
                {t.jamStatus}
              </p>
            </div>
          </div>
        </aside>
      )}
      <label className="relative block">
        <span className="sr-only">{t.search}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E6CE20]/60"
        />
      </label>
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          {t.results}
        </p>
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
          {results.map((track) => {
            const index = MUSIC_LIBRARY.indexOf(track);
            return (
              <button
                key={track.title}
                type="button"
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(true);
                }}
                className={`flex min-h-[70px] w-full items-center gap-3 border-b border-white/5 px-4 text-left last:border-none ${index === currentIndex ? "bg-[#E6CE20]/10" : "hover:bg-white/[0.04]"}`}
              >
                <span className="w-5 text-right text-xs text-white/45">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{track.title}</span>
                  <span className="block truncate text-sm text-white/55">
                    {track.artist} · {track.album}
                  </span>
                </span>
                <span className="text-sm text-white/45">{track.duration}</span>
              </button>
            );
          })}
        </div>
      </section>
      <button
        type="button"
        onClick={() => onNavigate("home")}
        className="w-fit text-sm text-white/55 underline underline-offset-4"
      >
        {t.home}
      </button>
    </div>
  );
}

function GamesView({
  language,
  phoneContinuation,
  t,
  thisOrThatEnabled,
  utahTriviaEnabled,
}: {
  language: Language;
  phoneContinuation: string | null;
  t: (typeof copy)[Language];
  thisOrThatEnabled: boolean;
  utahTriviaEnabled: boolean;
}) {
  const [activeGame, setActiveGame] = useState<"trivia" | "choice" | null>(null);

  if (activeGame === "trivia" && utahTriviaEnabled) {
    return <UtahTrivia language={language} onExit={() => setActiveGame(null)} />;
  }

  if (activeGame === "choice" && thisOrThatEnabled) {
    return <ThisOrThat language={language} onExit={() => setActiveGame(null)} />;
  }

  return (
    <div className="passenger-games-layout flex flex-1 flex-col gap-5">
      <div className="passenger-games-header">
        <ViewHeader eyebrow={t.gamesEyebrow} title={t.gamesTitle} description={t.gamesSubtitle} />
      </div>
      <div className="passenger-games-grid grid flex-1 grid-cols-2 gap-4">
        <GameCard
          kind="trivia"
          title={t.utahTrivia}
          description={t.utahTriviaDescription}
          previewLabel={t.triviaPreview}
          icon={<HoneycombMark />}
          onClick={utahTriviaEnabled ? () => setActiveGame("trivia") : undefined}
          status={utahTriviaEnabled ? t.playNow : t.comingSoon}
        />
        <GameCard
          kind="choice"
          title={t.thisOrThat}
          description={t.thisOrThatDescription}
          previewLabel={t.choicePreview}
          choiceLabels={[t.choiceFirst, t.choiceSecond]}
          icon={<ArrowLeftRight className="h-7 w-7" />}
          onClick={thisOrThatEnabled ? () => setActiveGame("choice") : undefined}
          status={thisOrThatEnabled ? t.playNow : t.comingSoon}
        />
      </div>
      <div className="passenger-games-coming-soon-grid grid gap-4">
        <section className="passenger-games-horizon relative aspect-[1200/509] overflow-hidden rounded-[26px] border border-[#E6CE20]/35 bg-[#12120c] shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
          <img
            src={horizonQuickActionCard}
            alt="Streex Horizon. Play the challenge."
            className="block h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent px-5 pb-4 pt-12">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E6CE20]">
                {t.comingSoon}
              </p>
              <p className="mt-1 text-sm font-semibold leading-tight text-white">
                {t.horizonTabletSoon}
              </p>
              <p className="mt-1 text-xs text-white/60">{t.horizonPhone}</p>
            </div>
          </div>
        </section>
        <section className="passenger-games-future relative aspect-[1200/509] overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#151515] via-[#0f1114] to-[#16211d] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)]">
          <span className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#E6CE20]/12 blur-3xl" />
          <span className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#E6CE20]/70 to-transparent" />
          <div className="relative flex h-full flex-col justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#E6CE20]/25 bg-[#E6CE20]/10 text-[#E6CE20]">
              <Gamepad2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E6CE20]">
                {t.comingSoon}
              </p>
              <p className="mt-2 text-xl font-black tracking-tight text-white">
                {t.futureGameTitle}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/55">
                {t.futureGameDescription}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function GameCard({
  description,
  icon,
  kind,
  previewLabel,
  choiceLabels,
  onClick,
  status,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  kind: "trivia" | "choice";
  previewLabel: string;
  choiceLabels?: [string, string];
  onClick?: () => void;
  status: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`passenger-game-card passenger-game-card--${kind}`}
    >
      <div className="passenger-game-card-art" aria-hidden="true">
        {kind === "trivia" ? (
          <>
            <img src={utahTriviaSymbols} alt="" className="passenger-game-card-art-image" />
            <span className="passenger-game-card-art-shade passenger-game-card-art-shade--trivia" />
            <span className="passenger-game-card-trivia-stamp">UT</span>
          </>
        ) : (
          <div className="passenger-game-card-choice-split">
            {THIS_OR_THAT_TRAILER_VISUALS.slice(0, 2).map((visual, index) => (
              <span key={visual.src} className="passenger-game-card-choice-panel">
                <img src={visual.src} alt="" style={{ objectPosition: visual.objectPosition }} />
                <span
                  className={`passenger-game-card-choice-shade passenger-game-card-choice-shade--${index + 1}`}
                />
              </span>
            ))}
            <span className="passenger-game-card-or">OR</span>
          </div>
        )}
      </div>
      <div className="passenger-game-card-content">
        <span className="passenger-game-card-icon">{icon}</span>
        <div className="passenger-game-card-copy">
          <p className="passenger-game-card-preview">
            {kind === "trivia" ? "10 QUESTIONS · UTAH EDITION" : previewLabel}
          </p>
          <p className="passenger-game-card-title">{title}</p>
          <p className="passenger-game-card-description">{description}</p>
          {kind === "choice" && (
            <span className="passenger-game-card-choice-words">
              {choiceLabels?.[0] ?? "THIS"} <span>·</span> {choiceLabels?.[1] ?? "THAT"}
            </span>
          )}
        </div>
        <span className="passenger-game-card-status">{status}</span>
      </div>
    </button>
  );
}

function StreexView({
  config,
  onBookRide,
  onNavigate,
  phoneContinuation,
  t,
}: {
  config: AppConfig;
  onBookRide: () => void;
  onNavigate: (view: View) => void;
  phoneContinuation: string | null;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="passenger-streex-layout flex flex-col gap-5">
      <section className="passenger-streex-overview flex flex-col gap-5">
        <div className="passenger-streex-header">
          <ViewHeader
            eyebrow={t.streexDifference}
            title={t.streexTitle}
            description={t.streexSubtitle}
          />
        </div>
        <div className="passenger-streex-actions grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <ActionButton
              accent
              icon={<HandCoins />}
              label={t.tip}
              onClick={() => onNavigate("tip")}
            />
          </div>
          <ActionButton icon={<Menu />} label={t.services} onClick={() => onNavigate("services")} />
          <ActionButton icon={<Phone />} label={t.contact} onClick={() => onNavigate("contact")} />
          <ActionButton icon={<Star />} label={t.reviews} onClick={() => onNavigate("reviews")} />
          <ActionButton
            icon={<MapPin />}
            label={t.whereWeRide}
            onClick={() => onNavigate("where-we-ride")}
          />
          <ActionButton accent icon={<CalendarPlus />} label={t.bookRide} onClick={onBookRide} />
          <MeetJuanAction
            config={config}
            label={t.meetJuan}
            onClick={() => onNavigate("meet-juan")}
            subtitle={configOwnerLine(t)}
          />
          <PhoneContinuationCard
            description={t.continuePhoneDescription}
            href={phoneContinuation}
            label={t.continuePhone}
            unavailable={t.unavailable}
          />
        </div>
      </section>
      <div className="passenger-streex-experience">
        <PassengerVehicleGrid title={t.yourRideGallery} />
      </div>
    </div>
  );
}

function PassengerVehicleGrid({ title }: { title: string }) {
  const vehicles = [
    {
      alt: "Silver Toyota RAV4, front three-quarter view",
      image: passengerRav4Front,
      position: "object-center",
    },
    {
      alt: "Silver Toyota RAV4, rear view at dusk",
      image: passengerRav4Rear,
      position: "object-center",
    },
    {
      alt: "Silver Toyota RAV4 in the snow",
      image: passengerRav4Snow,
      position: "object-center",
    },
    {
      alt: "Silver Toyota RAV4 on the road",
      image: passengerRav4Side,
      position: "object-center",
    },
  ];

  return (
    <section className="passenger-vehicle-grid-section">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-xs font-semibold text-[#E6CE20]">Toyota RAV4</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.image}
            className="relative aspect-[0.9] min-h-[168px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]"
          >
            <img
              src={vehicle.image}
              alt={vehicle.alt}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover ${vehicle.position}`}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Toyota RAV4
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PassengerBackButton({
  onNavigate,
  t,
}: {
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate("streex")}
      className="flex w-fit items-center gap-2 text-sm text-white/55 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" /> {t.back}
    </button>
  );
}

function WhereWeRideView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="passenger-subview passenger-areas-layout flex flex-col gap-5">
      <div className="passenger-subview-intro flex flex-col gap-5">
        <PassengerBackButton onNavigate={onNavigate} t={t} />
        <ViewHeader
          eyebrow={t.streex}
          preserveEyebrowCase
          title={t.whereWeRide}
          description={t.whereWeRideDescription}
        />
      </div>
      <div className="passenger-areas-content min-h-0">
        <ServiceAreas
          config={config}
          copy={{
            eyebrow: t.whereWeRide,
            title: t.whereWeRideTitle,
            description: t.whereWeRideDescription,
            serviceArea: t.serviceArea,
            moreDestinations: t.moreDestinations,
            extendedRides: t.extendedRides,
          }}
        />
        <div className="passenger-destination-carousel-wrap">
          <ExperienceGallery
            autoScroll
            config={config}
            excludeVehicle
            title={t.streexExperienceTitle}
          />
        </div>
      </div>
    </div>
  );
}

function ServicesView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="passenger-subview passenger-services-layout flex flex-col gap-5">
      <div className="passenger-subview-intro flex flex-col gap-5">
        <PassengerBackButton onNavigate={onNavigate} t={t} />
        <ViewHeader
          eyebrow={t.streex}
          preserveEyebrowCase
          title={t.services}
          description={t.servicesTitle}
        />
      </div>
      <div className="passenger-services-content min-h-0">
        <ServicesSection className="mt-0 px-0" config={config} title={t.services} />
        <div className="passenger-services-ticker overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.025]">
          <ServiceTicker config={config} />
        </div>
      </div>
    </div>
  );
}

function ContactView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const details = [
    { icon: <Phone />, label: t.phoneAndText, detail: config.phoneDisplay },
    { icon: <MessageCircle />, label: t.whatsapp, detail: config.phoneDisplay },
    { icon: <Mail />, label: t.email, detail: config.email },
    { icon: <Globe2 />, label: t.website, detail: config.website.replace(/^https?:\/\//, "") },
  ].filter((item) => Boolean(item.detail));

  return (
    <div className="passenger-subview passenger-contact-layout flex flex-col gap-5">
      <div className="passenger-subview-intro flex flex-col gap-5">
        <PassengerBackButton onNavigate={onNavigate} t={t} />
        <ViewHeader
          eyebrow={t.streex}
          preserveEyebrowCase
          title={t.contactTitle}
          description={t.contactSubtitle}
        />
      </div>
      <div className="passenger-contact-actions grid gap-3 sm:grid-cols-2">
        {details.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[118px] items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-bold">{item.label}</span>
              <span className="mt-1 block text-sm text-white/65">{item.detail}</span>
            </span>
          </div>
        ))}
        <p className="rounded-[18px] border border-[#E6CE20]/20 bg-[#E6CE20]/[0.06] px-4 py-3 text-sm text-white/55 sm:col-span-2">
          {t.contactNote}
        </p>
      </div>
    </div>
  );
}

function ReviewsView({
  language,
  onNavigate,
  t,
}: {
  language: Language;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="passenger-subview passenger-review-layout flex flex-col gap-5">
      <div className="passenger-subview-intro flex flex-col gap-5">
        <PassengerBackButton onNavigate={onNavigate} t={t} />
        <ViewHeader
          eyebrow={t.streex}
          preserveEyebrowCase
          title={t.reviewTitle}
          description={t.reviewSubtitle}
        />
      </div>
      <div className="passenger-review-content min-h-0">
        <FeedbackForm compact language={language} />
      </div>
    </div>
  );
}

function TipView({
  config,
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const paymentMethods = [
    {
      id: "venmo",
      label: t.venmo,
      detail: `@${config.venmo.split("/").filter(Boolean).at(-1) ?? "STREEX"}`,
      href: config.venmo,
      icon: <span className="text-xl font-black italic">V</span>,
    },
    {
      id: "cashapp",
      label: t.cashApp,
      detail: config.cashapp.split("/").filter(Boolean).at(-1) ?? "$STREEX",
      href: config.cashapp,
      icon: <span className="text-xl font-black">$</span>,
    },
    {
      id: "stripe",
      label: t.cardAndWallet,
      detail: config.passengerConsole.links.stripeTip ? t.stripeDetail : t.stripePending,
      href: config.passengerConsole.links.stripeTip,
      icon: <CreditCard className="h-5 w-5" />,
    },
  ] as const;
  const firstAvailableMethod = paymentMethods.find((method) => method.href) ?? paymentMethods[0];
  const [selectedMethodId, setSelectedMethodId] = useState(firstAvailableMethod.id);
  const selectedMethod =
    paymentMethods.find((method) => method.id === selectedMethodId && method.href) ??
    firstAvailableMethod;

  return (
    <div className="passenger-subview passenger-tip-layout flex flex-col gap-5">
      <div className="passenger-subview-intro flex flex-col gap-5">
        <PassengerBackButton onNavigate={onNavigate} t={t} />
        <ViewHeader
          eyebrow={t.streex}
          preserveEyebrowCase
          title={t.tipTitle}
          description={t.tipSubtitle}
        />
      </div>
      <div className="passenger-tip-content rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-[#E6CE20]/10 p-6">
        <div className="passenger-tip-copy">
          <p className="text-2xl font-extrabold tracking-tight">{t.tipOptionsTitle}</p>
          <p className="mt-2 text-sm text-white/55">{t.tipOptionsNote}</p>
        </div>
        <div className="passenger-tip-workspace grid min-h-0 gap-5">
          <div className="passenger-tip-methods flex min-w-0 flex-col gap-3">
            <p className="text-sm font-semibold text-white/70">{t.tipInstruction}</p>
            {paymentMethods.map((method) => {
              const active = method.id === selectedMethod.id;
              const available = Boolean(method.href);
              return (
                <button
                  key={method.id}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedMethodId(method.id)}
                  className={`flex min-h-[78px] items-center gap-4 rounded-[20px] border p-4 text-left transition ${
                    active ? "border-[#E6CE20]/70 bg-[#E6CE20]/15" : "border-white/10 bg-black/20"
                  } ${available ? "hover:border-[#E6CE20]/45" : "cursor-not-allowed opacity-45"}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
                    {method.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{method.label}</span>
                    <span className="mt-1 block truncate text-xs text-white/50">
                      {method.detail}
                    </span>
                  </span>
                  {available && <ChevronRight className="ml-auto h-5 w-5 text-white/35" />}
                </button>
              );
            })}
          </div>
          <div className="passenger-tip-qr flex min-w-0 flex-col items-center justify-center rounded-[24px] border border-white/10 bg-black/25 p-5 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#E6CE20]">
              {selectedMethod.label}
            </p>
            {selectedMethod.href && (
              <div className="rounded-[20px] bg-white p-3 shadow-[0_0_45px_rgba(230,206,32,0.12)]">
                <QRCodeSVG
                  value={selectedMethod.href}
                  size={196}
                  bgColor="#FFFFFF"
                  fgColor="#0B0B0B"
                  level="M"
                />
              </div>
            )}
            <p className="mt-4 text-lg font-extrabold">{t.tipScan}</p>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-white/50">
              {t.tipSecure}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneContinuationCard({
  compact = false,
  description,
  href,
  label,
  unavailable,
}: {
  compact?: boolean;
  description: string;
  href: string | null;
  label: string;
  unavailable: string;
}) {
  if (!href) {
    return <ActionLink href={null} icon={<QrCode />} label={label} unavailable={unavailable} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={
        compact
          ? "flex min-h-[166px] flex-col rounded-[24px] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.07]"
          : "col-span-2 flex min-h-[182px] items-center gap-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.07]"
      }
    >
      <span className={`shrink-0 self-start rounded-xl bg-white ${compact ? "p-1.5" : "p-3"}`}>
        <QRCodeSVG
          value={href}
          size={compact ? 92 : 118}
          bgColor="#FFFFFF"
          fgColor="#0B0B0B"
          level="M"
        />
      </span>
      <span className={`min-w-0 flex-1 ${compact ? "mt-auto pt-3" : ""}`}>
        <span className="flex items-center gap-2 font-bold">
          {!compact && <QrCode className="h-4 w-4 text-[#E6CE20]" />}
          {label}
        </span>
        {!compact && (
          <span className="mt-1 block text-sm leading-relaxed text-white/55">{description}</span>
        )}
        <span className={`${compact ? "mt-1" : "mt-3"} block truncate text-xs text-[#E6CE20]`}>
          rides.getstreex.com
        </span>
      </span>
      {!compact && <ChevronRight className="h-5 w-5 shrink-0 text-white/45" />}
    </a>
  );
}

function configOwnerLine(t: (typeof copy)[Language]) {
  return t.meetJuan === "Meet Juan"
    ? "The person behind your ride."
    : "La persona detrás de su viaje.";
}

function MeetJuanAction({
  config,
  label,
  onClick,
  subtitle,
}: {
  config: AppConfig;
  label: string;
  onClick: () => void;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[88px] w-full items-center gap-3 rounded-[22px] border border-[#E6CE20]/35 bg-gradient-to-br from-white/[0.07] to-[#E6CE20]/[0.07] p-3 text-left text-white transition hover:border-[#E6CE20]/60 hover:bg-[#E6CE20]/[0.1]"
    >
      <img
        src={config.meetPhoto}
        alt={config.ownerName}
        loading="lazy"
        decoding="async"
        className="h-11 w-11 shrink-0 rounded-xl border border-[#E6CE20]/40 object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-white/55">{subtitle}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#E6CE20] transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function ActionLink({
  accent = false,
  href,
  icon,
  label,
  unavailable,
}: {
  accent?: boolean;
  href: string | null;
  icon: React.ReactNode;
  label: string;
  unavailable?: string;
}) {
  const className = `flex min-h-[88px] items-center gap-4 rounded-[22px] border p-4 text-left transition ${accent ? "border-[#E6CE20] bg-[#E6CE20] text-black hover:brightness-105" : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"} ${!href ? "cursor-not-allowed opacity-65" : ""}`;
  const content = (
    <>
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-black/10" : "bg-[#E6CE20]/15 text-[#E6CE20]"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{label}</span>
        {unavailable && (
          <span className={`mt-1 block text-xs ${accent ? "text-black/65" : "text-white/50"}`}>
            {unavailable}
          </span>
        )}
      </span>
      <ChevronRight className={`h-5 w-5 ${accent ? "text-black/70" : "text-white/45"}`} />
    </>
  );
  if (!href)
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}

function ActionButton({
  accent = false,
  icon,
  label,
  onClick,
}: {
  accent?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-h-[88px] items-center gap-4 rounded-[22px] border p-4 text-left transition ${accent ? "border-[#E6CE20] bg-[#E6CE20] text-black hover:brightness-105" : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"}`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-black/10" : "bg-[#E6CE20]/15 text-[#E6CE20]"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{label}</span>
      </span>
      <ChevronRight className={`h-5 w-5 ${accent ? "text-black/70" : "text-white/45"}`} />
    </button>
  );
}

function MeetJuanView({
  config,
  language,
  onNavigate,
  t,
}: {
  config: AppConfig;
  language: Language;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const meetBody = language === "es" ? config.meetBodyEs : config.meetBody;

  return (
    <div className="passenger-meet-layout flex flex-col gap-5">
      <button
        type="button"
        onClick={() => onNavigate("streex")}
        className="passenger-meet-back flex w-fit items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>
      <section className="passenger-meet-profile relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] p-6">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E6CE20]/15 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <img
            src={config.meetPhoto}
            alt={config.ownerName}
            loading="lazy"
            decoding="async"
            className="h-20 w-20 rounded-3xl border-2 border-[#E6CE20]/45 object-cover"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
              {t.meetJuan}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">{t.meetIntro}</h1>
          </div>
        </div>
        <div className="relative mt-6 space-y-3 text-sm leading-relaxed text-white/75">
          {meetBody.slice(0, 4).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Chip icon={<Languages className="h-4 w-4" />} label={t.bilingual} />
          <Chip icon={<Sparkles className="h-4 w-4" />} label={t.hospitality} />
        </div>
      </section>
      <section className="passenger-meet-gratitude rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
        <p className="text-sm leading-relaxed text-white/65">{t.gratitude}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ActionButton
            icon={<Star />}
            label={t.leaveReview}
            onClick={() => onNavigate("reviews")}
          />
          <ActionButton
            accent
            icon={<HandCoins />}
            label={t.leaveTip}
            onClick={() => onNavigate("tip")}
          />
        </div>
      </section>
      <div className="passenger-meet-notes min-h-0">
        <GuestNotesMosaic t={t} />
      </div>
    </div>
  );
}

function GuestNotesMosaic({ t }: { t: (typeof copy)[Language] }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6CE20]">
            {t.guestNotesEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight">{t.guestNotesTitle}</h2>
        </div>
        <p className="max-w-[210px] text-right text-[10px] leading-relaxed text-white/40">
          {t.guestNotesPreview}
        </p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <GuestNote className="col-span-2" quote={t.guestNoteOne} by={t.guestNoteOneBy} />
        <GuestNote className="row-span-2" quote={t.guestNoteTwo} by={t.guestNoteTwoBy} featured />
        <GuestNote className="col-span-2" quote={t.guestNoteThree} by={t.guestNoteThreeBy} />
      </div>
    </section>
  );
}

function GuestNote({
  by,
  className,
  featured = false,
  quote,
}: {
  by: string;
  className: string;
  featured?: boolean;
  quote: string;
}) {
  return (
    <article
      className={`flex min-h-[118px] flex-col justify-between rounded-[22px] border p-4 ${
        featured
          ? "border-[#E6CE20]/30 bg-gradient-to-br from-[#E6CE20]/18 to-[#E6CE20]/[0.03]"
          : "border-white/10 bg-black/20"
      } ${className}`}
    >
      <p className="text-sm font-medium leading-relaxed text-white/85">{quote}</p>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E6CE20]">
        {by}
      </p>
    </article>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/80">
      {icon}
      {label}
    </span>
  );
}

function ViewHeader({
  description,
  eyebrow,
  preserveEyebrowCase = false,
  title,
}: {
  description: string;
  eyebrow: string;
  preserveEyebrowCase?: boolean;
  title: string;
}) {
  return (
    <header>
      <p
        className={`text-[10px] font-semibold tracking-[0.22em] text-[#E6CE20] ${
          preserveEyebrowCase ? "" : "uppercase"
        }`}
      >
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>
    </header>
  );
}

function ConsoleNavigation({
  activeView,
  onNavigate,
  t,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const active =
    activeView === "meet-juan" ||
    activeView === "services" ||
    activeView === "contact" ||
    activeView === "reviews" ||
    activeView === "tip" ||
    activeView === "where-we-ride"
      ? "streex"
      : activeView;
  const items = [
    { id: "home" as const, label: t.home, icon: <Play className="h-5 w-5 rotate-[270deg]" /> },
    { id: "music" as const, label: t.music, icon: <Music2 className="h-5 w-5" /> },
    { id: "games" as const, label: t.games, icon: <Gamepad2 className="h-5 w-5" /> },
    {
      id: "streex" as const,
      label: t.streex,
      icon: (
        <img
          src="/icons/streex-mark-black-48.png"
          alt=""
          aria-hidden="true"
          className="h-5 w-5 rounded-sm object-contain"
        />
      ),
    },
  ];
  return (
    <nav
      aria-label="Passenger console"
      className="z-20 mt-4 flex shrink-0 gap-1 rounded-[28px] border border-white/10 bg-[#161614]/95 p-2 backdrop-blur"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={`flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-2 text-xs font-semibold transition ${active === item.id ? "bg-[#E6CE20] text-black" : "text-white/65 hover:bg-white/[0.05] hover:text-white"}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
