import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleDot,
  Compass,
  RotateCcw,
  Route,
  Sparkles,
} from "lucide-react";
import type { TriviaLanguage } from "./utah-trivia";
import {
  calculateRideVibe,
  calculateRideVibeScores,
  createChoiceRound,
  THIS_OR_THAT_QUESTIONS,
  type RideVibe,
  type ThisOrThatQuestion,
} from "./this-or-that";

const ROUND_SIZE = 10;
const RECENT_QUESTION_IDS_KEY = "streex-passenger-this-or-that-recent";

const choiceCopy = {
  en: {
    eyebrow: "THIS OR THAT",
    title: "A little more you, in ten choices.",
    description:
      "Pick what feels right in the moment. There are no wrong answers — just a playful read on your ride vibe.",
    start: "Start choosing",
    round: "10 quick picks",
    offline: "Works offline",
    noWrong: "No wrong answers",
    privateRound: "Nothing is saved",
    choice: "Choice",
    pickASide: "Pick a side",
    picked: "Your pick",
    or: "OR",
    finishedEyebrow: "YOUR RIDE VIBE",
    finishedTitle: "This round says you're…",
    basedOnRound: "A playful read based only on this round. Nothing is saved.",
    mix: "Your choice mix",
    again: "Try another round",
    exit: "Back to Games",
    explorerName: "The Explorer",
    explorerDescription:
      "Curious, spontaneous and always ready to see what is beyond the next turn.",
    explorerFocus: "Curiosity",
    comfortName: "The Comfort Seeker",
    comfortDescription:
      "Thoughtful, relaxed and happiest when every detail of the ride feels just right.",
    comfortFocus: "Comfort",
    roadTripName: "The Road Trip Soul",
    roadTripDescription:
      "Music up, good company nearby and ready to make the journey part of the story.",
    roadTripFocus: "Road energy",
  },
  es: {
    eyebrow: "THIS OR THAT",
    title: "Un poco más de ti, en diez elecciones.",
    description:
      "Elige lo que se sienta mejor en este momento. No hay respuestas incorrectas: solo una lectura divertida de tu estilo de viaje.",
    start: "Comenzar a elegir",
    round: "10 elecciones rápidas",
    offline: "Funciona sin conexión",
    noWrong: "Sin respuestas incorrectas",
    privateRound: "No se guarda nada",
    choice: "Elección",
    pickASide: "Elige un lado",
    picked: "Tu elección",
    or: "O",
    finishedEyebrow: "TU ESTILO DE VIAJE",
    finishedTitle: "Esta ronda dice que eres…",
    basedOnRound: "Una lectura divertida basada solo en esta ronda. No se guarda nada.",
    mix: "Tu mezcla de elecciones",
    again: "Probar otra ronda",
    exit: "Volver a Juegos",
    explorerName: "El Explorador",
    explorerDescription:
      "Curioso, espontáneo y siempre listo para descubrir qué hay después de la próxima curva.",
    explorerFocus: "Curiosidad",
    comfortName: "El Amante del Confort",
    comfortDescription:
      "Tranquilo, detallista y feliz cuando cada parte del viaje se siente perfecta.",
    comfortFocus: "Confort",
    roadTripName: "Alma de Road Trip",
    roadTripDescription:
      "Buena música, buena compañía y listo para convertir el camino en parte de la historia.",
    roadTripFocus: "Energía de ruta",
  },
} as const;

type ChoicePhase = "intro" | "playing" | "finished";

function readRecentQuestionIds() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(window.localStorage.getItem(RECENT_QUESTION_IDS_KEY) ?? "[]");
    return Array.isArray(saved)
      ? saved.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function saveRecentQuestionIds(questionIds: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(RECENT_QUESTION_IDS_KEY, JSON.stringify(questionIds));
  } catch {
    // The game remains fully playable if the kiosk browser blocks storage.
  }
}

function VibeIcon({ vibe }: { vibe: RideVibe }) {
  if (vibe === "explorer") return <Compass className="h-7 w-7" />;
  if (vibe === "comfort") return <Sparkles className="h-7 w-7" />;
  return <Route className="h-7 w-7" />;
}

export function ThisOrThat({ language, onExit }: { language: TriviaLanguage; onExit: () => void }) {
  const t = choiceCopy[language];
  const [phase, setPhase] = useState<ChoicePhase>("intro");
  const [round, setRound] = useState<ThisOrThatQuestion[]>([]);
  const [choiceIndex, setChoiceIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selections, setSelections] = useState<RideVibe[]>([]);

  const startRound = () => {
    const knownQuestionIds = new Set(THIS_OR_THAT_QUESTIONS.map((question) => question.id));
    let recentQuestionIds = readRecentQuestionIds().filter((id) => knownQuestionIds.has(id));
    let availableQuestions = THIS_OR_THAT_QUESTIONS.filter(
      (question) => !recentQuestionIds.includes(question.id),
    );

    // A passenger sees the full question deck before a new cycle begins.
    if (availableQuestions.length < ROUND_SIZE) {
      recentQuestionIds = [];
      availableQuestions = THIS_OR_THAT_QUESTIONS;
    }

    const nextRound = createChoiceRound(availableQuestions, ROUND_SIZE);
    saveRecentQuestionIds([...recentQuestionIds, ...nextRound.map((question) => question.id)]);
    setRound(nextRound);
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
    }, 760);

    return () => window.clearTimeout(timer);
  }, [choiceIndex, phase, round.length, selectedIndex]);

  if (phase === "intro") {
    return (
      <div className="passenger-choice-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-choice-hero relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/25 p-7">
          <span className="passenger-choice-hero-glow passenger-choice-hero-glow--top" />
          <span className="passenger-choice-hero-glow passenger-choice-hero-glow--bottom" />
          <div className="passenger-choice-hero-content relative z-10 flex w-full flex-col justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#E6CE20]/40 bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.18)]">
              <CircleDot className="h-8 w-8" />
            </span>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-black leading-[1.04] tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">{t.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[t.round, t.offline, t.noWrong, t.privateRound].map((label) => (
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
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="passenger-choice-hero-art" aria-hidden="true">
            <span className="passenger-choice-hero-orbit passenger-choice-hero-orbit--outer" />
            <span className="passenger-choice-hero-orbit passenger-choice-hero-orbit--inner" />
            <span className="passenger-choice-hero-core">10</span>
            <span className="passenger-choice-hero-this">THIS</span>
            <span className="passenger-choice-hero-that">THAT</span>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "finished") {
    const vibe = calculateRideVibe(selections);
    const scores = calculateRideVibeScores(selections);
    const result = {
      explorer: {
        name: t.explorerName,
        description: t.explorerDescription,
        focus: t.explorerFocus,
      },
      comfort: {
        name: t.comfortName,
        description: t.comfortDescription,
        focus: t.comfortFocus,
      },
      roadTrip: {
        name: t.roadTripName,
        description: t.roadTripDescription,
        focus: t.roadTripFocus,
      },
    }[vibe];
    const scoreRows = [
      { vibe: "explorer" as const, label: t.explorerFocus },
      { vibe: "comfort" as const, label: t.comfortFocus },
      { vibe: "roadTrip" as const, label: t.roadTripFocus },
    ];

    return (
      <div className="passenger-choice-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section
          className={`passenger-choice-results passenger-choice-results--${vibe} relative flex flex-1 overflow-hidden rounded-[30px] border p-7`}
        >
          <span className="passenger-choice-result-sun" />
          <div className="passenger-choice-results-content relative z-10 grid w-full items-center gap-8">
            <div className="passenger-choice-result-stage">
              <span className="passenger-choice-result-icon">
                <VibeIcon vibe={vibe} />
              </span>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
                {t.finishedEyebrow}
              </p>
              <span className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-white/55">
                {result.focus}
              </span>
            </div>
            <div className="max-w-xl">
              <p className="text-lg font-semibold text-white/55">{t.finishedTitle}</p>
              <h1 className="mt-2 text-5xl font-black leading-[0.98] tracking-tight">
                {result.name}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/72">
                {result.description}
              </p>
              <div className="passenger-choice-scorecard mt-7 rounded-[22px] border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/48">
                  {t.mix}
                </p>
                <div className="mt-4 grid gap-3">
                  {scoreRows.map((row) => {
                    const score = scores[row.vibe];
                    return (
                      <div key={row.vibe} className="passenger-choice-score-row">
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold text-white/70">
                          <span className="inline-flex items-center gap-2">
                            <VibeIcon vibe={row.vibe} />
                            {row.label}
                          </span>
                          <span>{score}/10</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full passenger-choice-score-fill passenger-choice-score-fill--${row.vibe}`}
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-4 text-xs text-white/38">{t.basedOnRound}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={startRound} className="passenger-trivia-primary">
                  <RotateCcw className="h-5 w-5" />
                  {t.again}
                </button>
                <button type="button" onClick={onExit} className="passenger-trivia-secondary">
                  {t.exit}
                </button>
              </div>
            </div>
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
      <div className="passenger-choice-stage-header flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <span className="passenger-choice-count">
          <CircleDot className="h-3.5 w-3.5" />
          {t.choice} {choiceIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="passenger-choice-progress h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <section className="passenger-choice-board relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/10 p-6">
        <span className="passenger-choice-board-line passenger-choice-board-line--one" />
        <span className="passenger-choice-board-line passenger-choice-board-line--two" />
        <div className="relative z-10">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-[#E6CE20]">
            {question.category[language]}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-center text-[clamp(2rem,4vw,3rem)] font-black leading-[1.04] tracking-tight">
            {question.prompt[language]}
          </h1>
          <p className="mt-3 text-center text-sm font-medium text-white/48">{t.pickASide}</p>
        </div>
        <div className="passenger-choice-options relative z-10 mt-6 grid min-h-0 flex-1 grid-cols-2 gap-5">
          <span className="passenger-choice-or" aria-hidden="true">
            {t.or}
          </span>
          {question.options.map((option, index) => {
            const selected = selectedIndex === index;
            const dimmed = selectedIndex !== null && !selected;
            return (
              <button
                key={option.label.en}
                type="button"
                onClick={() => choose(index)}
                disabled={selectedIndex !== null}
                className={`passenger-choice-option passenger-choice-option--${option.vibe} ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
              >
                <span className="passenger-choice-option-watermark" aria-hidden="true">
                  <VibeIcon vibe={option.vibe} />
                </span>
                <span className="passenger-choice-option-kicker">
                  <span className="passenger-choice-option-icon">
                    <VibeIcon vibe={option.vibe} />
                  </span>
                  <span>{index === 0 ? "THIS" : "THAT"}</span>
                </span>
                <span className="passenger-choice-option-label">{option.label[language]}</span>
                <span className="passenger-choice-option-footer">
                  {selected ? t.picked : <ArrowRight className="h-5 w-5" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
