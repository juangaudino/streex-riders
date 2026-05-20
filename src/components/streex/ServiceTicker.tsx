const SERVICES = [
  "Airport Transfers",
  "Park City",
  "Long Distance",
  "Scheduled Rides",
  "Hourly Service",
  "Corporate Travel",
  "Private Events",
  "Bilingual Service",
  "Las Vegas",
];

const cellBase: React.CSSProperties = {
  display: "inline-block",
  width: 11,
  height: 20,
  lineHeight: "20px",
  textAlign: "center",
  borderRadius: 2,
  margin: "0 1px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 0,
};

function CharCell({ char, color }: { char: string; color: string }) {
  const isSpace = char === " ";
  return (
    <span
      style={{
        ...cellBase,
        background: isSpace ? "transparent" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isSpace ? "transparent" : "rgba(255,255,255,0.07)"}`,
        color,
      }}
    >
      {isSpace ? "\u00A0" : char}
    </span>
  );
}

function SeparatorCells() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      margin: "0 14px",
    }}>
      <span style={{
        display: "inline-block",
        width: "18px",
        height: "18px",
        lineHeight: "18px",
        textAlign: "center",
        background: "rgba(230,206,32,0.12)",
        border: "1px solid rgba(230,206,32,0.25)",
        borderRadius: "3px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        color: "rgba(230,206,32,0.7)",
      }}>
        •
      </span>
    </span>
  );
}

function TickerRow() {
  return (
    <>
      {SERVICES.map((service, i) => {
        const color = i % 2 === 0 ? "#FFFFFF" : "#E6CE20";
        return (
          <span key={i} style={{ display: "inline-block" }}>
            {service.split("").map((char, j) => (
              <CharCell key={j} char={char} color={color} />
            ))}
            <SeparatorCells />
          </span>
        );
      })}
    </>
  );
}

export function ServiceTicker() {
  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 0",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div className="streex-ticker-track" style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block" }}>
          <TickerRow />
        </div>
        <div style={{ display: "inline-block" }}>
          <TickerRow />
        </div>
      </div>
    </div>
  );
}

export default ServiceTicker;
