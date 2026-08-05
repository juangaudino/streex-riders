import type { AppConfig } from "@/config";

export function ExperienceGallery({
  autoScroll = false,
  config,
  excludeVehicle = false,
  prioritizeVehicle = false,
  title = "The Streex Experience",
}: {
  autoScroll?: boolean;
  config: AppConfig;
  excludeVehicle?: boolean;
  prioritizeVehicle?: boolean;
  title?: string;
}) {
  const galleryImages = excludeVehicle
    ? config.galleryImages.filter((image) => !image.image.includes("rav4"))
    : config.galleryImages;
  const images = prioritizeVehicle
    ? [...galleryImages].sort((left, right) => {
        const leftIsVehicle = left.image.includes("rav4");
        const rightIsVehicle = right.image.includes("rav4");
        return Number(rightIsVehicle) - Number(leftIsVehicle);
      })
    : galleryImages;

  const cards = images.map((e) => (
    <div
      key={e.label}
      className="relative shrink-0 snap-start overflow-hidden rounded-[20px] border border-white/8 streex-glass"
      style={{
        width: 240,
        minHeight: 200,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <img
        src={e.image}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
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
        <div className="mb-2 h-[2px] w-8 bg-[#E6CE20]" />
        <div className="streex-gallery-caption text-white" style={{ fontSize: 14 }}>
          {e.label}
        </div>
      </div>
    </div>
  ));

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-5 px-6">{title}</h2>
      <div
        className={`no-scrollbar px-6 pb-2 ${autoScroll ? "overflow-hidden" : "overflow-x-auto"}`}
      >
        {autoScroll ? (
          <div className="passenger-gallery-track flex w-max gap-4">
            <div className="flex gap-4">{cards}</div>
            <div aria-hidden="true" className="flex gap-4">
              {cards}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 snap-x snap-mandatory">{cards}</div>
        )}
      </div>
    </section>
  );
}
