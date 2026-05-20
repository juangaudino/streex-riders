import { useState } from "react";
import { Star, Check } from "lucide-react";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <section className="px-6 mt-16">
      <h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
      <p className="text-sm text-white/60 mb-5">
        Your feedback helps us improve every ride.
      </p>

      <div className="streex-glass p-6">
        {submitted ? (
          <div className="streex-fade-in flex flex-col items-center text-center py-6">
            <div className="h-14 w-14 rounded-full flex items-center justify-center bg-[#E6CE20]/15 border border-[#E6CE20]/40 mb-4">
              <Check className="h-7 w-7 text-[#E6CE20]" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] text-white/85 max-w-xs">
              Thank you. Your feedback means a lot to us.
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
                    onClick={() => setRating(value)}
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
              placeholder="Your name (optional)"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6CE20]/50"
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6CE20]/50 resize-none"
            />

            <button
              type="button"
              onClick={onSubmit}
              className="w-full rounded-full bg-[#E6CE20] text-black font-semibold py-3 text-[14px] tracking-wide transition-transform active:scale-[0.98]"
            >
              Send Feedback
            </button>
          </div>
        )}
      </div>
    </section>
  );
}