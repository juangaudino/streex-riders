// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";

const SERVICES = CONFIG.tickerServices;
const TICKER_STYLE = CONFIG.tickerStyle;

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
  return (
    <span className="streex-led-panel">
      <span className="streex-led-code">{String(index + 1).padStart(2, "0")}</span>
      <span className="streex-led-text">{service}</span>
    </span>
  );
}

function ServiceTickerItem({ service, index }: { service: string; index: number }) {
  if (TICKER_STYLE === "pill") {
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

function TickerRow() {
  return (
    <>
      {SERVICES.map((service, i) => {
        return <ServiceTickerItem key={service} service={service} index={i} />;
      })}
    </>
  );
}

export function ServiceTicker() {
  return (
    <div
      className={TICKER_STYLE === "boarding" ? "streex-led-board" : undefined}
      style={{
        overflow: "hidden",
        width: "100%",
        padding: TICKER_STYLE === "boarding" ? "12px 0" : "10px 0",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: TICKER_STYLE === "pill" ? "rgba(255,255,255,0.02)" : undefined,
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="streex-ticker-track" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex" }}>
          <TickerRow />
        </div>
        <div style={{ display: "inline-flex" }}>
          <TickerRow />
        </div>
      </div>
    </div>
  );
}

export default ServiceTicker;
