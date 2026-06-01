import { RUNNER_SPRITES } from "../assets/manifest";

export function RunnerTransition() {
  return (
    <div className="runner-transition" aria-label="Entering STREEX Runner">
      <div className="runner-transition-scene" aria-hidden="true">
        <div className="runner-transition-sky" />
        <div className="runner-transition-stars" />
        <img
          className="runner-transition-horizon"
          src={RUNNER_SPRITES.horizonGroundBlend2}
          alt=""
        />
        <div className="runner-transition-mountains-far" />
        <div className="runner-transition-mountains-near" />
        <div className="runner-transition-horizon-lights" />
        <div className="runner-transition-horizon-glow" />
        <div className="runner-transition-road" />
        <img
          className="runner-transition-car"
          src={RUNNER_SPRITES.playerRav4Rear}
          alt=""
        />
        <div className="runner-transition-car-glow" aria-hidden="true" />
        <div className="runner-transition-pixels" />
        <div className="runner-transition-fade" />
      </div>

      {/* Logo badge top */}
      <div className="runner-transition-logo">
        <span className="runner-transition-wing runner-transition-wing-l" aria-hidden="true" />
        <img src={RUNNER_SPRITES.runnerLogoLockup} alt="STREEX Runner" />
        <span className="runner-transition-wing runner-transition-wing-r" aria-hidden="true" />
      </div>

      <div className="runner-transition-content">
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
        <p className="runner-transition-tag">Loading…</p>
        <p className="runner-transition-rider">· STREEX RIDER ·</p>
      </div>
      <style>{`
        .runner-transition {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: white;
          background: #050505;
          animation: runnerPixelReveal 620ms ease both;
        }

        .runner-transition-scene {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .runner-transition-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 55%, rgba(230,206,32,0.22), transparent 42%),
            radial-gradient(ellipse at 50% 85%, rgba(230,206,32,0.16), transparent 40%),
            linear-gradient(180deg, #02030a 0%, #07080d 40%, #100f08 72%, #1a1606 100%);
        }

        .runner-transition-stars {
          position: absolute;
          inset: 0 0 55% 0;
          background-image:
            radial-gradient(1px 1px at 8% 18%, rgba(255,255,255,0.7), transparent 50%),
            radial-gradient(1px 1px at 24% 10%, rgba(255,255,255,0.5), transparent 50%),
            radial-gradient(1px 1px at 36% 26%, rgba(255,255,255,0.75), transparent 50%),
            radial-gradient(1px 1px at 52% 14%, rgba(255,255,255,0.45), transparent 50%),
            radial-gradient(1px 1px at 68% 22%, rgba(255,255,255,0.6), transparent 50%),
            radial-gradient(1px 1px at 82% 8%, rgba(255,255,255,0.55), transparent 50%),
            radial-gradient(1px 1px at 92% 32%, rgba(255,255,255,0.65), transparent 50%);
          opacity: 0.55;
        }

        .runner-transition-horizon {
          position: absolute;
          left: 50%;
          top: 18%;
          width: min(180vw, 820px);
          height: 50vh;
          object-fit: cover;
          transform: translateX(-50%);
          filter: saturate(0.55) contrast(1.2) brightness(0.5) hue-rotate(-6deg);
          opacity: 0.55;
          mask-image: linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%);
          mix-blend-mode: screen;
        }

        .runner-transition-mountains-far,
        .runner-transition-mountains-near {
          position: absolute;
          left: -4%;
          right: -4%;
          pointer-events: none;
        }
        .runner-transition-mountains-far {
          bottom: 44%;
          height: 130px;
          opacity: 0.9;
          background: linear-gradient(to top, #0a0a0a 60%, #15170f 100%);
          clip-path: polygon(0% 100%, 6% 64%, 14% 78%, 22% 48%, 32% 72%, 42% 36%, 52% 64%, 62% 40%, 72% 68%, 82% 44%, 92% 72%, 100% 56%, 100% 100%);
        }
        .runner-transition-mountains-near {
          bottom: 38%;
          height: 90px;
          opacity: 1;
          background: linear-gradient(to top, #000 40%, #0a0a0a 100%);
          clip-path: polygon(0% 100%, 10% 50%, 20% 76%, 30% 30%, 40% 64%, 50% 18%, 60% 60%, 70% 34%, 80% 70%, 90% 48%, 100% 64%, 100% 100%);
        }

        .runner-transition-horizon-lights {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 40%;
          height: 5px;
          background:
            radial-gradient(2px 2px at 14% 50%, #e6ce20, transparent 60%),
            radial-gradient(2px 2px at 28% 50%, rgba(230,206,32,0.7), transparent 60%),
            radial-gradient(2px 2px at 42% 50%, #e6ce20, transparent 60%),
            radial-gradient(3px 3px at 50% 50%, #ffec8c, transparent 60%),
            radial-gradient(2px 2px at 58% 50%, #e6ce20, transparent 60%),
            radial-gradient(2px 2px at 72% 50%, rgba(230,206,32,0.7), transparent 60%),
            radial-gradient(2px 2px at 86% 50%, #e6ce20, transparent 60%);
          filter: drop-shadow(0 0 10px rgba(230,206,32,0.7));
        }

        .runner-transition-horizon-glow {
          position: absolute;
          left: 50%;
          bottom: 30%;
          width: 360px;
          height: 160px;
          transform: translateX(-50%);
          background: rgba(230,206,32,0.32);
          filter: blur(70px);
          border-radius: 999px;
          pointer-events: none;
        }

        .runner-transition-road {
          position: absolute;
          left: 50%;
          bottom: -8%;
          width: min(120vw, 560px);
          height: 68vh;
          transform: translateX(-50%);
          clip-path: polygon(46% 0, 54% 0, 96% 100%, 4% 100%);
          background:
            repeating-linear-gradient(180deg, rgba(230,206,32,0.55) 0 14px, transparent 14px 42px),
            linear-gradient(90deg, transparent 30%, rgba(230,206,32,0.18) 30.3%, transparent 31%, transparent 69%, rgba(230,206,32,0.18) 69.6%, transparent 70%),
            linear-gradient(180deg, #2a2a22 0%, #14150f 60%, #050505 100%);
          box-shadow: inset 0 0 80px rgba(0,0,0,0.85);
          filter: drop-shadow(0 -10px 30px rgba(230,206,32,0.08));
        }

        .runner-transition-car {
          position: absolute;
          left: 50%;
          bottom: 16%;
          width: 130px;
          height: auto;
          transform: translateX(-50%);
          image-rendering: pixelated;
          filter: drop-shadow(0 18px 26px rgba(0,0,0,0.65)) drop-shadow(0 0 20px rgba(230,206,32,0.22));
          z-index: 2;
        }

        .runner-transition-car-glow {
          position: absolute;
          left: 50%;
          bottom: 14%;
          width: 180px;
          height: 30px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(255,80,40,0.45), transparent 70%);
          filter: blur(10px);
          pointer-events: none;
        }

        .runner-transition-pixels {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px);
          opacity: 0.5;
          pointer-events: none;
        }

        .runner-transition-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(5,5,5,0.55) 0%, transparent 22%, transparent 80%, rgba(5,5,5,0.8) 100%);
          pointer-events: none;
        }

        /* Logo badge top */
        .runner-transition-logo {
          position: absolute;
          top: 56px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 22px;
          border: 1.5px solid #e6ce20;
          border-radius: 14px;
          background: rgba(11,11,11,0.92);
          box-shadow:
            0 0 0 4px rgba(11,11,11,0.85),
            0 0 36px rgba(230,206,32,0.32),
            inset 0 0 18px rgba(230,206,32,0.08);
        }
        .runner-transition-logo img {
          width: 170px;
          height: auto;
          display: block;
          filter: none;
        }
        .runner-transition-wing {
          width: 28px;
          height: 14px;
          background: linear-gradient(90deg, transparent 0 6%, #e6ce20 6% 18%, transparent 18% 28%, #e6ce20 28% 46%, transparent 46% 58%, #e6ce20 58% 82%, transparent 82% 100%);
          opacity: 0.9;
        }
        .runner-transition-wing-l { transform: scaleX(-1); }

        .runner-transition-content {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 58px;
          z-index: 3;
          display: grid;
          justify-items: center;
          gap: 14px;
          text-align: center;
          padding: 0 24px;
        }

        .runner-transition-content span {
          color: rgba(255,255,255,0.92);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }

        .runner-transition-loader {
          width: min(78vw, 280px);
          height: 30px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          border: 1.5px solid rgba(230,206,32,0.7);
          border-radius: 6px;
          padding: 5px;
          background: rgba(11,11,11,0.72);
          box-shadow: 0 0 22px rgba(230,206,32,0.18);
        }

        .runner-transition-loader i {
          border-radius: 1px;
          background: #e6ce20;
          opacity: 0.3;
          animation: runnerLoadBars 620ms ease infinite alternate;
        }

        .runner-transition-loader i:nth-child(2) { animation-delay: 60ms; }
        .runner-transition-loader i:nth-child(3) { animation-delay: 120ms; }
        .runner-transition-loader i:nth-child(4) { animation-delay: 180ms; }
        .runner-transition-loader i:nth-child(5) { animation-delay: 240ms; }
        .runner-transition-loader i:nth-child(6) { animation-delay: 300ms; }
        .runner-transition-loader i:nth-child(7) { animation-delay: 360ms; }

        @keyframes runnerLoadBars {
          to { opacity: 1; box-shadow: 0 0 18px rgba(230,206,32,0.6); }
        }

        .runner-transition-tag {
          margin: 0;
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.36em;
          text-transform: uppercase;
        }
        .runner-transition-rider {
          margin: 4px 0 0;
          color: rgba(230,206,32,0.55);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.42em;
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
