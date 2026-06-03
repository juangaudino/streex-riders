import { RUNNER_COLORS } from "../runner.config";
import { RUNNER_SPRITES } from "../assets/manifest";
import { RunnerLogo } from "./RunnerLogo";

type RunnerIntroProps = {
  onPlay: () => void;
  onBack: () => void;
};

export function RunnerIntro({ onPlay, onBack }: RunnerIntroProps) {
  return (
    <section className="runner-shell">
      <div className="runner-frame">
        <div className="runner-logo-bar">
          <div className="runner-logo-mark">
            <RunnerLogo />
          </div>
        </div>

        {/* ─── Cinematic Hero ─────────────────────── */}
        <div className="runner-hero" aria-hidden="true">
          <div className="runner-sky" />
          <div className="runner-stars" />
          <img className="runner-horizon" src={RUNNER_SPRITES.horizonGroundBlend2} alt="" />
          <div className="runner-mountains runner-mountains-far" />
          <div className="runner-mountains runner-mountains-near" />
          <div className="runner-horizon-lights" />

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

          {/* Corner checker accents */}
          <span className="runner-checker runner-checker-bl" aria-hidden="true" />
          <span className="runner-checker runner-checker-br" aria-hidden="true" />
        </div>

        {/* ─── Content ─────────────────────────────── */}
        <div className="runner-content">
          <div className="runner-copy">
            <span className="runner-eyebrow">Welcome Aboard</span>
            <h1 className="runner-headline">
              Private rides.
              <br />
              Elevated play.
            </h1>
            <p className="runner-sub">
              Quick ride.
              <br />
              Tough road.
              <br />
              Ride Elevated.
            </p>
          </div>

          <div className="runner-ctas">
            <button className="runner-primary-button" onClick={onPlay}>
              <span className="runner-primary-glow" aria-hidden="true" />
              <span className="runner-primary-label">PLAY</span>
            </button>
            <button className="runner-ghost-button" onClick={onBack}>
              Discover Streex
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .runner-shell {
          min-height: 100svh;
          background: #050505;
          color: ${RUNNER_COLORS.white};
          display: flex;
          align-items: center;
          justify-content: center;
          padding:
            max(8px, env(safe-area-inset-top))
            14px
            max(10px, calc(env(safe-area-inset-bottom) + 8px));
          overflow: auto;
          overscroll-behavior: none;
        }

        .runner-frame {
          position: relative;
          width: min(100%, 430px);
          height: min(790px, calc(100svh - max(18px, env(safe-area-inset-top)) - max(22px, env(safe-area-inset-bottom))));
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: ${RUNNER_COLORS.black};
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: clamp(22px, 7vw, 36px);
          overflow: hidden;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(230,206,32,0.04);
        }

        .runner-logo-bar {
          position: relative;
          z-index: 6;
          display: flex;
          justify-content: center;
          padding: clamp(8px, 1.8svh, 16px) 18px clamp(4px, 1svh, 8px);
        }

        .runner-logo-mark {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: clamp(56px, 8svh, 76px);
          padding: 0;
        }

        /* ─── Hero ─────────────────────────────────── */
        .runner-hero {
          position: relative;
          flex: 1 1 auto;
          min-height: 210px;
          width: 100%;
          overflow: hidden;
        }

        .runner-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 62%, rgba(230,206,32,0.18), transparent 48%),
            radial-gradient(ellipse at 50% 95%, rgba(230,206,32,0.14), transparent 38%),
            linear-gradient(180deg, #02030a 0%, #07080d 45%, #0d0d09 78%, #181508 100%);
        }

        .runner-stars {
          position: absolute;
          inset: 0 0 60% 0;
          background-image:
            radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.6), transparent 50%),
            radial-gradient(1px 1px at 28% 14%, rgba(255,255,255,0.45), transparent 50%),
            radial-gradient(1px 1px at 42% 30%, rgba(255,255,255,0.7), transparent 50%),
            radial-gradient(1px 1px at 58% 18%, rgba(255,255,255,0.4), transparent 50%),
            radial-gradient(1px 1px at 72% 26%, rgba(255,255,255,0.55), transparent 50%),
            radial-gradient(1px 1px at 84% 12%, rgba(255,255,255,0.5), transparent 50%),
            radial-gradient(1px 1px at 92% 34%, rgba(255,255,255,0.6), transparent 50%),
            radial-gradient(1px 1px at 20% 38%, rgba(255,255,255,0.35), transparent 50%);
          opacity: 0.6;
        }

        .runner-horizon {
          position: absolute;
          left: 50%;
          top: 18%;
          width: 170%;
          height: 62%;
          object-fit: cover;
          transform: translateX(-50%);
          opacity: 0.55;
          filter: saturate(0.55) contrast(1.2) brightness(0.5) hue-rotate(-8deg);
          mask-image: linear-gradient(180deg, transparent 0%, #000 28%, #000 72%, transparent 100%);
          mix-blend-mode: screen;
        }

        .runner-mountains {
          position: absolute;
          left: -4%;
          right: -4%;
          pointer-events: none;
        }
        .runner-mountains-far {
          bottom: 42%;
          height: 110px;
          opacity: 0.85;
          background: linear-gradient(to top, #0a0a0a 60%, #15170f 100%);
          clip-path: polygon(0% 100%, 6% 62%, 14% 78%, 22% 48%, 32% 70%, 42% 38%, 52% 62%, 62% 40%, 72% 66%, 82% 44%, 92% 70%, 100% 56%, 100% 100%);
          filter: drop-shadow(0 -2px 8px rgba(230,206,32,0.12));
        }
        .runner-mountains-near {
          bottom: 36%;
          height: 78px;
          opacity: 1;
          background: linear-gradient(to top, #000 40%, #0a0a0a 100%);
          clip-path: polygon(0% 100%, 10% 50%, 20% 76%, 30% 32%, 40% 64%, 50% 20%, 60% 60%, 70% 36%, 80% 70%, 90% 48%, 100% 64%, 100% 100%);
        }

        .runner-horizon-lights {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 38%;
          height: 6px;
          background:
            radial-gradient(2px 2px at 14% 50%, ${RUNNER_COLORS.yellow}, transparent 60%),
            radial-gradient(2px 2px at 26% 50%, rgba(230,206,32,0.7), transparent 60%),
            radial-gradient(2px 2px at 38% 50%, ${RUNNER_COLORS.yellow}, transparent 60%),
            radial-gradient(2px 2px at 49% 50%, rgba(255,236,140,1), transparent 60%),
            radial-gradient(2px 2px at 51% 50%, rgba(255,236,140,1), transparent 60%),
            radial-gradient(2px 2px at 62% 50%, ${RUNNER_COLORS.yellow}, transparent 60%),
            radial-gradient(2px 2px at 74% 50%, rgba(230,206,32,0.7), transparent 60%),
            radial-gradient(2px 2px at 86% 50%, ${RUNNER_COLORS.yellow}, transparent 60%);
          filter: drop-shadow(0 0 8px rgba(230,206,32,0.7));
        }

        /* Perspective road */
        .runner-road-stage {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          perspective: 700px;
          overflow: hidden;
        }

        .runner-road {
          position: absolute;
          bottom: -14%;
          width: 520px;
          height: 100%;
          transform-origin: 50% 100%;
          transform: rotateX(76deg);
          background:
            radial-gradient(ellipse at 50% 0%, rgba(230,206,32,0.18), transparent 35%),
            linear-gradient(to top, #1a1b14 0%, #0e0f0a 55%, rgba(20,20,20,0) 78%);
        }

        .runner-road-side {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to top, rgba(230,206,32,0.55), rgba(230,206,32,0));
          box-shadow: 0 0 12px rgba(230,206,32,0.35);
        }
        .runner-road-side-left { left: 10px; }
        .runner-road-side-right { right: 10px; }

        .runner-road-center {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 8px;
          transform: translateX(-50%);
          background: repeating-linear-gradient(
            to bottom,
            ${RUNNER_COLORS.yellow} 0px,
            ${RUNNER_COLORS.yellow} 60px,
            transparent 60px,
            transparent 130px
          );
          box-shadow: 0 0 28px rgba(230,206,32,0.75);
          animation: runner-road-flow 1.8s linear infinite;
        }

        @keyframes runner-road-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 190px; }
        }

        .runner-horizon-glow {
          position: absolute;
          left: 50%;
          bottom: 28%;
          width: 320px;
          height: 140px;
          transform: translateX(-50%);
          background: rgba(230,206,32,0.32);
          filter: blur(60px);
          border-radius: 999px;
          pointer-events: none;
          animation: runner-glow-pulse 4.5s ease-in-out infinite;
        }

        @keyframes runner-glow-pulse {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }

        .runner-hero-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(11,11,11,0.5) 75%,
            ${RUNNER_COLORS.black} 100%
          );
          pointer-events: none;
        }

        .runner-scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          background: repeating-linear-gradient(
            0deg,
            #fff 0px,
            #fff 1px,
            transparent 1px,
            transparent 3px
          );
        }

        /* Checker corner accents */
        .runner-checker {
          position: absolute;
          bottom: 10px;
          width: 56px;
          height: 18px;
          background-image:
            linear-gradient(45deg, ${RUNNER_COLORS.yellow} 25%, transparent 25%, transparent 75%, ${RUNNER_COLORS.yellow} 75%),
            linear-gradient(45deg, ${RUNNER_COLORS.yellow} 25%, transparent 25%, transparent 75%, ${RUNNER_COLORS.yellow} 75%);
          background-size: 9px 9px;
          background-position: 0 0, 4.5px 4.5px;
          opacity: 0.85;
          pointer-events: none;
        }
        .runner-checker-bl { left: 10px; }
        .runner-checker-br { right: 10px; }

        /* ─── Content ───────────────────────────────── */
        .runner-content {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding:
            clamp(12px, 2svh, 18px)
            clamp(22px, 7vw, 32px)
            clamp(14px, 2.2svh, 22px);
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
          margin-bottom: clamp(8px, 1.5svh, 12px);
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace;
        }

        .runner-headline {
          margin: 0;
          font-size: clamp(24px, 6.8vw, 30px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: 0;
          color: ${RUNNER_COLORS.white};
          max-width: 320px;
        }

        .runner-sub {
          margin: clamp(10px, 1.8svh, 14px) 0 0;
          max-width: 280px;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          line-height: 1.45;
        }

        .runner-ctas {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: clamp(12px, 2svh, 18px);
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
          filter: blur(26px);
          opacity: 0.45;
          border-radius: 14px;
          transition: opacity 0.4s ease;
        }
        .runner-primary-button:hover .runner-primary-glow { opacity: 0.65; }

        .runner-primary-label {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: clamp(44px, 6svh, 50px);
          border-radius: 12px;
          background: ${RUNNER_COLORS.yellow};
          color: ${RUNNER_COLORS.black};
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          transition: transform 0.15s ease;
        }
        .runner-primary-button:active .runner-primary-label {
          transform: scale(0.98);
        }

        .runner-ghost-button {
          width: 100%;
          min-height: clamp(40px, 5.6svh, 46px);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.78);
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

        @supports (height: 100dvh) {
          .runner-shell {
            min-height: 100dvh;
          }

          .runner-frame {
            height: min(790px, calc(100dvh - max(18px, env(safe-area-inset-top)) - max(22px, env(safe-area-inset-bottom))));
          }
        }

        @media (max-height: 720px) {
          .runner-logo-lockup {
            width: min(74%, 246px);
          }

          .runner-hero {
            min-height: 190px;
          }

          .runner-sub {
            max-width: 250px;
          }
        }

        @media (max-height: 640px) {
          .runner-logo-bar {
            padding-top: 6px;
            padding-bottom: 4px;
          }

          .runner-logo-lockup {
            width: min(68%, 210px);
          }

          .runner-hero {
            min-height: 150px;
          }

          .runner-eyebrow {
            font-size: 9px;
          }

          .runner-sub {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
