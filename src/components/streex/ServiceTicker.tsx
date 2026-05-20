const SERVICES = [
  "Airport Transfers",
  "Park City",
  "Scheduled Rides",
  "Hourly Service",
  "Corporate Travel",
  "Private Events",
  "Bilingual Service",
  "Las Vegas",
];

const cellBase: React.CSSProperties = {
  display: "inline-block",
  height: 18,
  lineHeight: "18px",
  textAlign: "center",
  borderRadius: 2,
  margin: "0 0.5px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: 0,
};

function CharCell({ char, color }: { char: string; color: string }) {
  const isSpace = char === " ";
  return (
    <span
      style={{
        ...cellBase,
        width: isSpace ? 4 : 10,
        background: isSpace ? "transparent" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isSpace ? "transparent" : "rgba(255,255,255,0.07)"}`,
        color,
      }}
    >
      {isSpace ? "\u00A0" : char}
    </span>
  );
}

function SeparatorCell({ dotColor, bgColor, borderColor }: {
  dotColor: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <span style={{
      display: "inline-block",
      width: "18px",
      height: "18px",
      lineHeight: "18px",
      textAlign: "center",
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "3px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "10px",
      color: dotColor,
    }}>
      •
    </span>
  );
}

function getContrastStyles(textColor: string) {
  const isWhite = textColor === "#FFFFFF";
  return {
    dotColor: isWhite ? "rgba(230,206,32,0.85)" : "rgba(255,255,255,0.75)",
    bgColor: isWhite ? "rgba(230,206,32,0.1)" : "rgba(255,255,255,0.06)",
    borderColor: isWhite ? "rgba(230,206,32,0.3)" : "rgba(255,255,255,0.2)",
  };
}

function TickerRow() {
  return (
    <>
      {SERVICES.map((service, i) => {
        const color = i % 2 === 0 ? "#FFFFFF" : "#E6CE20";
        const nextColor = (i + 1) % 2 === 0 ? "#FFFFFF" : "#E6CE20";
        const firstSep = getContrastStyles(color);
        const secondSep = getContrastStyles(nextColor);
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            {service.split("").map((char, j) => (
              <CharCell key={j} char={char} color={color} />
            ))}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              margin: "0 12px",
            }}>
              <SeparatorCell
                dotColor={firstSep.dotColor}
                bgColor={firstSep.bgColor}
                borderColor={firstSep.borderColor}
              />
              <SeparatorCell
                dotColor={secondSep.dotColor}
                bgColor={secondSep.bgColor}
                borderColor={secondSep.borderColor}
              />
            </span>
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
        padding: "8px 0",
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
