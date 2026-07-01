import { MapPin, Mountain, Navigation } from "lucide-react";
import { Reveal } from "./Reveal";

const AREA_GROUPS = [
  {
    icon: MapPin,
    title: "Core Service",
    areas: "Salt Lake City · SLC Airport · Park City",
  },
  {
    icon: Navigation,
    title: "Wasatch Front",
    areas: "Ogden · Layton · Clearfield · Farmington · South Salt Lake · Sandy · Draper",
  },
  {
    icon: Mountain,
    title: "Extended Rides",
    areas: "Lehi · Provo · Las Vegas · Idaho · Custom long-distance routes",
  },
] as const;

export function ServiceAreas() {
  return (
    <Reveal as="section" className="px-6 mt-16">
      <div className="streex-divider w-16 mb-5" />
      <p className="text-[11px] uppercase streex-tracking text-[#E6CE20] font-semibold mb-2">
        Where We Ride
      </p>
      <h2 className="text-2xl font-bold">Utah roots. Longer horizons.</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/60">
        Private transportation throughout Northern Utah, Park City and beyond — with every route
        planned around your schedule.
      </p>

      <div className="mt-6 space-y-3">
        {AREA_GROUPS.map(({ icon: Icon, title, areas }) => (
          <div key={title} className="streex-glass px-5 py-4 flex items-start gap-4">
            <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-[#E6CE20]/25 bg-[#E6CE20]/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-[#E6CE20]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-white/55">{areas}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
