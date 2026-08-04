import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles, X } from "lucide-react";
import { createTriviaRound, type TriviaLanguage, type UtahTriviaQuestion } from "./utah-trivia";

const ROUND_SIZE = 10;

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
    eyebrow: "TRIVIA DE UTAH",
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

export function UtahTrivia({ language, onExit }: { language: TriviaLanguage; onExit: () => void }) {
  const t = triviaCopy[language];
  const [phase, setPhase] = useState<TriviaPhase>("intro");
  const [round, setRound] = useState<UtahTriviaQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startRound = () => {
    setRound(createTriviaRound(undefined, ROUND_SIZE));
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
        <section className="passenger-trivia-hero relative flex flex-1 overflow-hidden rounded-[30px] border border-[#E6CE20]/30 bg-gradient-to-br from-[#E6CE20]/20 via-white/[0.04] to-black p-7">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#E6CE20]/20 blur-3xl" />
          <div className="relative flex max-w-xl flex-col justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#E6CE20] text-black shadow-[0_12px_40px_rgba(230,206,32,0.2)]">
              <Sparkles className="h-8 w-8" />
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
          <div className="passenger-trivia-mark" aria-hidden="true">
            UT
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
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#E6CE20] text-black">
            <Sparkles className="h-8 w-8" />
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
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          {t.question} {questionIndex + 1}/{ROUND_SIZE}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#E6CE20] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <section className="passenger-trivia-question flex min-h-0 flex-1 flex-col rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E6CE20]">
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
