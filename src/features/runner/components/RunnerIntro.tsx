import { RUNNER_COLORS } from "../runner.config";

type RunnerIntroProps = {
  onPlay: () => void;
  onBack: () => void;
};

export function RunnerIntro({ onPlay, onBack }: RunnerIntroProps) {
  return (
    <section className="runner-shell">
      <div className="runner-intro">
        <div className="runner-world-preview" aria-hidden="true">
          <div className="runner-pixel-sky" />
          <div className="runner-pixel-mountains" />
          <div className="runner-pixel-road" />
          <div className="runner-pixel-rav4">STREEX</div>
        </div>

        <div className="runner-lockup">
          <span>STREEX</span>
          <strong>RUNNER</strong>
        </div>

        <h1>Welcome Aboard</h1>
        <p>
          A premium ride challenge built for the Streex world. Avoid, collect, survive, and see how
          far the road takes you.
        </p>

        <button className="runner-primary-button" onClick={onPlay}>
          PLAY
        </button>
        <button className="runner-ghost-button" onClick={onBack}>
          Back to Streex
        </button>
      </div>

      <style>{`
        .runner-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% 18%, rgba(230,206,32,0.13), transparent 34%),
            linear-gradient(180deg, #141414 0%, ${RUNNER_COLORS.black} 56%, #050505 100%);
          color: ${RUNNER_COLORS.white};
          display: grid;
          place-items: center;
          padding: 26px;
          overflow: hidden;
        }

        .runner-intro {
          width: min(100%, 430px);
          min-height: min(760px, calc(100vh - 52px));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .runner-world-preview {
          position: relative;
          width: min(100%, 330px);
          aspect-ratio: 1.15;
          overflow: hidden;
          border: 1px solid rgba(230,206,32,0.22);
          border-radius: 8px;
          background: #0e0e0e;
          box-shadow: 0 0 40px rgba(230,206,32,0.1);
          image-rendering: pixelated;
        }

        .runner-pixel-sky {
          position: absolute;
          inset: 0 0 42%;
          background:
            linear-gradient(180deg, #20291f, #151a16),
            repeating-linear-gradient(90deg, transparent 0 7px, rgba(255,255,255,0.04) 7px 8px);
        }

        .runner-pixel-mountains {
          position: absolute;
          left: 0;
          right: 0;
          top: 31%;
          height: 22%;
          background:
            linear-gradient(135deg, transparent 0 18%, #363a2f 18% 34%, transparent 34%),
            linear-gradient(225deg, transparent 0 24%, #24291f 24% 48%, transparent 48%),
            linear-gradient(135deg, transparent 0 54%, #3d4235 54% 72%, transparent 72%);
          opacity: 0.95;
        }

        .runner-pixel-road {
          position: absolute;
          inset: 45% 7% 0;
          clip-path: polygon(39% 0, 61% 0, 100% 100%, 0 100%);
          background:
            linear-gradient(90deg, transparent 48%, rgba(230,206,32,0.42) 48% 52%, transparent 52%),
            repeating-linear-gradient(180deg, rgba(255,255,255,0.14) 0 8px, transparent 8px 28px),
            linear-gradient(180deg, #23231e, #11110f);
        }

        .runner-pixel-rav4 {
          position: absolute;
          left: 50%;
          bottom: 16%;
          transform: translateX(-50%);
          width: 86px;
          height: 48px;
          display: grid;
          place-items: center;
          color: ${RUNNER_COLORS.black};
          background: linear-gradient(180deg, #f0f0ed, #a8aba6);
          border: 3px solid #73766f;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          box-shadow: 0 12px 28px rgba(0,0,0,0.5);
        }

        .runner-lockup {
          margin-top: 28px;
          display: grid;
          gap: 2px;
          letter-spacing: 0.2em;
          line-height: 0.95;
        }

        .runner-lockup span {
          color: ${RUNNER_COLORS.white};
          font-size: 13px;
          font-weight: 700;
        }

        .runner-lockup strong {
          color: ${RUNNER_COLORS.yellow};
          font-size: 34px;
          font-weight: 900;
        }

        .runner-intro h1 {
          margin: 24px 0 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .runner-intro p {
          margin: 12px 0 28px;
          max-width: 320px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          line-height: 1.65;
        }

        .runner-primary-button,
        .runner-ghost-button {
          width: min(100%, 292px);
          min-height: 52px;
          border-radius: 8px;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: 0.14em;
          cursor: pointer;
        }

        .runner-primary-button {
          border: 0;
          color: ${RUNNER_COLORS.black};
          background: ${RUNNER_COLORS.yellow};
          box-shadow: 0 0 28px rgba(230,206,32,0.28);
        }

        .runner-ghost-button {
          margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          color: ${RUNNER_COLORS.white};
          background: rgba(255,255,255,0.04);
          font-size: 12px;
          letter-spacing: 0.08em;
        }
      `}</style>
    </section>
  );
}
