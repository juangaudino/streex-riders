import { PlaneTakeoff, Mountain, CalendarCheck, Clock, Briefcase, MapPin, Sparkles, Star } from "lucide-react";
import { Reveal } from "./Reveal";

type Service = {
  icon: React.ReactNode;
  name: string;
  price: string;
  subtitle?: string;
  enabled: boolean;
};

const SERVICES: Service[] = [
  {
    icon: <PlaneTakeoff className="h-5 w-5 text-[#E6CE20]" />,
    name: "Airport Transfers",
    price: "From $40",
    enabled: true,
  },
  {
    icon: <Mountain className="h-5 w-5 text-[#E6CE20]" />,
    name: "Park City",
    price: "From $80",
    enabled: true,
  },
  {
    icon: <CalendarCheck className="h-5 w-5 text-[#E6CE20]" />,
    name: "Scheduled Rides",
    price: "From $40",
    enabled: true,
  },
  {
    icon: <Clock className="h-5 w-5 text-[#E6CE20]" />,
    name: "Hourly Service",
    price: "$60/hr · 40 mi included",
    subtitle: "$1 per additional mile",
    enabled: true,
  },
  {
    icon: <Briefcase className="h-5 w-5 text-[#E6CE20]" />,
    name: "Corporate Travel",
    price: "Contact for quote",
    enabled: true,
  },
  {
    icon: <MapPin className="h-5 w-5 text-[#E6CE20]" />,
    name: "Long Distance",
    price: "Contact for quote",
    enabled: true,
  },
  // CONFIG: enabled: false
  {
    icon: <Sparkles className="h-5 w-5 text-[#E6CE20]" />,
    name: "Las Vegas",
    price: "Contact for quote",
    enabled: false,
  },
  // CONFIG: enabled: false
  {
    icon: <Star className="h-5 w-5 text-[#E6CE20]" />,
    name: "Private Events",
    price: "Contact for quote",
    enabled: false,
  },
];

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
  subtitle?: string;
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
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 13, color: "#E6CE20" }}
          >
            {price}
          </div>
          {subtitle && (
            <div
              className="mt-0.5"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 11, color: "rgba(255,255,255,0.4)" }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function ServicesSection() {
  const visible = SERVICES.filter((s) => s.enabled);

  return (
    <section className="px-6 mt-16">
      <h2 className="text-2xl font-bold mb-5">Our Services</h2>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((s, idx) => (
          <ServiceCard
            key={s.name}
            icon={s.icon}
            name={s.name}
            price={s.price}
            subtitle={s.subtitle}
            revealDelay={idx * 90}
          />
        ))}
      </div>
    </section>
  );
}
