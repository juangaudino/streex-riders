type Experience = {
  label: string;
  gradient: string;
  image?: string;
  microLabel?: string;
};

const EXPERIENCES: Experience[] = [
  { label: "Salt Lake City", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
  { label: "Park City", gradient: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)" },
  { label: "SLC Airport", gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" },
  { label: "Mountain Routes", gradient: "linear-gradient(135deg, #0f1923 0%, #1c2e3d 100%)" },
  {
    label: "Your Ride",
    gradient:
      "linear-gradient(135deg, #1a1a1a 0%, #2b2b2b 45%, #111111 100%)",
    // image: "/path/to/streex-vehicle.jpg", // swap in real photo later
    microLabel: "✦ Toyota RAV4 • Spacious SUV",
  },
];

export function ExperienceGallery() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-5 px-6">The Streex Experience</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2 snap-x snap-mandatory">
        {EXPERIENCES.map((e) => (
          <div
            key={e.label}
            className="relative shrink-0 snap-start rounded-[20px] overflow-hidden border border-white/8 streex-glass"
            style={{
              width: 240,
              minHeight: 200,
              background: e.gradient,
            }}
          >
            {e.image && (
              <img
                src={e.image}
                alt={e.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)",
              }}
            />
            {e.microLabel && (
              <div
                className="absolute top-4 left-4 right-4"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.04em",
                }}
              >
                {e.microLabel}
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-[2px] w-8 bg-[#E6CE20] mb-2" />
              <div
                className="text-white streex-gallery-caption"
                style={{ fontSize: 14 }}
              >
                {e.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}