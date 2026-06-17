import { useEffect, useState } from "react";
import { CONFIG, type AppConfig } from "@/config";
import { getTickerTheme } from "@/lib/ticker-theme.functions";

type TickerStyle = "boarding" | "pill";

function isTickerStyle(value: string | null | undefined): value is TickerStyle {
  return value === "boarding" || value === "pill";
}

function ServicePill({ service, tone }: { service: string; tone: "light" | "accent" }) {
  const isAccent = tone === "accent";
  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase whitespace-nowrap"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        color: isAccent ? "#E6CE20" : "rgba(255,255,255,0.88)",
        background: isAccent ? "rgba(230,206,32,0.08)" : "rgba(255,255,255,0.045)",
        borderColor: isAccent ? "rgba(230,206,32,0.25)" : "rgba(255,255,255,0.10)",
      }}
    >
      {service}
    </span>
  );
}

function ServicePanel({ service, index }: { service: string; index: number }) {
  const tone = index % 3;
  return (
    <span className={`streex-led-panel streex-led-panel-${tone}`}>
      <span className="streex-led-code">{String(index + 1).padStart(2, "0")}</span>
      <span className="streex-led-text">{service}</span>
    </span>
  );
}

function ServiceTickerItem({
  service,
  index,
  tickerStyle,
}: {
  service: string;
  index: number;
  tickerStyle: TickerStyle;
}) {
  if (tickerStyle === "pill") {
    return (
      <span className="inline-flex items-center gap-3 pr-3">
        <ServicePill service={service} tone={index % 2 === 0 ? "light" : "accent"} />
        <span className="text-[#E6CE20]/55" aria-hidden="true">
          •
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center pr-2">
      <ServicePanel service={service} index={index} />
    </span>
  );
}

function TickerRow({ tickerStyle, services }: { tickerStyle: TickerStyle; services: string[] }) {
  return (
    <>
      {services.map((service, i) => {
        return (
          <ServiceTickerItem key={service} service={service} index={i} tickerStyle={tickerStyle} />
        );
      })}
    </>
  );
}

function useTickerStyle() {
  const [tickerStyle, setTickerStyle] = useState<TickerStyle>(
    isTickerStyle(CONFIG.tickerStyle) ? CONFIG.tickerStyle : "boarding",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTickerStyle() {
      try {
        const result = await getTickerTheme();
        if (!cancelled && isTickerStyle(result.tickerStyle)) {
          setTickerStyle(result.tickerStyle);
        }
      } catch (error) {
        console.warn("[ServiceTicker] Using default ticker style.", error);
      }
    }

    loadTickerStyle();

    const onThemeChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ tickerStyle?: string }>).detail;
      if (isTickerStyle(detail?.tickerStyle)) setTickerStyle(detail.tickerStyle);
    };

    window.addEventListener("streex:ticker-theme-changed", onThemeChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("streex:ticker-theme-changed", onThemeChanged);
    };
  }, []);

  return tickerStyle;
}

export function ServiceTicker({ config }: { config: AppConfig }) {
  const tickerStyle = useTickerStyle();
  const services = config.tickerServices;

  return (
    <div
      className={tickerStyle === "boarding" ? "streex-led-board" : undefined}
      style={{
        overflow: "hidden",
        width: "100%",
        padding: tickerStyle === "boarding" ? "12px 0" : "10px 0",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: tickerStyle === "pill" ? "rgba(255,255,255,0.02)" : undefined,
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="streex-ticker-track" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex" }}>
          <TickerRow tickerStyle={tickerStyle} services={services} />
        </div>
        <div style={{ display: "inline-flex" }}>
          <TickerRow tickerStyle={tickerStyle} services={services} />
        </div>
      </div>
    </div>
  );
}

export default ServiceTicker;
