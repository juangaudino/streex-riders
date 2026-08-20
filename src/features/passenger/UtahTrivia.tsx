import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Flag, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import {
  createTriviaRound,
  UTAH_TRIVIA_QUESTIONS,
  type TriviaLanguage,
  type UtahTriviaQuestion,
} from "./utah-trivia";
import utahTriviaHero from "@/assets/passenger-games/utah-trivia-hero.jpg";
import utahTriviaNationalParks from "@/assets/passenger-games/utah-trivia-national-parks.jpg";
import utahTriviaSymbols from "@/assets/passenger-games/utah-trivia-symbols.jpg";
import utahTriviaAtlas from "@/assets/passenger-games/utah-trivia-atlas.jpg";
import { HoneycombMark } from "./game-marks";
import { useTimedRound } from "./useTimedRound";

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
    timer: "10 seconds each",
    timeLeft: "Time left",
    timeUp: "Time's up",
    question: "Question",
    next: "Next question",
    continuing: "Next question starts automatically",
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
    timer: "10 segundos cada una",
    timeLeft: "Tiempo restante",
    timeUp: "Se acabó el tiempo",
    question: "Pregunta",
    next: "Siguiente pregunta",
    continuing: "La siguiente pregunta empieza automáticamente",
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

type TriviaPostcard = {
  image: string;
  objectPosition: string;
  tone: "parks" | "symbols" | "atlas";
};

function getTriviaPostcard(category: string): TriviaPostcard {
  if (category === "National parks" || category === "Landmarks") {
    return {
      image: utahTriviaNationalParks,
      objectPosition: "50% 48%",
      tone: "parks",
    };
  }

  if (
    category === "State symbols" ||
    category === "Utah culture" ||
    category === "Local knowledge"
  ) {
    return {
      image: utahTriviaSymbols,
      objectPosition: "50% 40%",
      tone: "symbols",
    };
  }

  return {
    image: utahTriviaAtlas,
    objectPosition: "50% 54%",
    tone: "atlas",
  };
}

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
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);

  const question = round[questionIndex];
  const answered = selectedIndex !== null || timedOut;

  const timer = useTimedRound({
    active: phase === "playing" && Boolean(question) && !answered,
    roundKey: question?.id ?? null,
    onExpire: () => setTimedOut(true),
  });

  const advanceRound = useCallback(() => {
    if (questionIndex >= round.length - 1) {
      setPhase("finished");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedIndex(null);
    setTimedOut(false);
  }, [questionIndex, round.length]);

  useEffect(() => {
    if (!answered) return;
    const timeoutId = window.setTimeout(advanceRound, 5_000);
    return () => window.clearTimeout(timeoutId);
  }, [advanceRound, answered, question?.id]);

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
    setTimedOut(false);
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
          <img
            src={utahTriviaHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
          />
          <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.97)_0%,rgba(5,7,9,0.84)_42%,rgba(5,7,9,0.26)_100%)]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
          <div className="relative z-10 flex max-w-xl flex-col justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#E6CE20]/45 bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.2)]">
              <HoneycombMark />
            </span>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.04] tracking-tight">
              {t.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">{t.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[t.round, t.timer, t.offline].map((label) => (
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
          <div className="passenger-trivia-hero-route relative z-10" aria-hidden="true">
            <Flag className="h-4 w-4" />
            <span>UTAH ROUTE · 10</span>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "finished") {
    const message =
      score === ROUND_SIZE ? t.perfect : score >= 8 ? t.strong : score >= 5 ? t.good : t.learning;
    const scoreProgress = (score / ROUND_SIZE) * 360;

    return (
      <div className="passenger-trivia-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-trivia-results relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/25 p-6">
          <img
            src={utahTriviaHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[64%_center] opacity-65"
          />
          <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.95)_0%,rgba(5,7,9,0.9)_43%,rgba(5,7,9,0.38)_100%)]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
          <div className="passenger-trivia-results-content relative z-10 grid w-full items-center gap-8">
            <div className="passenger-trivia-score-stage">
              <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.22)]">
                <Trophy className="h-7 w-7" />
              </span>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
                {t.finishedEyebrow}
              </p>
              <div
                className="passenger-trivia-score-ring mt-4"
                aria-label={`${score} of ${ROUND_SIZE}`}
                style={{
                  background: `conic-gradient(#E6CE20 0deg ${scoreProgress}deg, rgb(255 255 255 / 0.12) ${scoreProgress}deg 360deg)`,
                }}
              >
                <span className="passenger-trivia-score-core">
                  <strong>{score}</strong>
                  <small>/{ROUND_SIZE}</small>
                </span>
              </div>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                {t.score}
              </p>
            </div>
            <div className="max-w-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                STREEX · UTAH ROUTE
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[1.04] tracking-tight">
                {t.finishedTitle}
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">{message}</p>
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

  if (!question) return null;
  const selectedCorrect = selectedIndex === question.correctIndex;
  const progress = ((questionIndex + (answered ? 1 : 0)) / ROUND_SIZE) * 100;
  const postcard = getTriviaPostcard(question.category.en);

  const chooseAnswer = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    if (index === question.correctIndex) setScore((current) => current + 1);
  };

  return (
    <div className="passenger-trivia-layout flex min-h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <span className="passenger-trivia-mile text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          <HoneycombMark className="passenger-honeycomb-mark--compact text-[#E6CE20]" />
          {t.question} {questionIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="passenger-timed-game-status-slot" aria-live="polite">
        {!answered && (
          <div className="passenger-timed-game-status">
            <span>{t.timeLeft}</span>
            <span className={timer.isWarning ? "is-warning" : ""}>
              {Math.ceil(timer.remainingMs / 1000)}
            </span>
          </div>
        )}
      </div>
      <div className="passenger-trivia-progress h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="passenger-timed-game-progress-slot" aria-hidden={answered}>
        {!answered && (
          <div className="passenger-timed-game-progress h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-[#E6CE20] transition-[width] duration-100 ${
                timer.isWarning ? "passenger-timed-game-bar--warning" : ""
              }`}
              style={{ width: `${timer.progress * 100}%` }}
            />
          </div>
        )}
      </div>
      <section className="passenger-trivia-question passenger-trivia-question--route relative flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-white/10 p-6">
        <img
          src={postcard.image}
          alt=""
          aria-hidden="true"
          className="passenger-trivia-question-art absolute pointer-events-none"
          style={{ objectPosition: postcard.objectPosition }}
        />
        <span className="passenger-trivia-question-art-fade absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
          <div
            className={`passenger-trivia-postcard passenger-trivia-postcard--${postcard.tone} relative overflow-hidden rounded-[18px] border border-[#E6CE20]/25`}
          >
            <img
              src={postcard.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: postcard.objectPosition }}
            />
            <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.95),rgba(5,7,9,0.54),rgba(5,7,9,0.08))]" />
            <span className="relative flex min-h-[118px] flex-col justify-center px-4">
              <span className="text-base font-black uppercase tracking-[0.14em] text-[#E6CE20]">
                {question.category[language]}
              </span>
            </span>
          </div>
          <div className="mt-4 h-1 w-12 rounded-full bg-[#E6CE20] shadow-[0_0_14px_rgba(230,206,32,0.75)]" />
          <h1 className="mt-3 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-black leading-[1.06] tracking-tight">
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
          <div className="passenger-trivia-feedback-slot mt-5" aria-live="polite">
            {answered ? (
              <div
                className={`passenger-trivia-feedback ${selectedCorrect ? "is-correct" : "is-wrong"}`}
                role="status"
              >
                <div className="min-w-0">
                  <p className="font-bold">
                    {timedOut ? t.timeUp : selectedCorrect ? t.correct : t.incorrect}
                  </p>
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
                <span className="shrink-0 text-xs font-semibold text-white/45">{t.continuing}</span>
              </div>
            ) : (
              <span className="block text-sm text-transparent" aria-hidden="true">
                .
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
