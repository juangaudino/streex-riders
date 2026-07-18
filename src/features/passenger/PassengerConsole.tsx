import { useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@/config";
import {
  ArrowLeft,
  CalendarPlus,
  ChevronRight,
  Cloud,
  Gamepad2,
  HandCoins,
  Languages,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Music2,
  Pause,
  Phone,
  Play,
  QrCode,
  Search,
  SkipForward,
  Sparkles,
  Star,
  UserRound,
  Wifi,
} from "lucide-react";
import { ServiceTicker } from "@/components/streex/ServiceTicker";
import { BookingFormModal } from "@/components/streex/BookingFormModal";
import { FeedbackForm } from "@/components/streex/FeedbackForm";
import { PaymentOptions } from "@/components/streex/PaymentOptions";
import { ServicesSection } from "@/components/streex/ServicesSection";
import { QRCodeSVG } from "qrcode.react";
import {
  controlPersonalSpotifyPlayback,
  getPersonalSpotifyPlayback,
} from "@/lib/spotify.functions";

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
  | "tip";

type PassengerConsoleProps = {
  config: AppConfig;
};

const MUSIC_LIBRARY = [
  { title: "Midnight Drive", artist: "The Wayfarers", album: "Neon Roads", duration: "3:42" },
  { title: "Canyon Light", artist: "Sable & Sun", album: "Utah Skies", duration: "4:11" },
  { title: "Golden Hour", artist: "Rivera", album: "West Coast Nights", duration: "3:58" },
  { title: "Quiet Passenger", artist: "Marlow", album: "Backseat Tapes", duration: "2:47" },
];

const copy = {
  en: {
    home: "Home",
    music: "Music",
    games: "Games",
    streex: "STREEX",
    welcome: "Welcome aboard",
    subtitle: "Everything you need is one tap away.",
    weather: "Weather",
    nowPlaying: "Now playing",
    chooseMusic: "Choose the soundtrack",
    musicHint: "Tap to browse songs, artists and moods.",
    quickAccess: "Quick access",
    musicDescription: "Curated sound for your ride",
    gamesDescription: "Utah trivia & light games",
    streexDescription: "Book, tip, review & more",
    open: "Open",
    online: "Online",
    offline: "Offline",
    preview: "Simulated preview — no live music provider",
    spotifyPersonal: "Personal Spotify connection",
    spotifyDisabled: "The personal Spotify connection is not enabled.",
    spotifyDriverSetup: "Your driver can finish the private Spotify setup before controls become available.",
    spotifyNotConnected: "Your driver has not connected Spotify yet.",
    spotifyNoDevice: "Open Spotify on the vehicle audio device, then choose it as the active Spotify Connect device.",
    spotifyDevice: "Vehicle audio",
    spotifyActive: "Active",
    spotifyRefresh: "Refresh",
    spotifyControlError: "Spotify could not update playback. Please try again.",
    musicTitle: "Music",
    musicSubtitle: "A provider-neutral preview for your vehicle audio.",
    jamTitle: "Spotify Jam",
    jamDescription:
      "Want to add your own music? Ask your driver to host a Jam, then scan the QR shown in Spotify with your phone.",
    jamStatus: "Available when hosted by your driver",
    search: "Search songs, artists, moods…",
    results: "Results",
    gamesTitle: "Games",
    gamesSubtitle: "Light entertainment for the road.",
    comingSoon: "Coming soon",
    utahTrivia: "Utah Trivia",
    utahTriviaDescription: "Test what you know about the Beehive State.",
    thisOrThat: "This or That",
    thisOrThatDescription: "Quick, playful choices between two options.",
    streexTitle: "Your STREEX experience",
    streexSubtitle: "Helpful links for the rest of your journey.",
    bookRide: "Book another ride",
    services: "Services",
    contact: "Contact",
    reviews: "Reviews",
    tip: "Leave a tip",
    continuePhone: "Continue on your phone",
    continuePhoneDescription: "Scan to continue your STREEX experience on your phone.",
    meetJuan: "Meet Juan",
    unavailable: "Coming soon",
    meetIntro: "Hi, I’m Juan.",
    gratitude:
      "If your ride felt right, a review or a tip is always appreciated — only if you feel like it.",
    leaveReview: "Leave a review",
    leaveTip: "Leave a tip",
    back: "Back to STREEX",
    bilingual: "English + Español",
    hospitality: "Hospitality first",
    qrNote: "The phone continuation link will appear here when configured.",
    servicesTitle: "Services for every kind of ride.",
    contactTitle: "Contact STREEX",
    contactSubtitle: "Choose the way that works best for you.",
    call: "Call",
    text: "Text",
    whatsapp: "WhatsApp",
    email: "Email",
    reviewTitle: "Share your experience",
    reviewSubtitle: "Your feedback helps us make every ride better.",
    tipTitle: "Thank you for riding with STREEX",
    tipSubtitle: "Optional ways to show your appreciation.",
  },
  es: {
    home: "Inicio",
    music: "Música",
    games: "Juegos",
    streex: "STREEX",
    welcome: "Bienvenido a bordo",
    subtitle: "Todo lo que necesita está a un toque.",
    weather: "Clima",
    nowPlaying: "Reproduciendo",
    chooseMusic: "Elige la música",
    musicHint: "Toca para explorar canciones, artistas y moods.",
    quickAccess: "Accesos rápidos",
    musicDescription: "Sonido seleccionado para su viaje",
    gamesDescription: "Trivia de Utah y juegos ligeros",
    streexDescription: "Reservar, propina, reseñas y más",
    open: "Abrir",
    online: "En línea",
    offline: "Sin conexión",
    preview: "Vista simulada — sin proveedor de música en vivo",
    spotifyPersonal: "Conexión personal de Spotify",
    spotifyDisabled: "La conexión personal de Spotify no está habilitada.",
    spotifyDriverSetup: "Tu conductor puede terminar la configuración privada de Spotify antes de que los controles estén disponibles.",
    spotifyNotConnected: "Tu conductor todavía no ha conectado Spotify.",
    spotifyNoDevice: "Abre Spotify en el dispositivo de audio del vehículo y selecciónalo como el dispositivo activo de Spotify Connect.",
    spotifyDevice: "Audio del vehículo",
    spotifyActive: "Activo",
    spotifyRefresh: "Actualizar",
    spotifyControlError: "Spotify no pudo actualizar la reproducción. Inténtalo de nuevo.",
    musicTitle: "Música",
    musicSubtitle: "Una vista independiente del proveedor para el audio del vehículo.",
    jamTitle: "Spotify Jam",
    jamDescription:
      "¿Quieres agregar tu propia música? Pide a tu conductor que inicie una Jam y escanea el QR que aparece en Spotify desde tu teléfono.",
    jamStatus: "Disponible cuando la inicie tu conductor",
    search: "Buscar canciones, artistas o moods…",
    results: "Resultados",
    gamesTitle: "Juegos",
    gamesSubtitle: "Entretenimiento ligero para el camino.",
    comingSoon: "Próximamente",
    utahTrivia: "Trivia de Utah",
    utahTriviaDescription: "Ponga a prueba lo que sabe del Beehive State.",
    thisOrThat: "Esto o Aquello",
    thisOrThatDescription: "Elecciones rápidas y divertidas entre dos opciones.",
    streexTitle: "Tu experiencia STREEX",
    streexSubtitle: "Enlaces útiles para el resto de su viaje.",
    bookRide: "Reservar otro viaje",
    services: "Servicios",
    contact: "Contacto",
    reviews: "Reseñas",
    tip: "Dejar propina",
    continuePhone: "Continuar en su teléfono",
    continuePhoneDescription: "Escanee para continuar su experiencia STREEX en su teléfono.",
    meetJuan: "Conoce a Juan",
    unavailable: "Próximamente",
    meetIntro: "Hola, soy Juan.",
    gratitude:
      "Si su viaje se sintió bien, una reseña o propina siempre se agradece — solo si lo desea.",
    leaveReview: "Dejar una reseña",
    leaveTip: "Dejar una propina",
    back: "Volver a STREEX",
    bilingual: "Inglés + Español",
    hospitality: "Hospitalidad primero",
    qrNote: "El enlace para continuar en su teléfono aparecerá aquí cuando se configure.",
    servicesTitle: "Servicios para cada tipo de viaje.",
    contactTitle: "Contactar a STREEX",
    contactSubtitle: "Elija la forma que le resulte más cómoda.",
    call: "Llamar",
    text: "Mensaje",
    whatsapp: "WhatsApp",
    email: "Email",
    reviewTitle: "Comparta su experiencia",
    reviewSubtitle: "Sus comentarios nos ayudan a mejorar cada viaje.",
    tipTitle: "Gracias por viajar con STREEX",
    tipSubtitle: "Formas opcionales de mostrar su agradecimiento.",
  },
} as const;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

export function PassengerConsole({ config }: PassengerConsoleProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<View>("home");
  const [bookingOpen, setBookingOpen] = useState(false);
  const t = copy[language];
  const online = useOnlineStatus();

  const consoleConfig = config.passengerConsole;

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/passenger-sw.js", { scope: "/passenger" }).catch(() => {
      // Offline recovery is progressive enhancement; the console stays usable without it.
    });
  }, []);

  return (
    <div className="min-h-dvh bg-[#0B0B0B] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-[740px] flex-col px-5 pb-4 pt-5 sm:px-7">
        <ConsoleHeader
          config={config}
          language={language}
          online={online}
          setLanguage={setLanguage}
          status={online ? t.online : t.offline}
        />
        <main className="flex min-h-0 flex-1 flex-col py-5">
          {view === "home" && (
            <HomeView
              config={config}
              language={language}
              onNavigate={setView}
              temperature={consoleConfig.weather.fallbackTemperature}
              weatherCity={consoleConfig.weather.city}
              t={t}
            />
          )}
          {view === "music" && <MusicView config={config} onNavigate={setView} t={t} />}
          {view === "games" && <GamesView t={t} />}
          {view === "streex" && (
            <StreexView
              onBookRide={() => setBookingOpen(true)}
              onNavigate={setView}
              phoneContinuation={consoleConfig.links.phoneContinuation}
              t={t}
            />
          )}
          {view === "meet-juan" && (
            <MeetJuanView config={config} onNavigate={setView} t={t} />
          )}
          {view === "services" && <ServicesView config={config} onNavigate={setView} t={t} />}
          {view === "contact" && <ContactView config={config} onNavigate={setView} t={t} />}
          {view === "reviews" && <ReviewsView language={language} onNavigate={setView} t={t} />}
          {view === "tip" && <TipView config={config} onNavigate={setView} t={t} />}
        </main>
        <ConsoleNavigation activeView={view} onNavigate={setView} t={t} />
      </div>
      <BookingFormModal language={language} open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
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
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={config.logoSrc}
          alt={config.brandName}
          className="h-10 w-auto max-w-[132px] shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Passenger Console
          </p>
          <p className="text-sm font-semibold leading-none text-white/80">{config.brandName}</p>
        </div>
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
  temperature,
  weatherCity,
  t,
}: {
  config: AppConfig;
  language: Language;
  onNavigate: (view: View) => void;
  temperature: string;
  weatherCity: string;
  t: (typeof copy)[Language];
}) {
  const now = useClock();
  const time = now
    ? now.toLocaleTimeString(language === "es" ? "es-MX" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "--:--";
  const date = now
    ? now.toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex flex-1 flex-col gap-5">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#E6CE20]/15 p-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E6CE20]/15 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E6CE20]">
            STREEX Rides
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{t.welcome}</h1>
          <p className="mt-2 text-base text-white/60">{t.subtitle}</p>
          <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="text-5xl font-black tracking-tight tabular-nums sm:text-6xl">{time}</p>
              <p className="mt-1 text-sm capitalize text-white/55">{date}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right backdrop-blur">
              <p className="flex items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                <Cloud className="h-3.5 w-3.5" /> {t.weather}
              </p>
              <p className="mt-1 text-2xl font-bold">{temperature}</p>
              <p className="text-xs text-white/55">{weatherCity}</p>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => onNavigate("music")}
        className="flex min-h-[96px] items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
      >
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#E6CE20] to-amber-600 text-black">
          <Play className="h-7 w-7 fill-current" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
            {t.nowPlaying}
          </span>
          <span className="mt-1 block truncate text-lg font-bold">{MUSIC_LIBRARY[0].title}</span>
          <span className="block truncate text-sm text-white/55">
            {MUSIC_LIBRARY[0].artist} · {MUSIC_LIBRARY[0].album}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#E6CE20]/35 bg-[#E6CE20]/10 px-3 py-2 text-right text-[#E6CE20]">
          <span className="hidden max-w-32 text-xs leading-tight sm:block">
            <span className="block font-semibold">{t.chooseMusic}</span>
            <span className="mt-0.5 block text-[10px] text-white/55">{t.musicHint}</span>
          </span>
          <span className="text-sm font-semibold sm:hidden">{t.open}</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          {t.quickAccess}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <QuickAccessCard
            icon={<Music2 />}
            label={t.music}
            description={t.musicDescription}
            onClick={() => onNavigate("music")}
          />
          <QuickAccessCard
            icon={<Gamepad2 />}
            label={t.games}
            description={t.gamesDescription}
            onClick={() => onNavigate("games")}
          />
          <QuickAccessCard
            accent
            icon={<Sparkles />}
            label={t.streex}
            description={t.streexDescription}
            onClick={() => onNavigate("streex")}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025]">
        <ServiceTicker config={config} />
      </section>

      <section className="mt-auto rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6CE20]">
          STREEX
        </p>
        <p className="mt-2 text-xl font-bold">{config.tagline}</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">{config.subheadline}</p>
      </section>
    </div>
  );
}

function QuickAccessCard({
  accent = false,
  description,
  icon,
  label,
  onClick,
}: {
  accent?: boolean;
  description: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[148px] flex-col rounded-[24px] border p-4 text-left transition ${
        accent
          ? "border-[#E6CE20] bg-[#E6CE20] text-black"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? "bg-black/10" : "bg-[#E6CE20]/15 text-[#E6CE20]"}`}
      >
        {icon}
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
    return <PersonalSpotifyMusicView onNavigate={onNavigate} t={t} />;
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

function PersonalSpotifyMusicView({
  onNavigate,
  t,
}: {
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  const [status, setStatus] = useState<SpotifyPlaybackState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      const next = await getPersonalSpotifyPlayback({ data: {} });
      setStatus(next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const control = async (command: "play" | "pause" | "next") => {
    setBusy(true);
    setError(null);
    try {
      await controlPersonalSpotifyPlayback({ data: { command } });
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.spotifyControlError);
    } finally {
      setBusy(false);
    }
  };

  const message =
    status?.state === "disabled"
      ? t.spotifyDisabled
      : status?.state === "driver-setup-required"
        ? t.spotifyDriverSetup
        : status?.state === "not-connected"
          ? t.spotifyNotConnected
          : null;
  const playback = status?.state === "ready" ? status.playback : null;

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader eyebrow={t.spotifyPersonal} title={t.musicTitle} description={t.musicSubtitle} />
      {message ? (
        <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
          <p className="text-lg font-bold">{t.spotifyPersonal}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{message}</p>
        </section>
      ) : playback ? (
        <section className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
          {playback.track?.artworkUrl ? (
            <img
              src={playback.track.artworkUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-[#E6CE20] via-amber-500 to-orange-700" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
              {t.nowPlaying}
            </p>
            <p className="mt-1 truncate text-lg font-bold">{playback.track?.title ?? t.spotifyPersonal}</p>
            <p className="truncate text-sm text-white/55">
              {playback.track ? `${playback.track.artist}${playback.track.album ? ` · ${playback.track.album}` : ""}` : t.spotifyNoDevice}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {t.spotifyDevice}: {playback.hasActiveDevice ? t.spotifyActive : "—"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              disabled={busy || !playback.hasActiveDevice}
              onClick={() => void control(playback.isPlaying ? "pause" : "play")}
              className="grid h-12 w-12 place-items-center rounded-full bg-[#E6CE20] text-black disabled:opacity-45"
              aria-label={playback.isPlaying ? "Pause" : "Play"}
            >
              {playback.isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
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
        </section>
      ) : (
        <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5 text-sm text-white/60">
          {t.spotifyRefresh}
        </section>
      )}
      <div className="flex items-center justify-between gap-3">
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
      {error && <p className="text-sm text-red-300">{error}</p>}
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

function GamesView({ t }: { t: (typeof copy)[Language] }) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <ViewHeader eyebrow={t.comingSoon} title={t.gamesTitle} description={t.gamesSubtitle} />
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <GameCard
          title={t.utahTrivia}
          description={t.utahTriviaDescription}
          icon={<Sparkles className="h-7 w-7" />}
          status={t.comingSoon}
        />
        <GameCard
          title={t.thisOrThat}
          description={t.thisOrThatDescription}
          icon={<Gamepad2 className="h-7 w-7" />}
          status={t.comingSoon}
        />
      </div>
      <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-[#E6CE20]/10 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
          STREEX
        </p>
        <p className="mt-2 max-w-md text-xl font-bold">
          Utah roads, local moments, and a little fun along the way.
        </p>
      </div>
    </div>
  );
}

function GameCard({
  description,
  icon,
  status,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  status: string;
  title: string;
}) {
  return (
    <section className="relative min-h-[230px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-6">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#E6CE20]/10 blur-3xl" />
      <div className="relative flex h-full flex-col">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E6CE20]/15 text-[#E6CE20]">
          {icon}
        </span>
        <p className="mt-auto text-2xl font-bold">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>
        <span className="mt-5 w-fit rounded-full border border-[#E6CE20]/35 bg-[#E6CE20]/10 px-3 py-1.5 text-xs font-semibold text-[#E6CE20]">
          {status}
        </span>
      </div>
    </section>
  );
}

function StreexView({
  onBookRide,
  onNavigate,
  phoneContinuation,
  t,
}: {
  onBookRide: () => void;
  onNavigate: (view: View) => void;
  phoneContinuation: string | null;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="flex flex-col gap-5">
      <ViewHeader eyebrow="STREEX" title={t.streexTitle} description={t.streexSubtitle} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionButton accent icon={<CalendarPlus />} label={t.bookRide} onClick={onBookRide} />
        <ActionButton icon={<Menu />} label={t.services} onClick={() => onNavigate("services")} />
        <ActionButton icon={<Phone />} label={t.contact} onClick={() => onNavigate("contact")} />
        <ActionButton icon={<Star />} label={t.reviews} onClick={() => onNavigate("reviews")} />
        <ActionButton icon={<HandCoins />} label={t.tip} onClick={() => onNavigate("tip")} />
        <PhoneContinuationCard
          description={t.continuePhoneDescription}
          href={phoneContinuation}
          label={t.continuePhone}
          unavailable={t.unavailable}
        />
      </div>
      <button
        type="button"
        onClick={() => onNavigate("meet-juan")}
        className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.05] p-5 text-left hover:bg-white/[0.08]"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E6CE20] text-black">
          <UserRound className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6CE20]">
            STREEX
          </span>
          <span className="mt-1 block text-lg font-bold">{t.meetJuan}</span>
          <span className="block text-sm text-white/55">{configOwnerLine(t)}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/45" />
      </button>
    </div>
  );
}

function PassengerBackButton({ onNavigate, t }: { onNavigate: (view: View) => void; t: (typeof copy)[Language] }) {
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
    <div className="flex flex-col gap-5">
      <PassengerBackButton onNavigate={onNavigate} t={t} />
      <ViewHeader eyebrow="STREEX" title={t.services} description={t.servicesTitle} />
      <ServicesSection className="mt-0 px-0" config={config} title={t.services} />
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
  const actions = [
    { href: `tel:${config.phone}`, icon: <Phone />, label: t.call, detail: config.phoneDisplay },
    { href: `sms:${config.phone}`, icon: <MessageSquare />, label: t.text, detail: config.phoneDisplay },
    { href: config.whatsapp, icon: <MessageCircle />, label: t.whatsapp, detail: config.phoneDisplay },
    { href: `mailto:${config.email}`, icon: <Mail />, label: t.email, detail: config.email },
  ].filter((action) => Boolean(action.href));

  return (
    <div className="flex flex-col gap-5">
      <PassengerBackButton onNavigate={onNavigate} t={t} />
      <ViewHeader eyebrow="STREEX" title={t.contactTitle} description={t.contactSubtitle} />
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            target={action.href.startsWith("http") ? "_blank" : undefined}
            rel={action.href.startsWith("http") ? "noreferrer" : undefined}
            className="flex min-h-[104px] items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E6CE20]/15 text-[#E6CE20]">
              {action.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-bold">{action.label}</span>
              <span className="mt-1 block truncate text-sm text-white/55">{action.detail}</span>
            </span>
            <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-white/45" />
          </a>
        ))}
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
    <div className="flex flex-col gap-5">
      <PassengerBackButton onNavigate={onNavigate} t={t} />
      <ViewHeader eyebrow="STREEX" title={t.reviewTitle} description={t.reviewSubtitle} />
      <FeedbackForm compact language={language} />
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
  return (
    <div className="flex flex-col gap-5">
      <PassengerBackButton onNavigate={onNavigate} t={t} />
      <ViewHeader eyebrow="STREEX" title={t.tipTitle} description={t.tipSubtitle} />
      <PaymentOptions className="mt-0 px-0" config={config} compact />
    </div>
  );
}

function PhoneContinuationCard({
  description,
  href,
  label,
  unavailable,
}: {
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
      className="flex min-h-[142px] items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07] sm:col-span-2"
    >
      <span className="shrink-0 rounded-xl bg-white p-2">
        <QRCodeSVG value={href} size={88} bgColor="#FFFFFF" fgColor="#0B0B0B" level="M" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-bold">
          <QrCode className="h-4 w-4 text-[#E6CE20]" />
          {label}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-white/55">{description}</span>
        <span className="mt-3 block truncate text-xs text-[#E6CE20]">rides.getstreex.com</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-white/45" />
    </a>
  );
}

function configOwnerLine(t: (typeof copy)[Language]) {
  return t.meetJuan === "Meet Juan"
    ? "The person behind your ride."
    : "La persona detrás de su viaje.";
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
      className={`flex min-h-[88px] items-center gap-4 rounded-[22px] border p-4 text-left transition ${accent ? "border-[#E6CE20] bg-[#E6CE20] text-black hover:brightness-105" : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"}`}
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
  onNavigate,
  t,
}: {
  config: AppConfig;
  onNavigate: (view: View) => void;
  t: (typeof copy)[Language];
}) {
  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => onNavigate("streex")}
        className="flex w-fit items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] p-6">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E6CE20]/15 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <img
            src={config.meetPhoto}
            alt={config.ownerName}
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
          {config.meetBody.slice(0, 4).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Chip icon={<Languages className="h-4 w-4" />} label={t.bilingual} />
          <Chip icon={<Sparkles className="h-4 w-4" />} label={t.hospitality} />
        </div>
      </section>
      <section className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
        <p className="text-sm leading-relaxed text-white/65">{t.gratitude}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ActionButton icon={<Star />} label={t.leaveReview} onClick={() => onNavigate("reviews")} />
          <ActionButton accent icon={<HandCoins />} label={t.leaveTip} onClick={() => onNavigate("tip")} />
        </div>
      </section>
    </div>
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
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
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
    activeView === "tip"
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
      className="sticky bottom-2 mt-4 flex gap-1 rounded-[28px] border border-white/10 bg-[#161614]/95 p-2 backdrop-blur"
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
