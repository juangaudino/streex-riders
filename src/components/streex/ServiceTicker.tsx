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

function TickerRow() {
  return (
    <>
      {SERVICES.map((s, i) => {
        const textColor = i % 2 === 0 ? "#FFFFFF" : "#E6CE20";
        return (
          <span key={`${s}-${i}`} className="flex items-center shrink-0">
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: textColor,
                letterSpacing: "0.12em",
                fontVariantNumeric: "tabular-nums",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "16px",
                height: "1px",
                verticalAlign: "middle",
                margin: "0 24px",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />
          </span>
        );
      })}
    </>
  );
}

export function ServiceTicker() {
  return (
    <div
      className="streex-ticker"
      style={{ overflow: "hidden", width: "100%" }}
    >
      <div className="streex-ticker-track flex w-max">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}