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
I just had fun with STREEX Runner.
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
    const canvas = await createRunnerScoreCard(snapshot, displayName, resultRank, totalRiders);
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
    const text = `${SHARE_MESSAGE}\n\n${displayName} scored ${snapshot.score}. Ranked #${resultRank} of ${totalRiders}.`;
    const fallbackText = `${text}\n${shareUrl}`;
    const filename = `streex-runner-${snapshot.score}.png`;

    try {
      setShareLabel("Sharing...");
      const canvas = await createRunnerScoreCard(snapshot, displayName, resultRank, totalRiders);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share) {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "STREEX Runner",
            text,
            url: shareUrl,
            files: [file],
          });
        } else {
          await navigator.share({
            title: "STREEX Runner",
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
            <span>You ranked #{resultRank}</span>
            <span>Among {riderCountLabel}</span>
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
            Ranked #{resultRank} of {totalRiders}
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
            {visibleLeaderboard.map((entry, index) => (
              <div className="runner-leaderboard-row" key={entry.id}>
                <span>{index + 1}</span>
                <strong>{entry.name}</strong>
                <em>{entry.score}</em>
              </div>
            ))}
          </div>
        ) : (
          <div className="runner-leaderboard">
            <h2>Top Riders</h2>
            <p className="runner-empty-state">No approved scores yet.</p>
          </div>
        )}

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
  totalRiders: number,
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

  void riderName;

  // ─── Deep night sky ──────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#02030a");
  sky.addColorStop(0.4, "#07080d");
  sky.addColorStop(0.75, "#100f08");
  sky.addColorStop(1, "#1a1606");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawShareStars(ctx, width, height);

  // ─── Horizon photo blended in ────────────────
  if (horizon) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(horizon, -200, 760, width + 400, 540);
    ctx.restore();
  }

  drawShareMountains(ctx, width);
  drawShareHorizonLights(ctx, width);

  // ─── Central horizon glow ────────────────────
  const glow = ctx.createRadialGradient(width / 2, 1230, 20, width / 2, 1230, 560);
  glow.addColorStop(0, "rgba(230,206,32,0.45)");
  glow.addColorStop(1, "rgba(230,206,32,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawShareRoadScene(ctx, width, height);

  // ─── Dark bottom fade for text legibility ────
  const fade = ctx.createLinearGradient(0, height * 0.42, 0, height);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.5, "rgba(0,0,0,0.55)");
  fade.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, height * 0.42, width, height * 0.58);

  drawShareCardBorder(ctx, width, height);
  drawShareLogoBadge(ctx, width, logo);

  ctx.textAlign = "center";

  // RIDE ELEVATED eyebrow
  ctx.fillStyle = "#E6CE20";
  ctx.font = "800 42px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, "RIDE ELEVATED", width / 2, 740, 18);

  // HUGE SCORE
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "950 320px Montserrat, Arial, sans-serif";
  ctx.shadowColor = "rgba(230,206,32,0.45)";
  ctx.shadowBlur = 60;
  ctx.fillText(String(snapshot.score), width / 2, 1030);
  ctx.shadowBlur = 0;

  // YOU RANKED #N
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 56px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, `YOU RANKED #${rank}`, width / 2, 1130, 8);

  // Real rider count
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "700 38px Montserrat, Arial, sans-serif";
  drawSpacedText(
    ctx,
    `OF ${totalRiders} ${totalRiders === 1 ? "RIDER" : "RIDERS"}`,
    width / 2,
    1200,
    8,
  );

  // Divider
  ctx.strokeStyle = "rgba(230,206,32,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, 1500);
  ctx.lineTo(800, 1500);
  ctx.stroke();

  // STREEX RIDER
  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.font = "800 38px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, "STREEX RIDER", width / 2, 1580, 14);

  // Domain
  ctx.fillStyle = "#E6CE20";
  ctx.font = "600 30px Montserrat, Arial, sans-serif";
  drawSpacedText(ctx, CONFIG.website.replace(/^https?:\/\//, ""), width / 2, 1640, 4);

  // Contact line
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 26px Montserrat, Arial, sans-serif";
  drawSpacedText(
    ctx,
    `${CONFIG.ownerName}   @${CONFIG.instagram}   ${CONFIG.phoneDisplay}`,
    width / 2,
    1720,
    3,
  );

  // Star
  ctx.fillStyle = "#E6CE20";
  ctx.font = "900 44px Montserrat, Arial, sans-serif";
  ctx.shadowColor = "rgba(230,206,32,0.6)";
  ctx.shadowBlur = 24;
  ctx.fillText("★", width / 2, 1830);
  ctx.shadowBlur = 0;

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

function drawShareStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i += 1) {
    const x = pseudoCardRandom(i, 11) * width;
    const y = pseudoCardRandom(i, 13) * (height * 0.5);
    const a = 0.25 + pseudoCardRandom(i, 17) * 0.55;
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

function drawShareMountains(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();
  // Far mountains
  ctx.fillStyle = "#15170f";
  ctx.beginPath();
  const farBase = 1290;
  ctx.moveTo(-20, farBase);
  const farPts: Array<[number, number]> = [
    [0.06, 0.62],
    [0.14, 0.78],
    [0.22, 0.48],
    [0.32, 0.72],
    [0.42, 0.36],
    [0.52, 0.64],
    [0.62, 0.4],
    [0.72, 0.68],
    [0.82, 0.44],
    [0.92, 0.7],
    [1, 0.56],
  ];
  farPts.forEach(([fx, fy]) => {
    ctx.lineTo(fx * width, farBase - (1 - fy) * 220);
  });
  ctx.lineTo(width + 20, farBase);
  ctx.closePath();
  ctx.fill();

  // Near mountains
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  const nearBase = 1370;
  ctx.moveTo(-20, nearBase);
  const nearPts: Array<[number, number]> = [
    [0.1, 0.5],
    [0.2, 0.76],
    [0.3, 0.3],
    [0.4, 0.64],
    [0.5, 0.18],
    [0.6, 0.6],
    [0.7, 0.34],
    [0.8, 0.7],
    [0.9, 0.48],
    [1, 0.64],
  ];
  nearPts.forEach(([fx, fy]) => {
    ctx.lineTo(fx * width, nearBase - (1 - fy) * 280);
  });
  ctx.lineTo(width + 20, nearBase);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShareHorizonLights(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();
  const y = 1340;
  const positions = [0.12, 0.22, 0.32, 0.42, 0.48, 0.52, 0.58, 0.68, 0.78, 0.88];
  positions.forEach((p, i) => {
    const x = p * width;
    const central = i >= 4 && i <= 5;
    ctx.fillStyle = central ? "#fff5b8" : "#e6ce20";
    ctx.shadowColor = "rgba(230,206,32,0.9)";
    ctx.shadowBlur = central ? 28 : 18;
    ctx.beginPath();
    ctx.arc(x, y, central ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawShareLogoBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  logo: HTMLImageElement | null,
) {
  const cx = width / 2;
  const top = 200;
  const w = 560;
  const h = 290;
  const x = cx - w / 2;

  ctx.save();
  ctx.shadowColor = "rgba(230,206,32,0.45)";
  ctx.shadowBlur = 42;
  ctx.fillStyle = "rgba(11,11,11,0.95)";
  roundRect(ctx, x, top, w, h, 26);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#e6ce20";
  ctx.lineWidth = 4;
  roundRect(ctx, x, top, w, h, 26);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(230,206,32,0.28)";
  ctx.lineWidth = 1;
  roundRect(ctx, x + 10, top + 10, w - 20, h - 20, 20);
  ctx.stroke();
  ctx.restore();

  drawWing(ctx, x - 100, top + h / 2 - 14, 80, 28, false);
  drawWing(ctx, x + w + 20, top + h / 2 - 14, 80, 28, true);

  if (logo) {
    const lw = 460;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, cx - lw / 2, top + h / 2 - lh / 2, lw, lh);
  } else {
    drawRunnerTextLogo(ctx, cx, top + h / 2 + 20);
  }
}

function drawWing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  flip: boolean,
) {
  ctx.save();
  ctx.translate(x + (flip ? w : 0), y);
  if (flip) ctx.scale(-1, 1);
  const segs: Array<[number, number]> = [
    [0.06, 0.18],
    [0.26, 0.44],
    [0.54, 0.82],
  ];
  ctx.fillStyle = "#e6ce20";
  segs.forEach(([a, b]) => {
    ctx.fillRect(a * w, 0, (b - a) * w, h);
  });
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawShareRoadScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  const roadTop = 1360;
  const roadBottom = height + 160;
  const roadGradient = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
  roadGradient.addColorStop(0, "rgba(46,48,40,0.85)");
  roadGradient.addColorStop(0.45, "rgba(22,22,18,0.95)");
  roadGradient.addColorStop(1, "rgba(5,5,5,1)");

  ctx.beginPath();
  ctx.moveTo(width * 0.46, roadTop);
  ctx.lineTo(width * 0.54, roadTop);
  ctx.lineTo(width * 0.96, roadBottom);
  ctx.lineTo(width * 0.04, roadBottom);
  ctx.closePath();
  ctx.fillStyle = roadGradient;
  ctx.fill();

  // Glowing yellow side rails
  ctx.strokeStyle = "rgba(230,206,32,0.55)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(230,206,32,0.7)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(width * 0.46, roadTop);
  ctx.lineTo(width * 0.04, roadBottom);
  ctx.moveTo(width * 0.54, roadTop);
  ctx.lineTo(width * 0.96, roadBottom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center dashed line with perspective widening
  ctx.strokeStyle = "#e6ce20";
  ctx.shadowColor = "rgba(230,206,32,0.9)";
  ctx.shadowBlur = 22;
  const segments = 9;
  for (let i = 0; i < segments; i += 1) {
    const t1 = i / segments;
    const t2 = (i + 0.55) / segments;
    const y1 = roadTop + (roadBottom - roadTop) * t1;
    const y2 = roadTop + (roadBottom - roadTop) * t2;
    ctx.lineWidth = 4 + t1 * 22;
    ctx.beginPath();
    ctx.moveTo(width / 2, y1);
    ctx.lineTo(width / 2, y2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawShareCardBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  // Main yellow frame
  ctx.strokeStyle = "#e6ce20";
  ctx.lineWidth = 5;
  ctx.shadowColor = "rgba(230,206,32,0.4)";
  ctx.shadowBlur = 22;
  roundRect(ctx, 36, 36, width - 72, height - 72, 28);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner thin frame
  ctx.strokeStyle = "rgba(230,206,32,0.32)";
  ctx.lineWidth = 1;
  roundRect(ctx, 60, 60, width - 120, height - 120, 20);
  ctx.stroke();
  ctx.restore();

  // Checker corner blocks
  drawCheckerBlock(ctx, 60, 60, 120, 60, false, false);
  drawCheckerBlock(ctx, width - 60 - 120, 60, 120, 60, true, false);
  drawCheckerBlock(ctx, 60, height - 60 - 60, 120, 60, false, true);
  drawCheckerBlock(ctx, width - 60 - 120, height - 60 - 60, 120, 60, true, true);
}

function drawCheckerBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  flipX: boolean,
  flipY: boolean,
) {
  ctx.save();
  ctx.fillStyle = "#e6ce20";
  const cell = 14;
  const cols = Math.floor(w / cell);
  const rows = Math.floor(h / cell);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if ((r + c) % 2 !== 0) continue;
      const distC = flipX ? cols - 1 - c : c;
      const distR = flipY ? rows - 1 - r : r;
      if (distC + distR > cols - 1) continue;
      ctx.fillRect(x + c * cell, y + r * cell, cell - 1, cell - 1);
    }
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

function sortScores(a: RunnerSavedScore, b: RunnerSavedScore) {
  if (b.score !== a.score) return b.score - a.score;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
