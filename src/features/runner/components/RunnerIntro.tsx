import { RUNNER_COLORS } from "../runner.config";
import { RUNNER_SPRITES } from "../assets/manifest";

type RunnerIntroProps = {
  onPlay: () => void;
  onBack: () => void;
};

export function RunnerIntro({ onPlay, onBack }: RunnerIntroProps) {
  return (
    <section className="runner-shell">
      <div className="runner-intro">
        <div className="runner-world-preview" aria-hidden="true">
          <img className="runner-preview-horizon" src={RUNNER_SPRITES.horizonGroundBlend2} alt="" />
          <div className="runner-preview-road" />
          <div className="runner-preview-pixels" />
          <div className="runner-preview-beacon" />
        </div>

        <img
          className="runner-logo-lockup"
          src={RUNNER_SPRITES.runnerLogoLockup}
          alt="STREEX Runner"
        />

        <span className="runner-intro-eyebrow">Welcome Aboard</span>
        <h1>Ready to Ride Elevated?</h1>
        <p>
          A premium ride challenge built for the Streex world. Avoid, collect, survive, and see how
          far the road takes you.
        </p>

        <button className="runner-primary-button" onClick={onPlay}>
          PLAY
        </button>
        <button className="runner-ghost-button" onClick={onBack}>
          Discover Streex
        </button>
      </div>

      <style>{`
        .runner-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% 12%, rgba(230,206,32,0.16), transparent 30%),
            radial-gradient(circle at 50% 82%, rgba(230,206,32,0.08), transparent 34%),
            linear-gradient(180deg, #151711 0%, ${RUNNER_COLORS.black} 54%, #050505 100%);
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
          width: min(100%, 338px);
          aspect-ratio: 1.05;
          overflow: hidden;
          border: 1px solid rgba(230,206,32,0.22);
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 52%, rgba(230,206,32,0.18), transparent 38%),
            linear-gradient(180deg, #161a15 0%, #090909 100%);
          box-shadow:
            0 0 48px rgba(230,206,32,0.12),
            inset 0 0 34px rgba(0,0,0,0.56);
        }

        .runner-preview-horizon {
          position: absolute;
          left: 50%;
          top: 2%;
          width: 142%;
          height: 72%;
          object-fit: cover;
          transform: translateX(-50%);
          opacity: 0.46;
          filter: saturate(0.82) contrast(1.08) brightness(0.72);
        }

        .runner-preview-road {
          position: absolute;
          inset: 34% 5% -1%;
          clip-path: polygon(42% 0, 58% 0, 96% 100%, 4% 100%);
          background:
            repeating-linear-gradient(180deg, rgba(255,255,255,0.16) 0 8px, transparent 8px 34px),
            linear-gradient(90deg, transparent 33%, rgba(255,255,255,0.12) 33.4%, transparent 34%, transparent 66%, rgba(255,255,255,0.12) 66.6%, transparent 67%),
            linear-gradient(180deg, #4b504a, #1c1f1d 72%, #111);
          box-shadow: inset 0 14px 26px rgba(230,206,32,0.08);
        }

        .runner-preview-pixels {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 8px),
            radial-gradient(circle at 50% 88%, rgba(230,206,32,0.18), transparent 34%);
          opacity: 0.62;
        }

        .runner-preview-beacon {
          position: absolute;
          left: 50%;
          bottom: 17%;
          transform: translateX(-50%);
          width: 56px;
          height: 14px;
          border: 1px solid rgba(230,206,32,0.5);
          border-radius: 999px;
          background: rgba(230,206,32,0.12);
          box-shadow: 0 0 30px rgba(230,206,32,0.4);
        }

        .runner-logo-lockup {
          width: min(86%, 320px);
          margin-top: 22px;
          display: block;
          filter: drop-shadow(0 0 22px rgba(230,206,32,0.16));
        }

        .runner-intro h1 {
          margin: 8px 0 0;
          max-width: 300px;
          font-size: 30px;
          line-height: 1.12;
          font-weight: 800;
          letter-spacing: 0;
        }

        .runner-intro-eyebrow {
          margin-top: 22px;
          color: ${RUNNER_COLORS.yellow};
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .runner-intro p {
          margin: 10px 0 26px;
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
