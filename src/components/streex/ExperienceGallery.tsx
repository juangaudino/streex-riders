type Experience = {
  label: string;
  image: string;
  microLabel?: string;
};

const EXPERIENCES: Experience[] = [
  {
    label: "Salt Lake City",
    image:
      "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/slc.jpg",
  },
  {
    label: "Park City",
    image:
      "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/park-city.jpg",
  },
  {
    label: "SLC Airport",
    image:
      "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/airport.jpg",
  },
  {
    label: "Mountain Routes",
    image:
      "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/mountains.jpg",
  },
  {
    label: "Your Ride",
    image:
      "https://scqjdsugrgsglkabdflu.supabase.co/storage/v1/object/public/images/rav4.jpg",
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
              backgroundImage: `url(${e.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
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