import { RUNNER_SPRITES } from "../assets/manifest";

type RunnerLogoProps = {
  className?: string;
  compact?: boolean;
};

export function RunnerLogo({ className = "", compact = false }: RunnerLogoProps) {
  return (
    <div
      className={`runner-official-logo ${compact ? "runner-official-logo-compact" : ""} ${className}`}
    >
      <img className="runner-official-logo-image" src={RUNNER_SPRITES.runnerLogoOfficial} alt="" />
      <span className="sr-only">STREEX Runner</span>
      <style>{`
        .runner-official-logo {
          width: min(78vw, 320px);
          aspect-ratio: 3.6 / 1;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          filter:
            drop-shadow(0 0 18px rgba(230,206,32,0.24))
            drop-shadow(0 0 38px rgba(230,206,32,0.12));
        }

        .runner-official-logo-compact {
          width: min(64vw, 250px);
        }

        .runner-official-logo-image {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 148%;
          height: auto;
          transform: translate(-50%, -50%);
          display: block;
          pointer-events: none;
          user-select: none;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
