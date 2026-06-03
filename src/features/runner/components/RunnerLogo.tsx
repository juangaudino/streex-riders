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
      <div className="runner-official-logo-crop" aria-hidden="true" />
      <span className="sr-only">STREEX Runner</span>
      <style>{`
        .runner-official-logo {
          width: min(74vw, 286px);
          aspect-ratio: 3.3 / 1;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          filter:
            drop-shadow(0 0 18px rgba(230,206,32,0.24))
            drop-shadow(0 0 38px rgba(230,206,32,0.12));
        }

        .runner-official-logo-compact {
          width: min(58vw, 226px);
        }

        .runner-official-logo-crop {
          position: absolute;
          left: 50%;
          top: 0;
          width: 100%;
          height: 100%;
          transform: translateX(-50%);
          background-image: url(${RUNNER_SPRITES.scoreCardFrame});
          background-repeat: no-repeat;
          background-size: 185% auto;
          background-position: center 3.7%;
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
