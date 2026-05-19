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
      {SERVICES.map((s, i) => (
        <span key={`${s}-${i}`} className="flex items-center shrink-0">
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {s}
          </span>
          <span
            aria-hidden
            style={{
              color: "#E6CE20",
              margin: "0 16px",
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            ·
          </span>
        </span>
      ))}
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