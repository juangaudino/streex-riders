import { useRef, useState } from "react";
import { Star, Check } from "lucide-react";
import { submitPassengerReview } from "@/lib/review.functions";
import { trackEvent } from "@/lib/analytics";

type FeedbackLanguage = "en" | "es";

const COPY = {
  en: {
    title: "Share Your Experience",
    subtitle: "Your feedback helps us improve every ride.",
    name: "Your name (optional)",
    message: "Tell us about your experience...",
    ratingError: "Please select a rating.",
    messageError: "Please share a short message.",
    sending: "Sending...",
    send: "Send Feedback",
    thanks: "Thank you. Your feedback was received and will be reviewed before appearing publicly.",
  },
  es: {
    title: "Comparta su experiencia",
    subtitle: "Sus comentarios nos ayudan a mejorar cada viaje.",
    name: "Su nombre (opcional)",
    message: "Cuéntenos sobre su experiencia...",
    ratingError: "Seleccione una calificación.",
    messageError: "Comparta un comentario breve.",
    sending: "Enviando...",
    send: "Enviar comentario",
    thanks: "Gracias. Recibimos sus comentarios y los revisaremos antes de publicarlos.",
  },
} as const;

export function FeedbackForm({ compact = false, language = "en" }: { compact?: boolean; language?: FeedbackLanguage }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openedRef = useRef(false);
  const t = COPY[language];

  const trackReviewOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    trackEvent("review_form_opened");
  };

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (rating < 1 || rating > 5) {
      setError(t.ratingError);
      return;
    }
    const trimmedMessage = text.trim();
    if (!trimmedMessage) {
      setError(t.messageError);
      return;
    }
    setSubmitting(true);
    try {
      await submitPassengerReview({
        data: {
          name: name.trim() || null,
          rating,
          message: trimmedMessage.slice(0, 1000),
        },
      });
      trackEvent("review_submitted", { rating });
      setSubmitted(true);
      setName("");
      setText("");
      setRating(0);
    } catch (submitError) {
      console.error("[FeedbackForm] review submit error", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={compact ? "px-0 mt-0" : "px-6 mt-16"}>
      {!compact && (
        <>
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-sm text-white/60 mb-5">{t.subtitle}</p>
        </>
      )}

      <div className="streex-glass p-6" onFocusCapture={trackReviewOpened}>
        {submitted ? (
          <div className="streex-fade-in flex flex-col items-center text-center py-6">
            <div className="h-14 w-14 rounded-full flex items-center justify-center bg-[#E6CE20]/15 border border-[#E6CE20]/40 mb-4">
              <Check className="h-7 w-7 text-[#E6CE20]" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] text-white/85 max-w-xs">
              {t.thanks}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                const active = (hover || rating) >= value;
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => {
                      trackReviewOpened();
                      setRating(value);
                    }}
                    aria-label={`Rate ${value} stars`}
                    className="p-1"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${active ? "text-[#E6CE20]" : "text-white/30"}`}
                      fill={active ? "#E6CE20" : "none"}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6CE20]/50"
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.message}
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6CE20]/50 resize-none"
            />

            {error && <p className="text-xs text-red-400/90 text-center">{error}</p>}

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="w-full rounded-full bg-[#E6CE20] text-black font-semibold py-3 text-[14px] tracking-wide transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? t.sending : t.send}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
