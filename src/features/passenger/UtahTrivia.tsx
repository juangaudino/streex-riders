import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Flag,
  MapPinned,
  Mountain,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import {
  createTriviaRound,
  UTAH_TRIVIA_QUESTIONS,
  type TriviaLanguage,
  type UtahTriviaQuestion,
} from "./utah-trivia";

const ROUND_SIZE = 10;
const RECENT_QUESTION_IDS_KEY = "streex-passenger-utah-trivia-recent";

const triviaCopy = {
  en: {
    eyebrow: "UTAH TRIVIA",
    title: "How well do you know the Beehive State?",
    description: "Ten quick questions about Utah's places, history, symbols and local character.",
    start: "Start the game",
    round: "10 questions",
    offline: "Works offline",
    noTimer: "No timer",
    question: "Question",
    next: "Next question",
    results: "See results",
    correct: "Correct",
    incorrect: "Not quite",
    answerWas: "The answer is",
    finishedEyebrow: "ROUND COMPLETE",
    finishedTitle: "Nice ride through Utah!",
    score: "Your score",
    perfect: "Perfect score. You know Utah exceptionally well.",
    strong: "Excellent work — you know your way around the Beehive State.",
    good: "Solid score. Utah is starting to feel familiar.",
    learning: "A good start — every road reveals something new.",
    again: "Play another round",
    exit: "Back to Games",
  },
  es: {
    eyebrow: "UTAH TRIVIA",
    title: "¿Cuánto sabes del Beehive State?",
    description:
      "Diez preguntas rápidas sobre los lugares, la historia, los símbolos y la cultura local de Utah.",
    start: "Comenzar el juego",
    round: "10 preguntas",
    offline: "Funciona sin conexión",
    noTimer: "Sin límite de tiempo",
    question: "Pregunta",
    next: "Siguiente pregunta",
    results: "Ver resultados",
    correct: "Correcto",
    incorrect: "Casi",
    answerWas: "La respuesta es",
    finishedEyebrow: "RONDA COMPLETADA",
    finishedTitle: "¡Buen recorrido por Utah!",
    score: "Tu puntaje",
    perfect: "Puntaje perfecto. Conoces Utah excepcionalmente bien.",
    strong: "Excelente — conoces muy bien el Beehive State.",
    good: "Buen puntaje. Utah ya comienza a sentirse familiar.",
    learning: "Un buen comienzo: cada camino revela algo nuevo.",
    again: "Jugar otra ronda",
    exit: "Volver a Juegos",
  },
} as const;

type TriviaPhase = "intro" | "playing" | "finished";

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
    // Trivia remains playable if storage is unavailable in the kiosk browser.
  }
}

export function UtahTrivia({ language, onExit }: { language: TriviaLanguage; onExit: () => void }) {
  const t = triviaCopy[language];
  const [phase, setPhase] = useState<TriviaPhase>("intro");
  const [round, setRound] = useState<UtahTriviaQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startRound = () => {
    const knownQuestionIds = new Set(UTAH_TRIVIA_QUESTIONS.map((question) => question.id));
    let recentQuestionIds = readRecentQuestionIds().filter((id) => knownQuestionIds.has(id));
    let availableQuestions = UTAH_TRIVIA_QUESTIONS.filter(
      (question) => !recentQuestionIds.includes(question.id),
    );

    // A passenger gets every question once before a new cycle begins.
    if (availableQuestions.length < ROUND_SIZE) {
      recentQuestionIds = [];
      availableQuestions = UTAH_TRIVIA_QUESTIONS;
    }

    const nextRound = createTriviaRound(availableQuestions, ROUND_SIZE);
    saveRecentQuestionIds([...recentQuestionIds, ...nextRound.map((question) => question.id)]);
    setRound(nextRound);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setPhase("playing");
  };

  if (phase === "intro") {
    return (
      <div className="passenger-trivia-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-trivia-hero passenger-trivia-hero--road relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/30 p-7">
          <div className="passenger-trivia-road-glow" />
          <div className="relative z-10 flex max-w-xl flex-col justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#E6CE20]/45 bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.2)]">
              <MapPinned className="h-8 w-8" />
            </span>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.04] tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">{t.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[t.round, t.offline, t.noTimer].map((label) => (
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
          <div className="passenger-trivia-route-map" aria-hidden="true">
            <Mountain className="h-32 w-32" />
            <span className="passenger-trivia-route-line" />
            <span className="passenger-trivia-route-dot passenger-trivia-route-dot--start" />
            <span className="passenger-trivia-route-dot passenger-trivia-route-dot--finish" />
            <Flag className="passenger-trivia-route-flag h-6 w-6" />
            <span className="passenger-trivia-route-label">10 MILES</span>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "finished") {
    const message =
      score === ROUND_SIZE ? t.perfect : score >= 8 ? t.strong : score >= 5 ? t.good : t.learning;

    return (
      <div className="passenger-trivia-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-trivia-results flex flex-1 flex-col items-center justify-center rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-[#E6CE20]/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.2)]">
            <Trophy className="h-8 w-8" />
          </span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
            {t.finishedEyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{t.finishedTitle}</h1>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            {t.score}
          </p>
          <p className="mt-1 text-7xl font-black tracking-tight text-[#E6CE20]">
            {score}
            <span className="text-3xl text-white/35">/{ROUND_SIZE}</span>
          </p>
          <div className="mt-6 flex gap-2" aria-label={`${score} of ${ROUND_SIZE}`}>
            {Array.from({ length: ROUND_SIZE }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${index < score ? "bg-[#E6CE20]" : "bg-white/15"}`}
              />
            ))}
          </div>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">{message}</p>
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

  const question = round[questionIndex];
  if (!question) return null;
  const answered = selectedIndex !== null;
  const selectedCorrect = selectedIndex === question.correctIndex;
  const progress = ((questionIndex + (answered ? 1 : 0)) / ROUND_SIZE) * 100;

  const chooseAnswer = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    if (index === question.correctIndex) setScore((current) => current + 1);
  };

  const advance = () => {
    if (questionIndex === round.length - 1) {
      setPhase("finished");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedIndex(null);
  };

  return (
    <div className="passenger-trivia-layout flex min-h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <span className="passenger-trivia-mile text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          <MapPinned className="h-3.5 w-3.5 text-[#E6CE20]" />
          {t.question} {questionIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="passenger-trivia-progress h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <section className="passenger-trivia-question passenger-trivia-question--route flex min-h-0 flex-1 flex-col rounded-[30px] border border-white/10 p-6">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
          <span className="h-2 w-2 rounded-full bg-[#E6CE20] shadow-[0_0_12px_rgba(230,206,32,0.9)]" />
          {question.category[language]}
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight">
          {question.prompt[language]}
        </h1>
        <div className="passenger-trivia-options mt-6 grid grid-cols-2 gap-3">
          {question.options.map((option, index) => {
            const isCorrect = answered && index === question.correctIndex;
            const isWrong = answered && index === selectedIndex && !isCorrect;
            return (
              <button
                key={option.en}
                type="button"
                onClick={() => chooseAnswer(index)}
                disabled={answered}
                className={`passenger-trivia-option ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current/20 bg-black/15 text-xs font-black">
                  {isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : isWrong ? (
                    <X className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span>{option[language]}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div
            className={`passenger-trivia-feedback mt-5 ${selectedCorrect ? "is-correct" : "is-wrong"}`}
            role="status"
          >
            <div className="min-w-0">
              <p className="font-bold">{selectedCorrect ? t.correct : t.incorrect}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {!selectedCorrect && (
                  <>
                    {t.answerWas}{" "}
                    <strong className="text-white">
                      {question.options[question.correctIndex][language]}.
                    </strong>{" "}
                  </>
                )}
                {question.explanation[language]}
              </p>
            </div>
            <button type="button" onClick={advance} className="passenger-trivia-primary shrink-0">
              {questionIndex === round.length - 1 ? t.results : t.next}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
