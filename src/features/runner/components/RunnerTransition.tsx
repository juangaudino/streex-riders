import { RUNNER_SPRITES } from "../assets/manifest";

export function RunnerTransition() {
  return (
    <div className="runner-transition" aria-label="Entering STREEX Runner">
      <div className="runner-transition-scene" aria-hidden="true">
        <img
          className="runner-transition-horizon"
          src={RUNNER_SPRITES.horizonGroundBlend2}
          alt=""
        />
        <div className="runner-transition-road" />
        <div className="runner-transition-car" />
        <div className="runner-transition-pixels" />
      </div>
      <div className="runner-transition-content">
        <img src={RUNNER_SPRITES.runnerLogoLockup} alt="STREEX Runner" />
        <span>Preparing Your Ride</span>
        <div className="runner-transition-loader" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <style>{`
        .runner-transition {
          min-height: 100vh;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          color: white;
          background:
            radial-gradient(circle at 50% 46%, rgba(230,206,32,0.16), transparent 34%),
            linear-gradient(180deg, #151711 0%, #060606 78%),
            #0b0b0b;
          animation: runnerPixelReveal 620ms ease both;
        }

        .runner-transition-scene {
          position: absolute;
          inset: 0;
          opacity: 0.82;
        }

        .runner-transition-horizon {
          position: absolute;
          left: 50%;
          top: 10%;
          width: min(150vw, 660px);
          height: 45vh;
          object-fit: cover;
          transform: translateX(-50%);
          filter: saturate(0.82) contrast(1.1) brightness(0.58);
          opacity: 0.5;
        }

        .runner-transition-road {
          position: absolute;
          left: 50%;
          bottom: -3%;
          width: min(108vw, 480px);
          height: 72vh;
          transform: translateX(-50%);
          clip-path: polygon(43% 0, 57% 0, 96% 100%, 4% 100%);
          background:
            repeating-linear-gradient(180deg, rgba(230,206,32,0.24) 0 10px, transparent 10px 34px),
            linear-gradient(90deg, transparent 32%, rgba(255,255,255,0.1) 32.4%, transparent 33%, transparent 67%, rgba(255,255,255,0.1) 67.6%, transparent 68%),
            linear-gradient(180deg, #3d423d, #111 78%);
          box-shadow: inset 0 0 50px rgba(0,0,0,0.74);
        }

        .runner-transition-car {
          position: absolute;
          left: 50%;
          bottom: 24%;
          width: 78px;
          height: 38px;
          transform: translateX(-50%);
          border: 1px solid rgba(255,255,255,0.42);
          border-radius: 8px 8px 5px 5px;
          background: linear-gradient(180deg, #d8d8d4, #5e635f);
          box-shadow:
            0 18px 34px rgba(0,0,0,0.5),
            0 0 28px rgba(230,206,32,0.18);
        }

        .runner-transition-pixels {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 9px),
            radial-gradient(circle at 50% 68%, rgba(230,206,32,0.24), transparent 28%);
          opacity: 0.6;
        }

        .runner-transition-content {
          position: relative;
          z-index: 1;
          display: grid;
          justify-items: center;
          gap: 18px;
          text-align: center;
        }

        .runner-transition-content img {
          width: min(78vw, 280px);
          filter: drop-shadow(0 0 24px rgba(230,206,32,0.18));
        }

        .runner-transition-content span {
          color: #e6ce20;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }

        .runner-transition-loader {
          width: min(78vw, 270px);
          height: 28px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          border: 1px solid rgba(230,206,32,0.34);
          border-radius: 999px;
          padding: 6px;
          background: rgba(11,11,11,0.72);
        }

        .runner-transition-loader i {
          border-radius: 2px;
          background: #e6ce20;
          opacity: 0.26;
          animation: runnerLoadBars 620ms ease infinite alternate;
        }

        .runner-transition-loader i:nth-child(2) { animation-delay: 60ms; }
        .runner-transition-loader i:nth-child(3) { animation-delay: 120ms; }
        .runner-transition-loader i:nth-child(4) { animation-delay: 180ms; }
        .runner-transition-loader i:nth-child(5) { animation-delay: 240ms; }
        .runner-transition-loader i:nth-child(6) { animation-delay: 300ms; }
        .runner-transition-loader i:nth-child(7) { animation-delay: 360ms; }

        @keyframes runnerLoadBars {
          to { opacity: 1; box-shadow: 0 0 14px rgba(230,206,32,0.42); }
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
