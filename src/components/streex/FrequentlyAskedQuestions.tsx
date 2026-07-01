import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    question: "How does an airport pickup work?",
    answer:
      "Submit your flight and pickup details with your ride request. Juan will review the trip, confirm the plan personally and coordinate the pickup details with you before arrival.",
  },
  {
    question: "How far in advance should I request a ride?",
    answer:
      "Online requests require at least 12 hours of notice. Earlier requests are recommended for airport trips, Park City travel, events and long-distance rides.",
  },
  {
    question: "Do you offer hourly service?",
    answer:
      "Yes. You can reserve Streex by the hour for appointments, business travel, events or a flexible itinerary. Select Hourly in the booking form and choose the time you need.",
  },
  {
    question: "Can I book a ride to Park City or a ski resort?",
    answer:
      "Yes. Streex serves Park City and surrounding mountain destinations, including rides from Salt Lake City and SLC Airport. Availability depends on your requested date and conditions.",
  },
  {
    question: "Do you provide long-distance rides?",
    answer:
      "Yes. Custom long-distance transportation is available, including routes to Las Vegas and Idaho. Submit the full route to receive a personal quote.",
  },
  {
    question: "What happens after I submit a request?",
    answer:
      "Your request is reviewed personally. You will receive a quote and confirmation before the ride is finalized; submitting the form does not charge you automatically.",
  },
  {
    question: "Is service available in Spanish?",
    answer: "Yes. Streex offers personal service in both English and Spanish.",
  },
] as const;

export function FrequentlyAskedQuestions() {
  return (
    <Reveal as="section" className="px-6 mt-16">
      <p className="text-[11px] uppercase streex-tracking text-[#E6CE20] font-semibold mb-2">
        Good to Know
      </p>
      <h2 className="text-2xl font-bold mb-5">Frequently Asked Questions</h2>

      <div className="divide-y divide-white/10 border-y border-white/10">
        {FAQS.map(({ question, answer }) => (
          <details key={question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-semibold leading-snug text-white">{question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors group-open:border-[#E6CE20]/30 group-open:bg-[#E6CE20]/10">
                <ChevronDown className="h-4 w-4 text-white/55 transition-transform duration-300 group-open:rotate-180 group-open:text-[#E6CE20]" />
              </span>
            </summary>
            <p className="max-w-sm pb-5 pr-10 text-[13px] leading-relaxed text-white/60">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </Reveal>
  );
}
