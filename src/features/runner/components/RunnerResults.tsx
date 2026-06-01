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
      <div
        className="runner-score-card"
        style={{ backgroundImage: `url(${RUNNER_SPRITES.scoreCardFrame})` }}
      >
        <div className="runner-card-snapshot">
          <span>STREEX</span>
          <strong>RUNNER</strong>
        </div>
        <div className="runner-card-body">
          <p>Your Score</p>
          <strong>{snapshot.score}</strong>
          <span>You ranked #{localRank}</span>
          <span>Above {snapshot.aboveRiders} riders</span>
        </div>
        <div className="runner-signature">Ride Elevated</div>
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
          Back to Streex
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

      <style>{`
        .runner-results {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          place-items: center;
          gap: 14px;
          padding: 28px 22px;
          color: white;
          background:
            radial-gradient(circle at 50% 18%, rgba(230,206,32,0.12), transparent 35%),
            #0b0b0b;
        }

        .runner-score-card {
          width: min(100%, 310px);
          aspect-ratio: 9 / 16;
          border: 1px solid rgba(230,206,32,0.24);
          border-radius: 8px;
          overflow: hidden;
          background-color: #111;
          background-position: center;
          background-size: cover;
          box-shadow: 0 22px 70px rgba(0,0,0,0.48);
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

        .runner-card-snapshot {
          height: 48%;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 4px;
          background:
            linear-gradient(180deg, rgba(230,206,32,0.18), transparent 45%),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 8px),
            linear-gradient(180deg, #1d241c, #10100e);
          image-rendering: pixelated;
        }

        .runner-card-snapshot span {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }

        .runner-card-snapshot strong {
          color: #e6ce20;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .runner-card-body {
          display: grid;
          justify-items: center;
          gap: 8px;
          padding: 28px 18px 18px;
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
          font-size: 58px;
          line-height: 0.95;
          font-weight: 900;
        }

        .runner-card-body span {
          color: rgba(255,255,255,0.74);
          font-size: 14px;
          font-weight: 650;
        }

        .runner-signature {
          margin-top: auto;
          color: rgba(255,255,255,0.46);
          font-size: 12px;
          letter-spacing: 0.18em;
          text-align: center;
          text-transform: uppercase;
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

  const frame = await loadImage(RUNNER_SPRITES.scoreCardFrame).catch(() => null);
  if (frame) {
    ctx.drawImage(frame, 0, 0, width, height);
  } else {
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#171717");
    background.addColorStop(0.45, "#0B0B0B");
    background.addColorStop(1, "#050505");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width / 2, 340, 0, width / 2, 340, 720);
    glow.addColorStop(0, "rgba(230,206,32,0.22)");
    glow.addColorStop(1, "rgba(230,206,32,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, 900);

    drawScoreCardSnapshot(ctx, width);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 42px Montserrat, Arial, sans-serif";
  ctx.letterSpacing = "12px";
  ctx.fillText("STREEX", width / 2, 860);

  ctx.fillStyle = "#E6CE20";
  ctx.font = "900 104px Montserrat, Arial, sans-serif";
  ctx.fillText("RUNNER", width / 2, 970);

  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.font = "700 32px Montserrat, Arial, sans-serif";
  ctx.fillText(riderName.toUpperCase(), width / 2, 1104);
  ctx.fillText("YOUR SCORE", width / 2, 1160);

  ctx.fillStyle = "#E6CE20";
  ctx.font = "900 190px Montserrat, Arial, sans-serif";
  ctx.fillText(String(snapshot.score), width / 2, 1332);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 48px Montserrat, Arial, sans-serif";
  ctx.fillText(`You ranked #${rank}`, width / 2, 1456);
  ctx.fillText(`Above ${snapshot.aboveRiders} riders`, width / 2, 1526);

  ctx.strokeStyle = "rgba(230,206,32,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(230, 1628);
  ctx.lineTo(850, 1628);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.font = "600 34px Montserrat, Arial, sans-serif";
  ctx.fillText("Ride Elevated", width / 2, 1700);

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = "500 27px Montserrat, Arial, sans-serif";
  ctx.fillText(CONFIG.website.replace(/^https?:\/\//, ""), width / 2, 1762);

  return canvas;
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

function drawScoreCardSnapshot(ctx: CanvasRenderingContext2D, width: number) {
  const top = 110;
  const height = 610;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(90, top, width - 180, height, 18);
  ctx.clip();
  ctx.fillStyle = "#151A16";
  ctx.fillRect(90, top, width - 180, height);

  ctx.fillStyle = "#31382D";
  ctx.beginPath();
  ctx.moveTo(90, top + 330);
  ctx.lineTo(230, top + 210);
  ctx.lineTo(390, top + 330);
  ctx.lineTo(560, top + 180);
  ctx.lineTo(760, top + 330);
  ctx.lineTo(990, top + 190);
  ctx.lineTo(990, top + 390);
  ctx.lineTo(90, top + 390);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#20201C";
  ctx.beginPath();
  ctx.moveTo(420, top + 280);
  ctx.lineTo(660, top + 280);
  ctx.lineTo(1010, top + height);
  ctx.lineTo(70, top + height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(230,206,32,0.45)";
  ctx.lineWidth = 8;
  ctx.setLineDash([48, 34]);
  ctx.beginPath();
  ctx.moveTo(width / 2, top + 300);
  ctx.lineTo(width / 2, top + height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#D8D8D2";
  ctx.beginPath();
  ctx.roundRect(width / 2 - 105, top + 430, 210, 116, 12);
  ctx.fill();
  ctx.fillStyle = "#0B0B0B";
  ctx.font = "900 26px Montserrat, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STREEX", width / 2, top + 500);

  ctx.restore();
}
