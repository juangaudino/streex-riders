import { useMemo, useState } from "react";
import { CONFIG } from "@/config";
import { RUNNER_SPRITES } from "../assets/manifest";
import type { RunnerGameSnapshot } from "../runner.types";

type RunnerSavedScore = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

const RUNNER_SCORES_KEY = "streex_runner_scores_v1";

type RunnerResultsProps = {
  snapshot: RunnerGameSnapshot;
  onReplay: () => void;
  onBack: () => void;
};

export function RunnerResults({ snapshot, onReplay, onBack }: RunnerResultsProps) {
  const [riderName, setRiderName] = useState("");
  const [savedScores, setSavedScores] = useState<RunnerSavedScore[]>(() => loadSavedScores());
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save Card");
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState("Share Ride");
  const [shareFallback, setShareFallback] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const displayName = riderName.trim() || "Streex Rider";
  const visibleLeaderboard = useMemo(
    () => savedScores.slice().sort(sortScores).slice(0, 10),
    [savedScores],
  );
  const localRank = useMemo(() => {
    const allScores = [
      ...savedScores,
      {
        id: "current",
        name: displayName,
        score: snapshot.score,
        createdAt: new Date().toISOString(),
      },
    ]
      .slice()
      .sort(sortScores);
    return Math.max(1, allScores.findIndex((entry) => entry.id === "current") + 1);
  }, [displayName, savedScores, snapshot.score]);

  const handleSaveScore = () => {
    const name = displayName.slice(0, 24);
    const nextScore: RunnerSavedScore = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      name,
      score: snapshot.score,
      createdAt: new Date().toISOString(),
    };
    const nextScores = [...savedScores, nextScore].slice().sort(sortScores).slice(0, 25);
    localStorage.setItem(RUNNER_SCORES_KEY, JSON.stringify(nextScores));
    setSavedScores(nextScores);
    setScoreSaved(true);
  };

  const handleSaveCard = async () => {
    const canvas = await createRunnerScoreCard(snapshot, displayName, localRank);
    const filename = `streex-runner-${snapshot.score}.png`;

    try {
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSaveLabel("Saved");
      setSaveHint("Card sent to your browser Downloads.");
      window.setTimeout(() => setSaveLabel("Save Card"), 1400);
      window.setTimeout(() => setSaveHint(null), 3200);
    } catch {
      const opened = window.open(canvas.toDataURL("image/png"), "_blank", "noopener,noreferrer");
      setSaveLabel(opened ? "Opened" : "Open Blocked");
      setSaveHint(
        opened
          ? "Card opened in a new tab. Long-press or save the image."
          : "This browser blocked the card. Try Safari/Chrome for downloads.",
      );
      window.setTimeout(() => setSaveLabel("Save Card"), 1600);
      window.setTimeout(() => setSaveHint(null), 4200);
    }
  };

  const handleShareRide = async () => {
    const shareUrl = CONFIG.seoUrl || CONFIG.website;
    const text = `${displayName} scored ${snapshot.score} in STREEX Runner. Ranked #${localRank}. Above ${snapshot.aboveRiders} riders.`;
    const fallbackText = `${text}\n${shareUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "STREEX Runner",
          text,
          url: shareUrl,
        });
        return;
      }

      if (!navigator.clipboard) throw new Error("Clipboard is unavailable.");
      await navigator.clipboard.writeText(fallbackText);
      setShareLabel("Copied");
      setShareHint("Share text copied.");
      window.setTimeout(() => setShareLabel("Share Ride"), 1400);
      window.setTimeout(() => setShareHint(null), 2600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFallback(fallbackText);
      setShareLabel("Copy Below");
      setShareHint("This browser blocked native share. Select and copy the text below.");
      window.setTimeout(() => setShareLabel("Share Ride"), 1800);
    }
  };

  return (
    <section className="runner-results">
      <div className="runner-results-shell">
        <div className="runner-results-hero">
          <img src={RUNNER_SPRITES.runnerLogoLockup} alt="STREEX Runner" />
          <span>Ride Complete</span>
          <h1>{snapshot.crashKind ? "You made the road remember." : "Ride Elevated."}</h1>
        </div>

        <div
          className="runner-score-card"
          style={{ backgroundImage: `url(${RUNNER_SPRITES.scoreCardFrame})` }}
        >
          <div className="runner-card-atmosphere" />
          <div className="runner-card-body">
            <p>Your Score</p>
            <strong>{snapshot.score}</strong>
            <span>You ranked #{localRank}</span>
            <span>Above {snapshot.aboveRiders} riders</span>
          </div>
          <div className="runner-signature">
            <strong>Ride Elevated</strong>
            <span>
              {CONFIG.ownerName} · @{CONFIG.instagram} · {CONFIG.phoneDisplay}
            </span>
          </div>
        </div>

        <div className="runner-score-summary">
          <span>Your Score</span>
          <strong>{snapshot.score}</strong>
          <p>
            Ranked #{localRank} · Above {snapshot.aboveRiders} riders
          </p>
        </div>

        <div className="runner-name-panel">
          <label htmlFor="runner-rider-name">Rider name</label>
          <div className="runner-name-row">
            <input
              id="runner-rider-name"
              value={riderName}
              onChange={(event) => setRiderName(event.target.value)}
              maxLength={24}
              placeholder="Your name"
              autoComplete="name"
            />
            <button type="button" onClick={handleSaveScore} disabled={scoreSaved}>
              {scoreSaved ? "Saved" : "Save Score"}
            </button>
          </div>
        </div>

        {visibleLeaderboard.length > 0 ? (
          <div className="runner-leaderboard">
            <h2>Top Riders</h2>
            {visibleLeaderboard.map((entry, index) => (
              <div className="runner-leaderboard-row" key={entry.id}>
                <span>{index + 1}</span>
                <strong>{entry.name}</strong>
                <em>{entry.score}</em>
              </div>
            ))}
          </div>
        ) : null}

        <div className="runner-result-actions">
          <button className="runner-primary-button" onClick={onReplay}>
            Play Again
          </button>
          <button className="runner-secondary-button" type="button" onClick={handleSaveCard}>
            {saveLabel}
          </button>
          <button className="runner-secondary-button" type="button" onClick={handleShareRide}>
            {shareLabel}
          </button>
          <button className="runner-ghost-button" onClick={onBack}>
            Discover Streex
          </button>
        </div>

        {saveHint ? <p className="runner-action-hint">{saveHint}</p> : null}

        {shareFallback ? (
          <div className="runner-share-panel">
            <div>
              <span>Share fallback</span>
              <p>{shareHint}</p>
            </div>
            <textarea
              className="runner-share-fallback"
              readOnly
              value={shareFallback}
              onClick={(event) => event.currentTarget.select()}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
        ) : null}
      </div>

      <style>{`
        .runner-results {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px 20px;
          color: white;
          background:
            radial-gradient(circle at 50% 8%, rgba(230,206,32,0.14), transparent 34%),
            radial-gradient(circle at 50% 80%, rgba(230,206,32,0.08), transparent 32%),
            linear-gradient(180deg, #141711 0%, #050505 72%),
            #0b0b0b;
        }

        .runner-results-shell {
          width: min(100%, 370px);
          display: grid;
          justify-items: center;
          gap: 13px;
        }

        .runner-results-hero {
          display: grid;
          justify-items: center;
          gap: 8px;
          text-align: center;
        }

        .runner-results-hero img {
          width: min(76%, 230px);
          filter: drop-shadow(0 0 22px rgba(230,206,32,0.16));
        }

        .runner-results-hero span {
          color: #e6ce20;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .runner-results-hero h1 {
          margin: 0;
          max-width: 330px;
          color: rgba(255,255,255,0.92);
          font-size: 22px;
          line-height: 1.16;
          font-weight: 900;
          letter-spacing: 0;
        }

        .runner-score-card {
          position: relative;
          width: min(100%, 312px);
          aspect-ratio: 9 / 16;
          border: 1px solid rgba(230,206,32,0.24);
          border-radius: 8px;
          overflow: hidden;
          background-color: #111;
          background-position: center;
          background-size: cover;
          box-shadow:
            0 22px 70px rgba(0,0,0,0.48),
            0 0 42px rgba(230,206,32,0.08);
        }

        .runner-score-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 42%, rgba(230,206,32,0.18), transparent 24%),
            linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.36));
          pointer-events: none;
        }

        .runner-card-atmosphere {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px),
            radial-gradient(circle at 50% 86%, rgba(230,206,32,0.16), transparent 26%);
          opacity: 0.56;
          pointer-events: none;
        }

        .runner-name-panel,
        .runner-leaderboard,
        .runner-share-panel,
        .runner-action-hint {
          width: min(100%, 310px);
        }

        .runner-name-panel {
          display: grid;
          gap: 8px;
        }

        .runner-score-summary {
          width: min(100%, 312px);
          display: grid;
          justify-items: center;
          gap: 4px;
          border: 1px solid rgba(230,206,32,0.14);
          border-radius: 8px;
          background: rgba(255,255,255,0.035);
          padding: 12px 16px;
          text-align: center;
        }

        .runner-score-summary span {
          color: rgba(230,206,32,0.8);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .runner-score-summary strong {
          color: #e6ce20;
          font-size: 46px;
          line-height: 0.96;
          font-weight: 950;
        }

        .runner-score-summary p {
          margin: 0;
          color: rgba(255,255,255,0.68);
          font-size: 12px;
          font-weight: 700;
        }

        .runner-name-panel label,
        .runner-leaderboard h2 {
          color: rgba(255,255,255,0.46);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .runner-name-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .runner-name-row input {
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 8px;
          background: rgba(255,255,255,0.055);
          color: white;
          padding: 0 12px;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-size: 13px;
          outline: none;
        }

        .runner-name-row input:focus {
          border-color: rgba(230,206,32,0.5);
        }

        .runner-name-row button {
          min-height: 44px;
          border: 1px solid rgba(230,206,32,0.42);
          border-radius: 8px;
          background: rgba(230,206,32,0.12);
          color: #e6ce20;
          padding: 0 12px;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .runner-name-row button:disabled {
          opacity: 0.64;
        }

        .runner-leaderboard {
          display: grid;
          gap: 6px;
          max-height: 170px;
          overflow: auto;
        }

        .runner-leaderboard h2 {
          margin: 0 0 2px;
        }

        .runner-leaderboard-row {
          display: grid;
          grid-template-columns: 26px 1fr auto;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.035);
          padding: 0 10px;
        }

        .runner-leaderboard-row span {
          color: #e6ce20;
          font-size: 12px;
          font-weight: 850;
        }

        .runner-leaderboard-row strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: rgba(255,255,255,0.78);
          font-size: 12px;
          font-weight: 700;
        }

        .runner-leaderboard-row em {
          color: rgba(255,255,255,0.56);
          font-size: 12px;
          font-style: normal;
          font-weight: 800;
        }

        .runner-card-body {
          position: relative;
          z-index: 1;
          min-height: 76%;
          display: grid;
          justify-items: center;
          align-content: center;
          gap: 9px;
          padding: 48px 18px 20px;
          text-align: center;
        }

        .runner-card-body p {
          margin: 0;
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .runner-card-body strong {
          color: #e6ce20;
          font-size: 72px;
          line-height: 0.95;
          font-weight: 950;
        }

        .runner-card-body span {
          color: rgba(255,255,255,0.74);
          font-size: 13px;
          font-weight: 750;
        }

        .runner-signature {
          position: absolute;
          z-index: 1;
          left: 16px;
          right: 16px;
          bottom: 16px;
          margin-top: auto;
          display: grid;
          gap: 5px;
          color: rgba(255,255,255,0.46);
          text-align: center;
          text-transform: uppercase;
        }

        .runner-signature strong {
          color: rgba(255,255,255,0.56);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .runner-signature span {
          color: rgba(255,255,255,0.42);
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: none;
        }

        .runner-result-actions {
          width: min(100%, 310px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .runner-action-hint {
          margin: -4px 0 0;
          color: rgba(255,255,255,0.52);
          font-size: 11px;
          line-height: 1.35;
          text-align: center;
        }

        .runner-share-panel {
          display: grid;
          gap: 8px;
          border: 1px solid rgba(230,206,32,0.18);
          border-radius: 8px;
          background: rgba(230,206,32,0.055);
          padding: 10px;
        }

        .runner-share-panel span {
          color: #e6ce20;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .runner-share-panel p {
          margin: 3px 0 0;
          color: rgba(255,255,255,0.56);
          font-size: 11px;
          line-height: 1.35;
        }

        .runner-share-fallback {
          width: 100%;
          min-height: 72px;
          resize: none;
          border: 1px solid rgba(230,206,32,0.22);
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.76);
          padding: 10px 12px;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
          line-height: 1.45;
        }

        .runner-result-actions .runner-primary-button,
        .runner-result-actions .runner-ghost-button {
          grid-column: 1 / -1;
        }

        .runner-primary-button,
        .runner-secondary-button,
        .runner-ghost-button {
          min-height: 48px;
          border-radius: 8px;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-weight: 850;
          cursor: pointer;
        }

        .runner-primary-button {
          border: 0;
          color: #0b0b0b;
          background: #e6ce20;
          box-shadow: 0 0 28px rgba(230,206,32,0.22);
        }

        .runner-secondary-button,
        .runner-ghost-button {
          border: 1px solid rgba(255,255,255,0.14);
          color: white;
          background: rgba(255,255,255,0.045);
        }
      `}</style>
    </section>
  );
}

async function createRunnerScoreCard(
  snapshot: RunnerGameSnapshot,
  riderName: string,
  rank: number,
) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  const [logo, horizon] = await Promise.all([
    loadImage(RUNNER_SPRITES.runnerLogoLockup).catch(() => null),
    loadImage(RUNNER_SPRITES.horizonGroundBlend2).catch(() => null),
  ]);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#11130F");
  background.addColorStop(0.42, "#0B0B0B");
  background.addColorStop(1, "#050505");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, 640, 0, width / 2, 640, 720);
  glow.addColorStop(0, "rgba(230,206,32,0.2)");
  glow.addColorStop(1, "rgba(230,206,32,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  if (horizon) {
    ctx.save();
    ctx.globalAlpha = 0.48;
    ctx.drawImage(horizon, -250, 250, width + 500, 760);
    ctx.restore();
  }

  drawShareRoadScene(ctx, width, height);
  drawShareCardBorder(ctx, width, height);

  if (logo) {
    ctx.drawImage(logo, 286, 120, 508, 338);
  } else {
    drawRunnerTextLogo(ctx, width / 2, 250);
  }

  ctx.textAlign = "center";

  ctx.fillStyle = "#E6CE20";
  ctx.font = "800 34px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "14px";
  ctx.fillText("RIDE ELEVATED", width / 2, 560);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "950 214px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(String(snapshot.score), width / 2, 790);

  ctx.fillStyle = "#E6CE20";
  ctx.font = "800 38px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "12px";
  ctx.fillText(`YOU RANKED #${rank}`, width / 2, 920);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 40px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "7px";
  ctx.fillText(`ABOVE ${snapshot.aboveRiders} RIDERS`, width / 2, 1010);

  ctx.strokeStyle = "rgba(230,206,32,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(230, 1408);
  ctx.lineTo(850, 1408);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.54)";
  ctx.font = "700 31px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "13px";
  ctx.fillText("STREEX RIDER", width / 2, 1498);

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 27px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText(CONFIG.website.replace(/^https?:\/\//, ""), width / 2, 1570);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 24px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(
    `${CONFIG.ownerName} · @${CONFIG.instagram} · ${CONFIG.phoneDisplay}`,
    width / 2,
    1642,
  );

  ctx.fillStyle = "#E6CE20";
  ctx.font = "900 32px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("★", width / 2, 1780);

  return canvas;
}

function drawShareRoadScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  const roadTop = 990;
  const roadBottom = height + 120;
  const roadGradient = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
  roadGradient.addColorStop(0, "rgba(73,78,72,0.55)");
  roadGradient.addColorStop(0.52, "rgba(34,37,35,0.74)");
  roadGradient.addColorStop(1, "rgba(9,9,9,0.96)");

  ctx.beginPath();
  ctx.moveTo(width * 0.44, roadTop);
  ctx.lineTo(width * 0.56, roadTop);
  ctx.lineTo(width * 0.92, roadBottom);
  ctx.lineTo(width * 0.08, roadBottom);
  ctx.closePath();
  ctx.fillStyle = roadGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(230,206,32,0.52)";
  ctx.lineWidth = 8;
  ctx.setLineDash([62, 46]);
  ctx.beginPath();
  ctx.moveTo(width / 2, roadTop + 70);
  ctx.lineTo(width / 2, roadBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.34, roadTop + 20);
  ctx.lineTo(width * 0.18, roadBottom);
  ctx.moveTo(width * 0.66, roadTop + 20);
  ctx.lineTo(width * 0.82, roadBottom);
  ctx.stroke();

  const darkFade = ctx.createLinearGradient(0, 860, 0, height);
  darkFade.addColorStop(0, "rgba(0,0,0,0)");
  darkFade.addColorStop(0.72, "rgba(0,0,0,0.18)");
  darkFade.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = darkFade;
  ctx.fillRect(0, 760, width, height - 760);
  ctx.restore();
}

function drawShareCardBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(230,206,32,0.86)";
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.strokeStyle = "rgba(230,206,32,0.26)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = "#E6CE20";
  const corners = [
    [42, 42],
    [width - 42, 42],
    [42, height - 42],
    [width - 42, height - 42],
  ];
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 0.32;
  for (let i = 0; i < 120; i += 1) {
    const x = 60 + pseudoCardRandom(i, 1) * (width - 120);
    const y = 60 + pseudoCardRandom(i, 2) * (height - 120);
    if (y > 620 && y < 1320 && x > 240 && x < 840) continue;
    ctx.fillRect(x, y, 3, 3);
  }
  ctx.restore();
}

function drawRunnerTextLogo(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 72px Montserrat, Arial, sans-serif";
  ctx.fillText("STREEX", centerX, centerY);
  ctx.fillStyle = "#E6CE20";
  ctx.font = "900 italic 54px Montserrat, Arial, sans-serif";
  ctx.fillText("RUNNER", centerX, centerY + 62);
  ctx.restore();
}

function pseudoCardRandom(seed: number, salt: number) {
  const value = Math.sin(seed * 19.17 + salt * 91.7) * 10000;
  return value - Math.floor(value);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to create score card image."));
    }, "image/png");
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function loadSavedScores(): RunnerSavedScore[] {
  try {
    const rawScores = localStorage.getItem(RUNNER_SCORES_KEY);
    if (!rawScores) return [];
    const parsed = JSON.parse(rawScores);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedScore).slice().sort(sortScores).slice(0, 25);
  } catch {
    return [];
  }
}

function isSavedScore(value: unknown): value is RunnerSavedScore {
  if (!value || typeof value !== "object") return false;
  const score = value as Partial<RunnerSavedScore>;
  return (
    typeof score.id === "string" &&
    typeof score.name === "string" &&
    typeof score.score === "number" &&
    typeof score.createdAt === "string"
  );
}

function sortScores(a: RunnerSavedScore, b: RunnerSavedScore) {
  if (b.score !== a.score) return b.score - a.score;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
