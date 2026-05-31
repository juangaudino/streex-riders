export function RunnerTransition() {
  return (
    <div className="runner-transition" aria-label="Entering STREEX Runner">
      <div className="runner-transition-mark">
        <span>STREEX</span>
        <strong>RUNNER</strong>
      </div>
      <style>{`
        .runner-transition {
          min-height: 100vh;
          display: grid;
          place-items: center;
          color: white;
          background:
            repeating-linear-gradient(90deg, rgba(230,206,32,0.12) 0 2px, transparent 2px 9px),
            radial-gradient(circle at 50% 50%, rgba(230,206,32,0.2), transparent 38%),
            #0b0b0b;
          animation: runnerPixelReveal 620ms ease both;
        }

        .runner-transition-mark {
          display: grid;
          gap: 3px;
          text-align: center;
          letter-spacing: 0.22em;
        }

        .runner-transition-mark span {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.72;
        }

        .runner-transition-mark strong {
          color: #e6ce20;
          font-size: 32px;
          font-weight: 900;
        }

        @keyframes runnerPixelReveal {
          from { opacity: 0; filter: blur(12px); transform: scale(1.02); }
          45% { opacity: 1; filter: blur(0); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
