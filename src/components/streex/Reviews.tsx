import { Star } from "lucide-react";

type Review = {
  name: string;
  location: string;
  stars: number;
  text: string;
};

const REVIEWS: Review[] = [
  {
    name: "Sarah M.",
    location: "Salt Lake City",
    stars: 5,
    text: "One of the most thoughtful ride experiences I've had. Everything felt smooth, calm and genuinely premium from the moment I got in the car.",
  },
  {
    name: "Michael R.",
    location: "Park City",
    stars: 5,
    text: "Reliable, comfortable and incredibly professional. Streex feels more like a private transportation service than a normal rideshare.",
  },
  {
    name: "Amanda T.",
    location: "Airport Transfer",
    stars: 5,
    text: "Perfect airport ride. Stress-free, punctual and extremely well organized. The whole experience felt intentional and elevated.",
  },
];

export function Reviews() {
  return (
    <section className="px-6 mt-16">
      <h2 className="text-2xl font-bold mb-5">What Passengers Say</h2>
      <div className="space-y-4">
        {REVIEWS.map((r) => (
          <div key={r.name} className="streex-glass p-5 relative overflow-hidden">
            <span
              aria-hidden
              className="absolute top-1 right-4 text-[#E6CE20] select-none pointer-events-none"
              style={{ fontFamily: "Montserrat", fontSize: 72, lineHeight: 1, opacity: 0.12 }}
            >
              &ldquo;
            </span>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: r.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-[#E6CE20]" fill="#E6CE20" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[14px] leading-relaxed text-white/85" style={{ fontWeight: 400 }}>
              {r.text}
            </p>
            <div className="mt-4">
              <div className="text-white" style={{ fontWeight: 700, fontSize: 14 }}>
                {r.name}
              </div>
              <div className="text-xs text-white/55 mt-0.5">{r.location}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}