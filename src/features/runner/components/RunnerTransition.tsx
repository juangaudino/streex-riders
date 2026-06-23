import { RunnerLogo } from "./RunnerLogo";

export function RunnerTransition() {
  return (
    <div className="runner-transition" aria-label="Entering Streex Horizon">
      <div className="runner-transition-glow" aria-hidden="true" />
      <div className="runner-transition-pixels" aria-hidden="true" />

      <div className="runner-transition-card">
        <RunnerLogo compact />
        <span>Preparing Your Ride</span>
        <div className="runner-transition-line" aria-hidden="true">
          <span />
        </div>
      </div>

      <style>{`
        .runner-transition {
          min-height: 100svh;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          color: white;
          background:
            radial-gradient(circle at 50% 52%, rgba(230,206,32,0.16), transparent 34%),
            linear-gradient(180deg, #080908 0%, #050505 100%);
          animation: runnerTransitionFade 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .runner-transition-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(78vw, 340px);
          height: min(78vw, 340px);
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background:
            radial-gradient(circle, rgba(230,206,32,0.28), rgba(230,206,32,0.08) 38%, transparent 70%);
          filter: blur(14px);
          opacity: 0.86;
          animation: runnerTransitionGlow 520ms ease both;
        }

        .runner-transition-pixels {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 12px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 12px);
          mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 68%);
          pointer-events: none;
        }

        .runner-transition-card {
          position: relative;
          z-index: 1;
          display: grid;
          justify-items: center;
          gap: 18px;
          padding: 26px 30px;
          text-align: center;
          animation: runnerTransitionLift 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .runner-transition-card span {
          color: rgba(255,255,255,0.78);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .runner-transition-line {
          position: relative;
          width: min(58vw, 220px);
          height: 2px;
          margin-top: 4px;
          border-radius: 999px;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 0%,
            rgba(230,206,32,0.14) 50%,
            rgba(255,255,255,0.04) 100%
          );
        }

        .runner-transition-line span {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -40%;
          width: 40%;
          background: linear-gradient(
            90deg,
            rgba(230,206,32,0) 0%,
            rgba(230,206,32,0.85) 50%,
            rgba(230,206,32,0) 100%
          );
          animation: runnerTransitionShimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes runnerTransitionShimmer {
          0% { left: -40%; }
          100% { left: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .runner-transition-line span {
            animation: none;
            left: 30%;
            opacity: 0.6;
          }
        }

        @supports (height: 100dvh) {
          .runner-transition {
            min-height: 100dvh;
          }
        }

        @keyframes runnerTransitionFade {
          0% { opacity: 0; }
          18% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes runnerTransitionLift {
          0% { opacity: 0; transform: translateY(8px) scale(0.98); filter: blur(8px); }
          55% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes runnerTransitionGlow {
          0% { transform: translate(-50%, -50%) scale(0.82); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.86; }
        }
      `}</style>
    </div>
  );
}
