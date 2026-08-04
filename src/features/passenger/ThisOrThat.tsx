import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Compass, RotateCcw, Route, Sparkles } from "lucide-react";
import type { TriviaLanguage } from "./utah-trivia";
import {
  calculateRideVibe,
  createChoiceRound,
  type RideVibe,
  type ThisOrThatQuestion,
} from "./this-or-that";

const ROUND_SIZE = 10;

const choiceCopy = {
  en: {
    eyebrow: "THIS OR THAT",
    title: "Two choices. One ride vibe.",
    description:
      "Pick what feels most like you. There are no wrong answers — just ten quick choices for the road.",
    start: "Start choosing",
    round: "10 choices",
    offline: "Works offline",
    noWrong: "No wrong answers",
    choice: "Choice",
    picked: "Your pick",
    finishedEyebrow: "YOUR RIDE VIBE",
    finishedTitle: "This round says you're…",
    basedOnRound: "Based only on your choices in this round.",
    again: "Try another round",
    exit: "Back to Games",
    explorerName: "The Explorer",
    explorerDescription:
      "Curious, spontaneous and always ready to see what is beyond the next turn.",
    comfortName: "The Comfort Seeker",
    comfortDescription:
      "Thoughtful, relaxed and happiest when every detail of the ride feels just right.",
    roadTripName: "The Road Trip Soul",
    roadTripDescription:
      "Music up, good company nearby and ready to make the journey part of the story.",
  },
  es: {
    eyebrow: "ESTO O AQUELLO",
    title: "Dos opciones. Un estilo de viaje.",
    description:
      "Elige lo que más se parezca a ti. No hay respuestas incorrectas: solo diez decisiones rápidas para el camino.",
    start: "Comenzar a elegir",
    round: "10 elecciones",
    offline: "Funciona sin conexión",
    noWrong: "Sin respuestas incorrectas",
    choice: "Elección",
    picked: "Tu elección",
    finishedEyebrow: "TU ESTILO DE VIAJE",
    finishedTitle: "Esta ronda dice que eres…",
    basedOnRound: "Basado únicamente en tus elecciones de esta ronda.",
    again: "Probar otra ronda",
    exit: "Volver a Juegos",
    explorerName: "El Explorador",
    explorerDescription:
      "Curioso, espontáneo y siempre listo para descubrir qué hay después de la próxima curva.",
    comfortName: "El Amante del Confort",
    comfortDescription:
      "Tranquilo, detallista y feliz cuando cada parte del viaje se siente perfecta.",
    roadTripName: "Alma de Road Trip",
    roadTripDescription:
      "Buena música, buena compañía y listo para convertir el camino en parte de la historia.",
  },
} as const;

type ChoicePhase = "intro" | "playing" | "finished";

export function ThisOrThat({ language, onExit }: { language: TriviaLanguage; onExit: () => void }) {
  const t = choiceCopy[language];
  const [phase, setPhase] = useState<ChoicePhase>("intro");
  const [round, setRound] = useState<ThisOrThatQuestion[]>([]);
  const [choiceIndex, setChoiceIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selections, setSelections] = useState<RideVibe[]>([]);

  const startRound = () => {
    setRound(createChoiceRound(undefined, ROUND_SIZE));
    setChoiceIndex(0);
    setSelectedIndex(null);
    setSelections([]);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing" || selectedIndex === null) return;

    const timer = window.setTimeout(() => {
      if (choiceIndex === round.length - 1) {
        setPhase("finished");
      } else {
        setChoiceIndex((current) => current + 1);
        setSelectedIndex(null);
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [choiceIndex, phase, round.length, selectedIndex]);

  if (phase === "intro") {
    return (
      <div className="passenger-choice-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-choice-hero relative flex flex-1 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-[#E6CE20]/10 to-black p-7">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#E6CE20]/20 blur-3xl" />
          <div className="relative z-10 flex max-w-xl flex-col justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#E6CE20]/30 bg-[#E6CE20]/15 text-[#E6CE20]">
              <Route className="h-8 w-8" />
            </span>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.04] tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">{t.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[t.round, t.offline, t.noWrong].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-white/70"
                >
                  {label}
                </span>
              ))}
            </div>
            <button type="button" onClick={startRound} className="passenger-trivia-primary mt-8">
              {t.start}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="passenger-choice-versus" aria-hidden="true">
            <span>THIS</span>
            <span>THAT</span>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "finished") {
    const vibe = calculateRideVibe(selections);
    const result = {
      explorer: {
        name: t.explorerName,
        description: t.explorerDescription,
        icon: <Compass className="h-9 w-9" />,
      },
      comfort: {
        name: t.comfortName,
        description: t.comfortDescription,
        icon: <Sparkles className="h-9 w-9" />,
      },
      roadTrip: {
        name: t.roadTripName,
        description: t.roadTripDescription,
        icon: <Route className="h-9 w-9" />,
      },
    }[vibe];

    return (
      <div className="passenger-choice-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-choice-results flex flex-1 flex-col items-center justify-center rounded-[30px] border border-[#E6CE20]/25 bg-gradient-to-br from-white/[0.05] to-[#E6CE20]/12 p-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-[24px] bg-[#E6CE20] text-black">
            {result.icon}
          </span>
          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
            {t.finishedEyebrow}
          </p>
          <p className="mt-3 text-lg font-semibold text-white/55">{t.finishedTitle}</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">{result.name}</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
            {result.description}
          </p>
          <p className="mt-3 text-xs text-white/35">{t.basedOnRound}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={startRound} className="passenger-trivia-primary">
              <RotateCcw className="h-5 w-5" />
              {t.again}
            </button>
            <button type="button" onClick={onExit} className="passenger-trivia-secondary">
              {t.exit}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const question = round[choiceIndex];
  if (!question) return null;
  const progress = ((choiceIndex + (selectedIndex === null ? 0 : 1)) / ROUND_SIZE) * 100;

  const choose = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    setSelections((current) => [...current, question.options[index].vibe]);
  };

  return (
    <div className="passenger-choice-layout flex min-h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          {t.choice} {choiceIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <section className="passenger-choice-board flex min-h-0 flex-1 flex-col rounded-[30px] border border-white/10 bg-white/[0.035] p-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
          {question.category[language]}
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black leading-tight tracking-tight">
          {question.prompt[language]}
        </h1>
        <div className="passenger-choice-options mt-6 grid min-h-0 flex-1 grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const selected = selectedIndex === index;
            const dimmed = selectedIndex !== null && !selected;
            return (
              <button
                key={option.label.en}
                type="button"
                onClick={() => choose(index)}
                disabled={selectedIndex !== null}
                className={`passenger-choice-option ${index === 1 ? "is-accent" : ""} ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-55">
                  {index === 0 ? "THIS" : "THAT"}
                </span>
                <span className="mt-auto text-3xl font-black leading-tight tracking-tight">
                  {option.label[language]}
                </span>
                <span
                  className={`mt-5 text-xs font-bold uppercase tracking-[0.16em] ${selected ? "opacity-100" : "opacity-0"}`}
                  role={selected ? "status" : undefined}
                >
                  {t.picked}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
