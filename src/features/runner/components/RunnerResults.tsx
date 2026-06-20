import { useEffect, useMemo, useState } from "react";
import { CONFIG } from "@/config";
import { listRunnerLeaderboard, submitRunnerScore } from "@/lib/runner-score.functions";
import { RUNNER_SPRITES } from "../assets/manifest";
import type { RunnerGameSnapshot } from "../runner.types";

type RunnerSavedScore = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

type RunnerResultStats = {
  rank: number;
  totalRiders: number;
  recordsReady: boolean;
};

const SHARE_MESSAGE = `Think you can beat my ride? 😏🚙
I just had fun with Streex Horizon.
Take the challenge and discover Streex.`;

type RunnerResultsProps = {
  snapshot: RunnerGameSnapshot;
  onReplay: () => void;
  onBack: () => void;
};

export function RunnerResults({ snapshot, onReplay, onBack }: RunnerResultsProps) {
  const [riderName, setRiderName] = useState("");
  const [savedScores, setSavedScores] = useState<RunnerSavedScore[]>([]);
  const [resultStats, setResultStats] = useState<RunnerResultStats>({
    rank: snapshot.rank,
    totalRiders: snapshot.totalRiders,
    recordsReady: true,
  });
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreHint, setScoreHint] = useState<string | null>(null);
  const [saveLabel, setSaveLabel] = useState("Save Card");
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState("Share Ride");
  const [shareFallback, setShareFallback] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [showAllRiders, setShowAllRiders] = useState(false);

  const displayName = riderName.trim() || "Streex Rider";
  const canSaveScore = riderName.trim().length > 0;
  const resultRank = Math.max(1, resultStats.rank);
  const totalRiders = Math.max(1, resultStats.totalRiders);
  const riderCountLabel = totalRiders === 1 ? "1 rider" : `${totalRiders} riders`;

  useEffect(() => {
    let cancelled = false;
    setLeaderboardLoading(true);
    listRunnerLeaderboard({ data: { score: snapshot.score } })
      .then((result) => {
        if (cancelled) return;
        setSavedScores(
          (result.scores ?? []).map((score) => ({
            id: score.id,
            name: score.name,
            score: score.score,
            createdAt: score.created_at,
          })),
        );
        setResultStats({
          rank: result.currentRank ?? 1,
          totalRiders: result.totalRiders ?? 1,
          recordsReady: result.recordsReady ?? true,
        });
        if (result.recordsReady === false && result.message) {
          setScoreHint(result.message);
        }
      })
      .catch(() => {
        if (!cancelled) setScoreHint("Leaderboard unavailable for this session.");
      })
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [snapshot.score]);

  const visibleLeaderboard = useMemo(
    () => savedScores.slice().sort(sortScores).slice(0, 10),
    [savedScores],
  );
  const topRiders = visibleLeaderboard.slice(0, 3);
  const restRiders = visibleLeaderboard.slice(3);
  const handleSaveScore = async () => {
    const name = riderName.trim().slice(0, 24);
    if (!name) {
      setScoreHint("Add your name before saving.");
      return;
    }

    setScoreSaving(true);
    setScoreHint(null);
    try {
      await submitRunnerScore({ data: { name, score: snapshot.score } });
      setScoreSaved(true);
      setScoreHint(
        resultStats.recordsReady
          ? "Score saved. It will appear after admin approval."
          : "Score saved. Score stats will update after Cloud records are ready.",
      );
    } catch (error) {
      setScoreHint(error instanceof Error ? error.message : "Failed to save score.");
    } finally {
      setScoreSaving(false);
    }
  };

  const handleSaveCard = async () => {
    const canvas = await createRunnerScoreCard(snapshot, resultRank, totalRiders);
    const filename = `streex-horizon-${snapshot.score}.png`;

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
    const text = `${SHARE_MESSAGE}\n\n${displayName} scored ${snapshot.score}. Ranked #${resultRank} of ${totalRiders}.`;
    const fallbackText = `${text}\n${shareUrl}`;
    const filename = `streex-horizon-${snapshot.score}.png`;

    try {
      setShareLabel("Sharing...");
      const canvas = await createRunnerScoreCard(snapshot, resultRank, totalRiders);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share) {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Streex Horizon",
            text,
            url: shareUrl,
            files: [file],
          });
        } else {
          await navigator.share({
            title: "Streex Horizon",
            text,
            url: shareUrl,
          });
        }
        setShareLabel("Shared");
        window.setTimeout(() => setShareLabel("Share Ride"), 1400);
        return;
      }

      if (!navigator.clipboard) throw new Error("Clipboard is unavailable.");
      await navigator.clipboard.writeText(fallbackText);
      setShareLabel("Copied");
      setShareHint("Share text copied.");
      window.setTimeout(() => setShareLabel("Share Ride"), 1400);
      window.setTimeout(() => setShareHint(null), 2600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareLabel("Share Ride");
        return;
      }
      setShareFallback(fallbackText);
      setShareLabel("Copy Below");
      setShareHint("This browser blocked native share. Select and copy the text below.");
      window.setTimeout(() => setShareLabel("Share Ride"), 1800);
    }
  };

  return (
    <section className="runner-results">
      <div className="runner-results-shell">
        <div
          className="runner-score-card"
          style={{ backgroundImage: `url(${RUNNER_SPRITES.scoreCardFrame})` }}
        >
          <div className="runner-card-atmosphere" />
          <div className="runner-card-body">
            <span className="runner-card-eyebrow">Ride Complete</span>
            <h1 className="runner-card-headline">
              {snapshot.crashKind ? "You made the road remember." : "Ride Elevated."}
            </h1>
            <p className="runner-card-label">Your Score</p>
            <strong className="runner-card-score">{snapshot.score}</strong>
            <span className="runner-card-rank">You ranked #{resultRank}</span>
            <span className="runner-card-rank-sub">Among {riderCountLabel}</span>
          </div>
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
            <button
              type="button"
              onClick={handleSaveScore}
              disabled={!canSaveScore || scoreSaved || scoreSaving}
            >
              {scoreSaving ? "Saving" : scoreSaved ? "Pending" : "Save Score"}
            </button>
          </div>
          {scoreHint ? <p className="runner-score-hint">{scoreHint}</p> : null}
        </div>

        {leaderboardLoading ? (
          <div className="runner-leaderboard">
            <h2>Top Riders</h2>
            <p className="runner-empty-state">Loading records...</p>
          </div>
        ) : visibleLeaderboard.length > 0 ? (
          <div className="runner-leaderboard">
            <h2>Top Riders</h2>
            {topRiders.map((entry, index) => (
              <div className="runner-leaderboard-row" key={entry.id}>
                <span>{index + 1}</span>
                <strong>{entry.name}</strong>
                <em>{entry.score}</em>
              </div>
            ))}
            {showAllRiders
              ? restRiders.map((entry, index) => (
                  <div className="runner-leaderboard-row" key={entry.id}>
                    <span>{index + 4}</span>
                    <strong>{entry.name}</strong>
                    <em>{entry.score}</em>
                  </div>
                ))
              : null}
            {restRiders.length > 0 ? (
              <button
                type="button"
                className="runner-view-all"
                onClick={() => setShowAllRiders((value) => !value)}
                aria-expanded={showAllRiders}
              >
                {showAllRiders ? "Hide" : `View all (${visibleLeaderboard.length})`}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="runner-leaderboard">
            <h2>Top Riders</h2>
            <p className="runner-empty-state">No approved scores yet.</p>
          </div>
        )}

        <div className="runner-result-actions">
          <button
            className="runner-primary-button runner-action-primary"
            onClick={onReplay}
          >
            Play Again
          </button>
          <div className="runner-action-secondary-row">
            <button
              className="runner-secondary-button"
              type="button"
              onClick={handleSaveCard}
            >
              {saveLabel}
            </button>
            <button
              className="runner-secondary-button"
              type="button"
              onClick={handleShareRide}
            >
              {shareLabel}
            </button>
          </div>
          <button
            className="runner-ghost-button runner-action-tertiary"
            onClick={onBack}
          >
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

        .runner-score-hint,
        .runner-empty-state {
          margin: 0;
          color: rgba(255,255,255,0.48);
          font-size: 11px;
          line-height: 1.35;
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
  rank: number,
  totalRiders: number,
) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  const frame = await loadImage(RUNNER_SPRITES.scoreCardFrame).catch(() => null);

  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, width, height);

  if (frame) {
    ctx.drawImage(frame, 0, 0, width, height);
  } else {
    const fallback = ctx.createLinearGradient(0, 0, 0, height);
    fallback.addColorStop(0, "#050505");
    fallback.addColorStop(0.58, "#101108");
    fallback.addColorStop(1, "#050505");
    ctx.fillStyle = fallback;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 560, width, 770);

  const atmosphere = ctx.createLinearGradient(0, 520, 0, 1320);
  atmosphere.addColorStop(0, "rgba(0,0,0,0.08)");
  atmosphere.addColorStop(0.5, "rgba(0,0,0,0.18)");
  atmosphere.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = atmosphere;
  ctx.fillRect(0, 520, width, 820);

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "800 34px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, "YOUR SCORE", width / 2, 730, 12);

  ctx.fillStyle = "#E6CE20";
  ctx.font = "950 260px Montserrat, Arial, sans-serif";
  ctx.shadowColor = "rgba(230,206,32,0.45)";
  ctx.shadowBlur = 54;
  ctx.fillText(String(snapshot.score), width / 2, 970);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 46px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, `YOU RANKED #${rank}`, width / 2, 1090, 7);

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "700 34px Montserrat, Arial, sans-serif";
  drawSpacedText(
    ctx,
    `OF ${totalRiders} ${totalRiders === 1 ? "RIDER" : "RIDERS"}`,
    width / 2,
    1170,
    7,
  );

  ctx.fillStyle = "#E6CE20";
  ctx.font = "750 36px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, CONFIG.website.replace(/^https?:\/\//, ""), width / 2, 1510, 3);

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = "700 34px Montserrat, Arial, sans-serif";
  ctx.fillText(`${CONFIG.ownerName}   @${CONFIG.instagram}`, width / 2, 1598);
  ctx.fillText(CONFIG.phoneDisplay, width / 2, 1650);

  return canvas;
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
) {
  const chars = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((sum, w) => sum + w, 0) + spacing * (chars.length - 1);
  let x = centerX - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
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

function sortScores(a: RunnerSavedScore, b: RunnerSavedScore) {
  if (b.score !== a.score) return b.score - a.score;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
