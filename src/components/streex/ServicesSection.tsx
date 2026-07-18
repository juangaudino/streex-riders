import type { AppConfig } from "@/config";
import { resolveIcon } from "@/lib/icon-map";
import { Reveal } from "./Reveal";

function ServiceCard({
  icon,
  name,
  price,
  subtitle,
  revealDelay = 0,
}: {
  icon: React.ReactNode;
  name: string;
  price: string;
  subtitle?: string | null;
  revealDelay?: number;
}) {
  return (
    <Reveal delay={revealDelay}>
      <div className="streex-glass p-5 h-full flex flex-col gap-3 active:scale-[0.97] transition-transform">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/12 border border-[#E6CE20]/25">
          {icon}
        </div>
        <div>
          <div
            className="text-white"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14 }}
          >
            {name}
          </div>
          <div
            className="mt-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#E6CE20",
            }}
          >
            {price}
          </div>
          {subtitle && (
            <div
              className="mt-0.5"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function ServicesSection({
  className = "px-6 mt-16",
  config,
  title = "Our Services",
}: {
  className?: string;
  config: AppConfig;
  title?: string;
}) {
  const visible = config.services.filter((s) => s.enabled);

  return (
    <section className={className}>
      <h2 className="text-2xl font-bold mb-5">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((s, idx) => {
          const Icon = resolveIcon(s.icon);
          return (
            <ServiceCard
              key={s.id}
              icon={<Icon className="h-5 w-5 text-[#E6CE20]" />}
              name={s.name}
              price={s.price}
              subtitle={s.subtitle}
              revealDelay={idx * 90}
            />
          );
        })}
      </div>
    </section>
  );
}
