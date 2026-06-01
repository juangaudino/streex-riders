import { RUNNER_COLORS } from "../runner.config";
import { RUNNER_SPRITES } from "../assets/manifest";

type RunnerIntroProps = {
  onPlay: () => void;
  onBack: () => void;
};

export function RunnerIntro({ onPlay, onBack }: RunnerIntroProps) {
  return (
    <section className="runner-shell">
      <div className="runner-frame">
        {/* ─── Cinematic Hero ─────────────────────── */}
        <div className="runner-hero" aria-hidden="true">
          <div className="runner-sky" />
          <img
            className="runner-horizon"
            src={RUNNER_SPRITES.horizonGroundBlend2}
            alt=""
          />
          <div className="runner-mountains" />

          <div className="runner-road-stage">
            <div className="runner-road">
              <div className="runner-road-side runner-road-side-left" />
              <div className="runner-road-side runner-road-side-right" />
              <div className="runner-road-center" />
            </div>
          </div>

          <div className="runner-horizon-glow" />
          <div className="runner-hero-fade" />
          <div className="runner-scanlines" />

          {/* Integrated logo lockup */}
          <div className="runner-logo-wrap">
            <div className="runner-logo-glow" />
            <img
              className="runner-logo-lockup"
              src={RUNNER_SPRITES.runnerLogoLockup}
              alt="STREEX Runner"
            />
          </div>
        </div>

        {/* ─── Content ─────────────────────────────── */}
        <div className="runner-content">
          <div className="runner-copy">
            <span className="runner-eyebrow">Welcome Aboard</span>
            <h1 className="runner-headline">
              Ready to Ride
              <br />
              Elevated?
            </h1>
            <p className="runner-sub">
              A premium ride challenge built for the Streex world. Avoid, collect, survive,
              and see how far the road takes you.
            </p>
          </div>

          <div className="runner-ctas">
            <button className="runner-primary-button" onClick={onPlay}>
              <span className="runner-primary-glow" aria-hidden="true" />
              <span className="runner-primary-label">
                PLAY
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            <button className="runner-ghost-button" onClick={onBack}>
              Discover Streex
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .runner-shell {
          min-height: 100vh;
          background: #050505;
          color: ${RUNNER_COLORS.white};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
        }

        .runner-frame {
          position: relative;
          width: min(100%, 430px);
          min-height: min(860px, calc(100vh - 32px));
          display: flex;
          flex-direction: column;
          background: ${RUNNER_COLORS.black};
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 36px;
          overflow: hidden;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(230,206,32,0.04);
        }

        /* ─── Hero ─────────────────────────────────── */
        .runner-hero {
          position: relative;
          flex: 0 0 58%;
          width: 100%;
          overflow: hidden;
        }

        .runner-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 40%, rgba(230,206,32,0.10), transparent 55%),
            linear-gradient(180deg, #050505 0%, #0b0b0b 55%, #1a1a10 100%);
        }

        .runner-horizon {
          position: absolute;
          left: 50%;
          top: 12%;
          width: 150%;
          height: 56%;
          object-fit: cover;
          transform: translateX(-50%);
          opacity: 0.35;
          filter: saturate(0.7) contrast(1.05) brightness(0.55);
          mask-image: linear-gradient(180deg, transparent 0%, #000 35%, #000 70%, transparent 100%);
        }

        .runner-mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 38%;
          height: 90px;
          opacity: 0.45;
          clip-path: polygon(0% 100%, 8% 55%, 18% 80%, 28% 35%, 40% 70%, 52% 25%, 64% 65%, 76% 40%, 88% 75%, 100% 50%, 100% 100%);
          background: linear-gradient(to top, #000 30%, transparent 100%);
        }

        /* Perspective road */
        .runner-road-stage {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          perspective: 800px;
          overflow: hidden;
        }

        .runner-road {
          position: absolute;
          bottom: -10%;
          width: 420px;
          height: 100%;
          transform-origin: 50% 100%;
          transform: rotateX(74deg);
          background: linear-gradient(to top, #16170f 0%, rgba(20,20,20,0.0) 70%);
        }

        .runner-road-side {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          background: rgba(120,120,110,0.35);
        }
        .runner-road-side-left { left: 14px; }
        .runner-road-side-right { right: 14px; }

        .runner-road-center {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 6px;
          transform: translateX(-50%);
          background: repeating-linear-gradient(
            to bottom,
            ${RUNNER_COLORS.yellow} 0px,
            ${RUNNER_COLORS.yellow} 70px,
            transparent 70px,
            transparent 150px
          );
          box-shadow: 0 0 20px rgba(230,206,32,0.55);
          animation: runner-road-flow 2.2s linear infinite;
        }

        @keyframes runner-road-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 220px; }
        }

        .runner-horizon-glow {
          position: absolute;
          left: 50%;
          bottom: -30px;
          width: 280px;
          height: 140px;
          transform: translateX(-50%);
          background: rgba(230,206,32,0.18);
          filter: blur(70px);
          border-radius: 999px;
          pointer-events: none;
          animation: runner-glow-pulse 4.5s ease-in-out infinite;
        }

        @keyframes runner-glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .runner-hero-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 55%,
            rgba(11,11,11,0.6) 78%,
            ${RUNNER_COLORS.black} 100%
          );
          pointer-events: none;
        }

        .runner-scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background: repeating-linear-gradient(
            0deg,
            #fff 0px,
            #fff 1px,
            transparent 1px,
            transparent 3px
          );
        }

        /* ─── Logo Lockup ───────────────────────────── */
        .runner-logo-wrap {
          position: absolute;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .runner-logo-glow {
          position: absolute;
          inset: -20px;
          background: rgba(230,206,32,0.25);
          filter: blur(36px);
          border-radius: 999px;
          pointer-events: none;
        }

        .runner-logo-lockup {
          position: relative;
          width: 220px;
          height: auto;
          display: block;
          filter: drop-shadow(0 0 18px rgba(230,206,32,0.45));
        }

        /* ─── Content ───────────────────────────────── */
        .runner-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 32px 36px;
          background: ${RUNNER_COLORS.black};
          position: relative;
          z-index: 5;
        }

        .runner-copy {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .runner-eyebrow {
          color: ${RUNNER_COLORS.yellow};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          margin-bottom: 14px;
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace;
        }

        .runner-headline {
          margin: 0;
          font-size: 34px;
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: ${RUNNER_COLORS.white};
          max-width: 320px;
        }

        .runner-sub {
          margin: 16px 0 0;
          max-width: 300px;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          line-height: 1.65;
        }

        .runner-ctas {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
        }

        .runner-primary-button {
          position: relative;
          width: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .runner-primary-glow {
          position: absolute;
          inset: 0;
          background: ${RUNNER_COLORS.yellow};
          filter: blur(22px);
          opacity: 0.35;
          border-radius: 18px;
          transition: opacity 0.4s ease;
        }
        .runner-primary-button:hover .runner-primary-glow { opacity: 0.55; }

        .runner-primary-label {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 56px;
          border-radius: 16px;
          background: ${RUNNER_COLORS.yellow};
          color: ${RUNNER_COLORS.black};
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          transition: transform 0.15s ease;
        }
        .runner-primary-button:active .runner-primary-label {
          transform: scale(0.98);
        }
        .runner-primary-label svg {
          width: 18px;
          height: 18px;
          transition: transform 0.25s ease;
        }
        .runner-primary-button:hover .runner-primary-label svg {
          transform: translateX(3px);
        }

        .runner-ghost-button {
          width: 100%;
          min-height: 50px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.7);
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .runner-ghost-button:hover {
          background: rgba(255,255,255,0.06);
          color: ${RUNNER_COLORS.white};
        }
      `}</style>
    </section>
  );
}
