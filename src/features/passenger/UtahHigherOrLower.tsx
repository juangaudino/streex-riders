import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpDown, Check, ChevronRight, RotateCcw, Trophy, X } from "lucide-react";
import type { TriviaLanguage } from "./utah-trivia";
import {
  createHigherOrLowerRound,
  UTAH_HIGHER_OR_LOWER_QUESTIONS,
  type UtahHigherOrLowerQuestion,
} from "./utah-higher-or-lower";
import { TIMED_GAME_QUESTION_DURATION_MS } from "./timed-game";
import { useTimedRound } from "./useTimedRound";
import {
  preloadHigherOrLowerVisuals,
  UTAH_HIGHER_OR_LOWER_VISUALS,
} from "./utah-higher-or-lower-visuals";
import utahTriviaAtlas from "@/assets/passenger-games/utah-trivia-atlas.jpg";

const ROUND_SIZE = 10;
const RECENT_QUESTION_IDS_KEY = "streex-passenger-higher-or-lower-recent";

const copy = {
  en: {
    eyebrow: "UTAH: HIGHER OR LOWER",
    title: "Pick the Utah side that comes out on top.",
    description: "Ten quick comparisons across Utah's peaks, parks, cities and local stories.",
    start: "Start the round",
    round: "10 comparisons",
    timer: "10 seconds each",
    offline: "Works offline",
    question: "Round",
    pickASide: "Pick the Utah side that comes out on top.",
    timeLeft: "Time left",
    timeUp: "Time's up",
    correct: "Correct",
    incorrect: "Not quite",
    answerWas: "The answer is",
    next: "Next comparison",
    results: "See results",
    finishedEyebrow: "ROUND COMPLETE",
    finishedTitle: "You sized up Utah.",
    roundReview: "Your comparison trail",
    correctReads: "correct reads",
    score: "Your score",
    perfect: "Perfect. You know Utah from the peaks to the valleys.",
    strong: "Strong round. Your Utah instincts are sharp.",
    good: "Good read. There is always more Utah to discover.",
    learning: "A solid start. The next road has another story.",
    again: "Play another round",
    exit: "Back to Games",
  },
  es: {
    eyebrow: "UTAH: HIGHER OR LOWER",
    title: "Elige el lado de Utah que llega más alto.",
    description:
      "Diez comparaciones rápidas sobre cumbres, parques, ciudades e historias locales de Utah.",
    start: "Comenzar la ronda",
    round: "10 comparaciones",
    timer: "10 segundos cada una",
    offline: "Funciona sin conexión",
    question: "Ronda",
    pickASide: "Elige el lado de Utah que llega más alto.",
    timeLeft: "Tiempo restante",
    timeUp: "Se acabó el tiempo",
    correct: "Correcto",
    incorrect: "Casi",
    answerWas: "La respuesta es",
    next: "Siguiente comparación",
    results: "Ver resultados",
    finishedEyebrow: "RONDA COMPLETADA",
    finishedTitle: "Ya conoces las medidas de Utah.",
    roundReview: "Tu recorrido de comparaciones",
    correctReads: "aciertos",
    score: "Tu puntaje",
    perfect: "Perfecto. Conoces Utah desde las cumbres hasta los valles.",
    strong: "Gran ronda. Tus instintos sobre Utah están afilados.",
    good: "Buen criterio. Siempre hay más Utah por descubrir.",
    learning: "Buen comienzo. El siguiente camino tiene otra historia.",
    again: "Jugar otra ronda",
    exit: "Volver a Juegos",
  },
} as const;

type Phase = "intro" | "playing" | "finished";
type HigherLowerAnswer = {
  questionId: string;
  side: "left" | "right" | null;
  correct: boolean;
};

function readRecentIds() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_QUESTION_IDS_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_QUESTION_IDS_KEY, JSON.stringify(ids));
  } catch {
    // The game remains fully playable when kiosk storage is unavailable.
  }
}

export function UtahHigherOrLower({
  language,
  onExit,
}: {
  language: TriviaLanguage;
  onExit: () => void;
}) {
  const t = copy[language];
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<UtahHigherOrLowerQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [answerLog, setAnswerLog] = useState<HigherLowerAnswer[]>([]);

  const question = round[questionIndex];
  const answered = selectedSide !== null || timedOut;
  const advance = () => {
    if (questionIndex >= round.length - 1) {
      setPhase("finished");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedSide(null);
    setTimedOut(false);
  };

  const timer = useTimedRound({
    active: phase === "playing" && Boolean(question) && !answered,
    roundKey: question?.id ?? null,
    onExpire: () => setTimedOut(true),
  });

  useEffect(() => {
    if (!timedOut) return;
    if (question) {
      setAnswerLog((current) =>
        current.some((answer) => answer.questionId === question.id)
          ? current
          : [...current, { questionId: question.id, side: null, correct: false }],
      );
    }
    const timeoutId = window.setTimeout(() => {
      if (questionIndex >= round.length - 1) {
        setPhase("finished");
        return;
      }

      setQuestionIndex((current) => current + 1);
      setSelectedSide(null);
      setTimedOut(false);
    }, 1_200);
    return () => window.clearTimeout(timeoutId);
  }, [question, questionIndex, round.length, timedOut]);

  const startRound = () => {
    const knownIds = new Set(UTAH_HIGHER_OR_LOWER_QUESTIONS.map((item) => item.id));
    let recentIds = readRecentIds().filter((id) => knownIds.has(id));
    let available = UTAH_HIGHER_OR_LOWER_QUESTIONS.filter((item) => !recentIds.includes(item.id));
    if (available.length < ROUND_SIZE) {
      recentIds = [];
      available = UTAH_HIGHER_OR_LOWER_QUESTIONS;
    }
    const nextRound = createHigherOrLowerRound(available, ROUND_SIZE);
    preloadHigherOrLowerVisuals(nextRound.slice(0, 2).map((item) => item.id));
    saveRecentIds([...recentIds, ...nextRound.map((item) => item.id)]);
    setRound(nextRound);
    setQuestionIndex(0);
    setSelectedSide(null);
    setTimedOut(false);
    setScore(0);
    setAnswerLog([]);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    preloadHigherOrLowerVisuals(
      round.slice(questionIndex, questionIndex + 2).map((item) => item.id),
    );
  }, [phase, questionIndex, round]);

  const choose = (side: "left" | "right") => {
    if (!question || answered) return;
    setSelectedSide(side);
    const correct = side === question.correctSide;
    setAnswerLog((current) =>
      current.some((answer) => answer.questionId === question.id)
        ? current
        : [...current, { questionId: question.id, side, correct }],
    );
    if (correct) setScore((current) => current + 1);
  };

  if (phase === "intro") {
    return <HigherLowerIntro t={t} onExit={onExit} onStart={startRound} />;
  }

  if (phase === "finished") {
    const message =
      score === ROUND_SIZE ? t.perfect : score >= 8 ? t.strong : score >= 5 ? t.good : t.learning;
    const loggedFrames = answerLog.slice(0, 5).flatMap((answer) => {
      const resultQuestion = round.find((item) => item.id === answer.questionId);
      if (!resultQuestion) return [];
      const side = answer.side ?? resultQuestion.correctSide;
      const visual = UTAH_HIGHER_OR_LOWER_VISUALS[resultQuestion.id]?.[side];
      return [
        {
          id: `${resultQuestion.id}-${side}`,
          src: visual?.src ?? utahTriviaAtlas,
          label: resultQuestion[side][language],
          correct: answer.correct,
        },
      ];
    });
    const resultFrames = loggedFrames.length
      ? loggedFrames
      : round.slice(0, 5).map((resultQuestion) => {
          const visual = UTAH_HIGHER_OR_LOWER_VISUALS[resultQuestion.id]?.[
            resultQuestion.correctSide
          ];
          return {
            id: resultQuestion.id,
            src: visual?.src ?? utahTriviaAtlas,
            label: resultQuestion[resultQuestion.correctSide][language],
            correct: true,
          };
        });
    return (
      <div className="passenger-higher-lower-layout flex min-h-full flex-col gap-5">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <section className="passenger-higher-lower-results relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/25 p-6">
          <img
            src={utahTriviaAtlas}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.96),rgba(5,7,9,0.83),rgba(5,7,9,0.34))]" />
          <div className="passenger-higher-lower-results-content relative z-10 grid w-full items-center gap-8">
            <div className="passenger-higher-lower-result-stage">
              <span className="passenger-higher-lower-result-icon">
                <Trophy className="h-9 w-9" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
                {t.finishedEyebrow}
              </p>
              <strong className="passenger-higher-lower-result-score">
                {score}
                <small>/{ROUND_SIZE}</small>
              </strong>
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                {t.score}
              </span>
            </div>
            <div className="passenger-higher-lower-result-copy">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E6CE20]">
                {t.roundReview}
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[1.04] tracking-tight">
                {t.finishedTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">{message}</p>
              <div className="passenger-higher-lower-result-rail" aria-label={t.roundReview}>
                {resultFrames.map((frame) => (
                  <span
                    key={frame.id}
                    className={`passenger-higher-lower-result-frame ${frame.correct ? "is-correct" : "is-wrong"}`}
                    title={frame.label}
                  >
                    <img src={frame.src} alt="" aria-hidden="true" />
                    <span className="passenger-higher-lower-result-frame-status">
                      {frame.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </span>
                  </span>
                ))}
              </div>
              <p className="passenger-higher-lower-result-statline">
                {score}/{ROUND_SIZE} {t.correctReads}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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
  const selectedCorrect = selectedSide === question.correctSide;
  const progress = ((questionIndex + (answered ? 1 : 0)) / ROUND_SIZE) * 100;
  const correctLabel = question[question.correctSide][language];
  const visuals = UTAH_HIGHER_OR_LOWER_VISUALS[question.id];
  return (
    <div className="passenger-higher-lower-layout flex min-h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="passenger-trivia-back">
          <ArrowLeft className="h-4 w-4" />
          {t.exit}
        </button>
        <span className="passenger-trivia-mile text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          <ArrowUpDown className="h-4 w-4 text-[#E6CE20]" />
          {t.question} {questionIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="passenger-trivia-progress h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <section className="passenger-higher-lower-board relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/10 p-6">
        <span className="passenger-choice-board-line passenger-choice-board-line--one" />
        <span className="passenger-choice-board-line passenger-choice-board-line--two" />
        <div className="passenger-higher-lower-board-content relative z-10 min-h-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
              {question.category[language]}
            </p>
            <span className={`passenger-timed-game-meter ${timer.isWarning ? "is-warning" : ""}`}>
              <span>{t.timeLeft}</span>
              <strong>{Math.ceil(timer.remainingMs / 1000)}</strong>
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-[#E6CE20] transition-[width] duration-100 ${timer.isWarning ? "passenger-timed-game-bar--warning" : ""}`}
              style={{ width: `${timer.progress * 100}%` }}
            />
          </div>
          <div className="passenger-higher-lower-prompt-slot mt-5">
            <h1 className="passenger-higher-lower-prompt max-w-3xl font-black leading-[1.05] tracking-tight">
              {question.prompt[language]}
            </h1>
          </div>
          <div className="passenger-higher-lower-options mt-6 grid min-h-0 grid-cols-2 gap-5">
            <span className="passenger-higher-lower-or" aria-hidden="true">
              {language === "en" ? "OR" : "O"}
            </span>
            {(["left", "right"] as const).map((side) => {
              const isCorrect = answered && side === question.correctSide;
              const isWrong = selectedSide === side && !isCorrect;
              const visual = visuals?.[side];
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => choose(side)}
                  disabled={answered}
                  className={`passenger-higher-lower-option passenger-higher-lower-option--${side} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                >
                  {visual && (
                    <img
                      src={visual.src}
                      alt=""
                      aria-hidden="true"
                      className="passenger-higher-lower-option-art"
                      style={{ objectPosition: visual.objectPosition }}
                      decoding="async"
                      loading="eager"
                    />
                  )}
                  <span className="passenger-higher-lower-option-scrim" aria-hidden="true" />
                  <span className="passenger-higher-lower-option-flare" aria-hidden="true" />
                  <span className="passenger-higher-lower-option-kicker">
                    <span className="passenger-higher-lower-option-label">
                      {side === "left" ? "A" : "B"}
                    </span>
                    <span>{side === "left" ? "THIS" : "THAT"}</span>
                  </span>
                  <span className="passenger-higher-lower-option-copy">
                    {question[side][language]}
                  </span>
                  <span className="passenger-higher-lower-option-footer">
                    {isCorrect ? (
                      <Check className="h-5 w-5" />
                    ) : isWrong ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="passenger-higher-lower-feedback-slot">
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
                        {t.answerWas} <strong className="text-white">{correctLabel}.</strong>{" "}
                      </>
                    )}
                    {question.explanation[language]}
                  </p>
                </div>
                {!timedOut && (
                  <button
                    type="button"
                    onClick={advance}
                    className="passenger-trivia-primary shrink-0"
                  >
                    {questionIndex === round.length - 1 ? t.results : t.next}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : (
              <p className="passenger-higher-lower-feedback-placeholder">{t.pickASide}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function HigherLowerIntro({
  t,
  onExit,
  onStart,
}: {
  t: (typeof copy)[TriviaLanguage];
  onExit: () => void;
  onStart: () => void;
}) {
  return (
    <div className="passenger-higher-lower-layout flex min-h-full flex-col gap-5">
      <button type="button" onClick={onExit} className="passenger-trivia-back">
        <ArrowLeft className="h-4 w-4" />
        {t.exit}
      </button>
      <section className="passenger-higher-lower-intro relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/30 p-7">
        <img
          src={utahTriviaAtlas}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[54%_center]"
        />
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.97),rgba(5,7,9,0.84)_43%,rgba(5,7,9,0.24))]" />
        <div className="relative z-10 flex max-w-xl flex-col justify-center">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] border border-[#E6CE20]/45 bg-[#E6CE20] text-black">
            <ArrowUpDown className="h-8 w-8" />
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
          <button type="button" onClick={onStart} className="passenger-trivia-primary mt-8">
            {t.start}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
