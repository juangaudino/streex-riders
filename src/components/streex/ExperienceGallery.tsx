import type { AppConfig } from "@/config";

export function ExperienceGallery({ config }: { config: AppConfig }) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-5 px-6">The Streex Experience</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2 snap-x snap-mandatory">
        {config.galleryImages.map((e) => (
          <div
            key={e.label}
            className="relative shrink-0 snap-start rounded-[20px] overflow-hidden border border-white/8 streex-glass"
            style={{
              width: 240,
              minHeight: 200,
              backgroundImage: `url(${e.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)",
              }}
            />
            {e.microLabel && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.05em",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {e.microLabel}
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-[2px] w-8 bg-[#E6CE20] mb-2" />
              <div className="text-white streex-gallery-caption" style={{ fontSize: 14 }}>
                {e.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
