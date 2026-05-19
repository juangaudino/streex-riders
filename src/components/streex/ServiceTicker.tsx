const SERVICES = [
  "Airport Rides",
  "Park City",
  "Long Distance",
  "Scheduled Rides",
  "Hourly Service",
];

function TickerRow() {
  return (
    <>
      {SERVICES.map((s, i) => {
        const isOdd = i % 2 === 0;
        const textColor = isOdd ? "#FFFFFF" : "#E6CE20";
        const sepColor = isOdd ? "#E6CE20" : "rgba(255,255,255,0.35)";
        return (
          <span key={`${s}-${i}`} className="flex items-center shrink-0">
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: textColor,
                letterSpacing: "0.15em",
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
                margin: "0 20px",
                backgroundColor: sepColor,
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