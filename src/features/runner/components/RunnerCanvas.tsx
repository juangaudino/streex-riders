import { useCallback, useEffect, useRef, useState } from "react";
import { RUNNER_COLORS, RUNNER_HORIZON, RUNNER_OBSTACLE_LABELS } from "../runner.config";
import type { RunnerControls, RunnerEntity, RunnerGameSnapshot, RunnerLane } from "../runner.types";
import { RUNNER_SPRITES, type RunnerSpriteKey } from "../assets/manifest";
import { RunnerAudio } from "../audio/runnerAudio";
import { detectRunnerCollision, laneCenter } from "../engine/collision";
import { getDifficulty } from "../engine/difficulty";
import { createSpawnMemory, createSpawnWave } from "../engine/spawnEngine";

// Deterministic dust particles — module-level so no allocations per frame.
const DUST_PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  xPct: ((i * 137 + 23) % 1000) / 1000,
  yBand: ((i * 53 + 11) % 100) / 100,
  speed: 0.55 + (((i * 17) % 50) / 100),
  size: 0.7 + (((i * 7) % 18) / 18) * 1.4,
  phase: ((i * 211) % 1000) / 1000,
}));

type RunnerLoadedSprites = Partial<Record<RunnerSpriteKey, HTMLImageElement>>;

type RunnerState = {
  running: boolean;
  paused: boolean;
  startedAt: number;
  lastFrameAt: number;
  lastSpawnAt: number;
  playerLane: RunnerLane;
  targetLane: RunnerLane;
  playerX: number;
  playerY: number;
  score: number;
  roadOffset: number;
  entities: RunnerEntity[];
  iceDriftUntil: number;
  crashUntil: number | null;
  crashKind: RunnerEntity["kind"] | null;
  toast: { text: string; until: number } | null;
  rewardFx: RunnerRewardFx[];
};

type RunnerRewardFx = {
  id: number;
  kind: RunnerEntity["kind"];
  lane: RunnerLane;
  y: number;
  startedAt: number;
  until: number;
};

export function RunnerCanvas({ onGameOver, onRestart, onBack }: RunnerControls) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const memoryRef = useRef(createSpawnMemory());
  const animationRef = useRef<number | null>(null);
  const spritesRef = useRef<RunnerLoadedSprites>({});
  const audioRef = useRef<RunnerAudio | null>(null);
  const [scoreLabel, setScoreLabel] = useState(0);
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const stateRef = useRef<RunnerState>({
    running: true,
    paused: false,
    startedAt: 0,
    lastFrameAt: 0,
    lastSpawnAt: 0,
    playerLane: 1,
    targetLane: 1,
    playerX: laneCenter(1),
    playerY: 79,
    score: 0,
    roadOffset: 0,
    entities: [],
    iceDriftUntil: 0,
    crashUntil: null,
    crashKind: null,
    toast: null,
    rewardFx: [],
  });

  const move = useCallback((direction: -1 | 1) => {
    const state = stateRef.current;
    if (!state.running || state.paused || state.crashUntil) return;
    const nextLane = Math.max(0, Math.min(2, state.targetLane + direction)) as RunnerLane;
    if (nextLane === state.targetLane) return;
    state.targetLane = nextLane;
    void audioRef.current?.warm().then(() => audioRef.current?.laneMove());
  }, []);

  const pauseGame = useCallback(() => {
    stateRef.current.paused = true;
    audioRef.current?.setPaused(true);
    setMenuOpen(true);
  }, []);

  const resumeGame = useCallback(() => {
    stateRef.current.paused = false;
    stateRef.current.lastFrameAt = 0;
    audioRef.current?.setPaused(false);
    setMenuOpen(false);
  }, []);

  const handlePointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      void audioRef.current?.warm();
      const rect = shellRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      if (x < rect.width / 3) move(-1);
      if (x > (rect.width / 3) * 2) move(1);
    },
    [move],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void audioRef.current?.warm();
        if (stateRef.current.paused) resumeGame();
        else pauseGame();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        void audioRef.current?.warm();
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, pauseGame, resumeGame]);

  useEffect(() => {
    audioRef.current = new RunnerAudio();
    return () => audioRef.current?.dispose();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(RUNNER_SPRITES) as [RunnerSpriteKey, string][];

    entries.forEach(([key, src]) => {
      const image = new Image();
      image.onload = () => {
        if (!cancelled) {
          spritesRef.current = { ...spritesRef.current, [key]: image };
        }
      };
      image.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const shell = shellRef.current;
      if (!canvas || !shell) return;
      const rect = shell.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const loop = (time: number) => {
      const state = stateRef.current;
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      if (!state.startedAt) {
        state.startedAt = time;
        state.lastFrameAt = time;
        state.lastSpawnAt = time;
      }

      const deltaMs = Math.min(time - state.lastFrameAt, 48);
      state.lastFrameAt = time;
      const elapsedMs = time - state.startedAt;
      const difficulty = getDifficulty(state.score, elapsedMs);

      if (state.paused) {
        state.lastFrameAt = time;
        drawRunnerFrame(ctx, width, height, state, time, spritesRef.current);
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      if (state.running && !state.crashUntil) {
        if (time - state.lastSpawnAt > difficulty.spawnEveryMs) {
          state.entities.push(...createSpawnWave(difficulty, memoryRef.current));
          state.lastSpawnAt = time;
        }

        const laneTarget = laneCenter(state.targetLane);
        const laneEase = time < state.iceDriftUntil ? 0.045 : 0.13;
        state.playerX += (laneTarget - state.playerX) * laneEase * (deltaMs / 16);
        state.roadOffset += difficulty.speed * (deltaMs / 16);
        state.score += Math.max(1, Math.floor(difficulty.speed * 0.05 * (deltaMs / 16)));

        const movement = difficulty.speed * 0.15 * (deltaMs / 16);
        state.entities = state.entities
          .map((entity) => ({ ...entity, y: entity.y + movement }))
          .filter((entity) => entity.y < 112);

        for (const entity of state.entities) {
          const collision = detectRunnerCollision(entity, state.playerX, state.playerY);
          if (collision.type === "collect") {
            state.score += entity.points ?? 0;
            state.toast = {
              text: buildCollectibleToast(entity),
              until: time + 780,
            };
            state.rewardFx.push({
              id: entity.id,
              kind: entity.kind,
              lane: entity.lane,
              y: entity.y,
              startedAt: time,
              until: time + getRewardFxDuration(entity.kind),
            });
            state.entities = state.entities.filter((item) => item.id !== entity.id);
            audioRef.current?.collect(entity.kind);
            fireHaptic(entity.kind === "vipRide" ? 45 : 12);
            continue;
          }

          if (collision.type === "hazard") {
            state.iceDriftUntil = time + 620;
            state.toast = { text: "Recover", until: time + 560 };
            state.entities = state.entities.filter((item) => item.id !== entity.id);
            audioRef.current?.skid();
            fireHaptic(24);
            continue;
          }

          if (collision.type === "crash") {
            state.crashUntil = time + 780;
            state.crashKind = entity.kind;
            state.running = false;
            audioRef.current?.crash();
            fireHaptic(70);
            break;
          }
        }
      }

      drawRunnerFrame(ctx, width, height, state, time, spritesRef.current);

      if (state.toast && time > state.toast.until) {
        state.toast = null;
      }
      state.rewardFx = state.rewardFx.filter((fx) => time < fx.until);

      setScoreLabel((current) => {
        const next = Math.floor(state.score);
        return current === next ? current : next;
      });
      setToastLabel((current) => {
        const next = state.toast?.text ?? null;
        return current === next ? current : next;
      });

      if (state.crashUntil && time > state.crashUntil) {
        const snapshot: RunnerGameSnapshot = {
          score: Math.floor(state.score),
          rank: 1,
          totalRiders: 1,
          crashKind: state.crashKind,
        };
        onGameOver(snapshot);
        return;
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onGameOver]);

  return (
    <div ref={shellRef} className="runner-game-shell" onPointerDown={handlePointer}>
      <canvas ref={canvasRef} className="runner-canvas" />
      <button
        className="runner-pause-button"
        type="button"
        aria-label="Pause game"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          pauseGame();
        }}
      >
        <span className="runner-pause-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <div className="runner-hud" aria-live="polite">
        <span>Score</span>
        <strong>{scoreLabel}</strong>
        <span className="runner-hud-divider" aria-hidden="true" />
      </div>
      {menuOpen ? (
        <div
          className="runner-pause-scrim"
          onPointerDown={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Horizon pause menu"
        >
          <div className="runner-pause-panel">
            <span className="runner-pause-checker runner-pause-checker-tl" aria-hidden="true" />
            <span className="runner-pause-checker runner-pause-checker-br" aria-hidden="true" />
            <span>STREEX HORIZON</span>
            <strong>Paused</strong>
            <button type="button" onClick={resumeGame}>
              Resume
            </button>
            <button type="button" onClick={onRestart}>
              Restart
            </button>
            <button type="button" onClick={onBack}>
              Back to Streex
            </button>
          </div>
        </div>
      ) : null}
      {toastLabel ? <div className="runner-toast">{toastLabel}</div> : null}
      <div className="runner-tap-left">LEFT</div>
      <div className="runner-tap-right">RIGHT</div>
      <style>{`
        .runner-game-shell {
          position: relative;
          min-height: 100vh;
          max-width: 430px;
          margin: 0 auto;
          overflow: hidden;
          touch-action: none;
          background: #0b0b0b;
          user-select: none;
        }

        .runner-canvas {
          display: block;
          width: 100%;
          height: 100vh;
        }

        .runner-pause-button {
          position: absolute;
          top: max(18px, env(safe-area-inset-top));
          left: 16px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(230,206,32,0.42);
          background: rgba(11,11,11,0.74);
          color: #e6ce20;
          backdrop-filter: blur(12px);
          display: grid;
          place-items: center;
          padding: 0;
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(230,206,32,0.08), 0 6px 18px rgba(0,0,0,0.4);
          transition: transform 0.15s ease, background 0.2s ease;
        }

        .runner-pause-button:active {
          transform: scale(0.94);
        }

        .runner-pause-icon {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .runner-pause-icon i {
          display: block;
          width: 4px;
          height: 14px;
          background: #e6ce20;
          border-radius: 1px;
        }

        .runner-pause-scrim {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(5,5,5,0.38);
          backdrop-filter: blur(8px);
          z-index: 4;
        }

        .runner-pause-panel {
          position: relative;
          width: min(100%, 280px);
          display: grid;
          gap: 10px;
          border: 1px solid rgba(230,206,32,0.2);
          border-radius: 8px;
          background: rgba(11,11,11,0.84);
          box-shadow: 0 24px 70px rgba(0,0,0,0.42);
          padding: 18px;
          text-align: center;
        }

        .runner-pause-checker {
          position: absolute;
          width: 28px;
          height: 10px;
          background-image:
            linear-gradient(45deg, #e6ce20 25%, transparent 25%, transparent 75%, #e6ce20 75%),
            linear-gradient(45deg, #e6ce20 25%, transparent 25%, transparent 75%, #e6ce20 75%);
          background-size: 6px 6px;
          background-position: 0 0, 3px 3px;
          opacity: 0.72;
          pointer-events: none;
        }
        .runner-pause-checker-tl { top: -5px; left: 10px; }
        .runner-pause-checker-br { bottom: -5px; right: 10px; }

        .runner-pause-panel span {
          color: rgba(230,206,32,0.72);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.16em;
        }

        .runner-pause-panel strong {
          color: white;
          font-size: 22px;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .runner-pause-panel button {
          min-height: 44px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 8px;
          background: rgba(255,255,255,0.055);
          color: white;
          font-family: Montserrat, ui-sans-serif, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .runner-pause-panel button:first-of-type {
          border-color: rgba(230,206,32,0.42);
          background: #e6ce20;
          color: #0b0b0b;
        }

        .runner-hud {
          position: absolute;
          top: max(18px, env(safe-area-inset-top));
          right: 18px;
          display: grid;
          justify-items: end;
          gap: 2px;
          pointer-events: none;
        }

        .runner-hud span {
          color: rgba(255,255,255,0.42);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .runner-hud strong {
          color: #e6ce20;
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }

        .runner-hud-divider {
          margin-top: 4px;
          width: 36px;
          height: 2px;
          background: #e6ce20;
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(230,206,32,0.55);
        }

        .runner-toast {
          position: absolute;
          top: 17%;
          left: 50%;
          transform: translateX(-50%);
          min-width: 112px;
          padding: 8px 14px;
          border: 1px solid rgba(230,206,32,0.28);
          border-radius: 8px;
          background: rgba(11,11,11,0.74);
          color: #e6ce20;
          text-align: center;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          pointer-events: none;
          animation: runnerToastRise 760ms ease both;
        }

        .runner-tap-left,
        .runner-tap-right {
          position: absolute;
          bottom: max(26px, env(safe-area-inset-bottom));
          color: rgba(255,255,255,0.18);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          pointer-events: none;
        }

        .runner-tap-left { left: 22px; }
        .runner-tap-right { right: 22px; }

        @keyframes runnerToastRise {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          18% { opacity: 1; }
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

function drawRunnerFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RunnerState,
  time: number,
  sprites: RunnerLoadedSprites,
) {
  ctx.clearRect(0, 0, width, height);
  drawAmbientWorld(ctx, width, height, time, sprites);
  drawRoad(ctx, width, height, state.roadOffset, sprites);
  drawHorizonIntegration(ctx, width, height, state.roadOffset, time, sprites);
  drawDustParticles(ctx, width, height, state.roadOffset, time);
  state.entities
    .slice()
    .sort((a, b) => a.y - b.y)
    .forEach((entity) => drawEntity(ctx, width, height, entity, sprites));
  state.rewardFx.forEach((fx) => drawRewardFx(ctx, width, height, fx, time));
  const auraIntensity = computePlayerAura(state.rewardFx, time);
  drawPlayer(
    ctx,
    width,
    height,
    state.playerX,
    state.playerY,
    time,
    time < state.iceDriftUntil,
    Boolean(state.crashUntil),
    sprites,
    auraIntensity,
  );

  if (state.crashUntil) {
    drawCrashFx(ctx, width, height, state.crashKind, sprites);
  }
}

function drawAmbientWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  sprites: RunnerLoadedSprites,
) {
  const horizonY = height * RUNNER_HORIZON;
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, "#25281E");
  sky.addColorStop(0.65, "#1B2018");
  sky.addColorStop(1, "#151711");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizonY + 2);

  const glow = ctx.createRadialGradient(
    width * 0.5,
    horizonY * 0.35,
    0,
    width * 0.5,
    horizonY * 0.35,
    width * 0.72,
  );
  glow.addColorStop(0, "rgba(230,206,32,0.1)");
  glow.addColorStop(1, "rgba(230,206,32,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, horizonY);

  if (sprites.mountainFar) {
    const farZoom = 1.08 + Math.sin(time * 0.00007) * 0.015;
    const farWidth = width * farZoom;
    const farDrift = Math.sin(time * 0.00011) * width * 0.03;
    drawParallaxImage(
      ctx,
      sprites.mountainFar,
      (width - farWidth) / 2 + farDrift,
      horizonY - height * 0.215,
      farWidth,
      height * 0.32,
    );
  } else {
    drawMountainLayer(ctx, width, horizonY, height * 0.1, RUNNER_COLORS.mountainFar, time * 0.002);
  }

  if (sprites.mountainNear) {
    const nearZoom = 1.12 + Math.sin(time * 0.0001 + 0.8) * 0.02;
    const nearWidth = width * nearZoom;
    const nearDrift = Math.sin(time * 0.00016 + 1.4) * width * 0.045;
    drawParallaxImage(
      ctx,
      sprites.mountainNear,
      (width - nearWidth) / 2 + nearDrift,
      horizonY - height * 0.2,
      nearWidth,
      height * 0.38,
    );
  } else {
    drawMountainLayer(
      ctx,
      width,
      horizonY,
      height * 0.16,
      RUNNER_COLORS.mountainNear,
      time * 0.004,
    );
  }
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  peakHeight: number,
  color: string,
  offset: number,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let i = 0; i <= 7; i++) {
    const x = (width / 6) * i - (offset % 12);
    const y = horizonY - peakHeight * (0.35 + ((i * 37) % 58) / 100);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width / 12, horizonY - peakHeight * 0.22);
  }
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
  sprites: RunnerLoadedSprites,
) {
  const horizonY = height * RUNNER_HORIZON;
  const vanishingX = width * 0.5;
  const topLeft = width * 0.37;
  const topRight = width * 0.63;
  const shoulderGradient = ctx.createLinearGradient(0, horizonY, 0, height);
  shoulderGradient.addColorStop(0, "#222E20");
  shoulderGradient.addColorStop(0.48, "#182216");
  shoulderGradient.addColorStop(1, "#10140E");
  ctx.fillStyle = shoulderGradient;
  ctx.fillRect(0, horizonY, width, height - horizonY);
  drawRoadsideEcosystem(ctx, width, height, horizonY, offset, topLeft, topRight, sprites);

  const roadGradient = ctx.createLinearGradient(0, horizonY, 0, height);
  roadGradient.addColorStop(0, "#4D514B");
  roadGradient.addColorStop(0.5, "#343735");
  roadGradient.addColorStop(1, "#2B2E2D");
  ctx.fillStyle = roadGradient;
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  if (sprites.asphaltTextureClean) {
    drawAsphaltTexture(
      ctx,
      sprites.asphaltTextureClean,
      width,
      height,
      horizonY,
      offset,
      topLeft,
      topRight,
    );
  } else {
    drawAsphaltWear(ctx, width, height, horizonY, offset, topLeft, topRight);
  }

  const textureSpacing = 34;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.028)";
  ctx.lineWidth = 1;
  for (let y = horizonY + ((offset * 0.9) % textureSpacing); y < height; y += textureSpacing) {
    const progress = roadDepthProgress((y / height) * 100);
    const left = lerp(topLeft, 0, progress);
    const right = lerp(topRight, width, progress);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
  ctx.restore();

  for (let lane = 1; lane < 3; lane += 1) {
    const bottomX = (width / 3) * lane;
    const topX = vanishingX + (bottomX - vanishingX) * 0.26;
    // Dashed lane separator following projected geometry. Width and alpha grow
    // toward the camera so the lane reads as depth without changing geometry.
    const segments = 14;
    // Visual-only multiplier so dashes scroll in sync with the asphalt texture
    // near the camera. Sourced from roadOffset — never used for gameplay,
    // entities, scoring, or collisions. Tune between 1.5 and 2.0 if needed.
    const ROAD_DASH_VISUAL_SPEED = 1.75;
    const flow = ((offset * 0.012 * ROAD_DASH_VISUAL_SPEED) % 1 + 1) % 1;
    ctx.save();
    for (let i = -1; i < segments; i += 1) {
      const t0 = (i + flow) / segments;
      const t1 = t0 + 0.55 / segments;
      if (t1 <= 0 || t0 >= 1) continue;
      const a = Math.max(0, t0);
      const b = Math.min(1, t1);
      const x0 = topX + (bottomX - topX) * a;
      const y0 = horizonY + (height - horizonY) * a;
      const x1 = topX + (bottomX - topX) * b;
      const y1 = horizonY + (height - horizonY) * b;
      const depth = (a + b) * 0.5;
      ctx.strokeStyle = `rgba(235,239,236,${0.06 + depth * 0.46})`;
      ctx.lineWidth = 0.6 + depth * 2.2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Yellow rim light along projected road borders — gradient strengthens toward camera.
  const rim = ctx.createLinearGradient(0, horizonY, 0, height);
  rim.addColorStop(0, "rgba(230,206,32,0.05)");
  rim.addColorStop(0.55, "rgba(230,206,32,0.22)");
  rim.addColorStop(1, "rgba(230,206,32,0.5)");
  ctx.save();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(0, height);
  ctx.moveTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.stroke();
  ctx.restore();
}

function drawAsphaltWear(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
  topLeft: number,
  topRight: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.clip();

  const wash = ctx.createLinearGradient(0, horizonY, 0, height);
  wash.addColorStop(0, "rgba(255,255,255,0.055)");
  wash.addColorStop(0.5, "rgba(255,255,255,0.018)");
  wash.addColorStop(1, "rgba(0,0,0,0.1)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  for (let i = 0; i < 42; i += 1) {
    const seed = pseudoRandom(i, 17);
    const y = horizonY + ((offset * (0.46 + seed * 0.18) + i * 47) % (height - horizonY + 80)) - 40;
    const yPct = (y / height) * 100;
    const progress = roadDepthProgress(yPct);
    const roadLeft = lerp(topLeft, 0, progress);
    const roadRight = lerp(topRight, width, progress);
    const x = lerp(roadLeft, roadRight, 0.14 + pseudoRandom(i, 23) * 0.72);
    const markWidth = width * (0.03 + pseudoRandom(i, 41) * 0.1) * (0.25 + progress);
    const markHeight = 1 + progress * 3;

    ctx.globalAlpha = 0.035 + pseudoRandom(i, 31) * 0.035;
    ctx.fillStyle = pseudoRandom(i, 47) > 0.48 ? "#FFFFFF" : "#1D211F";
    ctx.beginPath();
    ctx.ellipse(x, y, markWidth, markHeight, 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawAsphaltTexture(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
  topLeft: number,
  topRight: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.clip();

  const textureHeight = Math.max(420, width * 2.05);
  const textureWidth = width * 1.06;
  const x = (width - textureWidth) / 2;
  const startY = horizonY - textureHeight + ((offset * 4.2) % textureHeight);

  ctx.globalAlpha = 0.68;
  for (let y = startY; y < height; y += textureHeight) {
    ctx.drawImage(image, x, y, textureWidth, textureHeight);
  }

  ctx.globalAlpha = 1;
  const wash = ctx.createLinearGradient(0, horizonY, 0, height);
  // Veil the texture near the horizon, let it breathe near the camera.
  wash.addColorStop(0, "rgba(20,22,18,0.42)");
  wash.addColorStop(0.45, "rgba(34,36,33,0.1)");
  wash.addColorStop(1, "rgba(255,255,255,0.07)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, horizonY, width, height - horizonY);
  ctx.restore();
}

function drawHorizonIntegration(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
  time: number,
  sprites: RunnerLoadedSprites,
) {
  const horizonY = height * RUNNER_HORIZON;
  if (sprites.horizonGroundBlend2) {
    const blendWidth = width * 1.24;
    const blendHeight = height * 0.34;
    const blendX = (width - blendWidth) / 2 + Math.sin(time * 0.00012) * width * 0.025;
    ctx.save();
    ctx.globalAlpha = 0.46;
    ctx.drawImage(
      sprites.horizonGroundBlend2,
      blendX,
      horizonY - blendHeight * 0.54,
      blendWidth,
      blendHeight,
    );
    ctx.restore();
  }

  const distantGround = ctx.createLinearGradient(0, horizonY - 18, 0, horizonY + height * 0.16);
  distantGround.addColorStop(0, "rgba(224,177,91,0.08)");
  distantGround.addColorStop(0.38, "rgba(63,75,48,0.36)");
  distantGround.addColorStop(1, "rgba(43,55,35,0)");
  ctx.fillStyle = distantGround;
  ctx.fillRect(0, horizonY - 18, width, height * 0.18);

  const dust = ctx.createLinearGradient(0, horizonY - 30, 0, horizonY + 76);
  dust.addColorStop(0, "rgba(230,206,32,0)");
  dust.addColorStop(0.32, "rgba(234,197,118,0.24)");
  dust.addColorStop(0.62, "rgba(101,91,59,0.2)");
  dust.addColorStop(1, "rgba(13,17,12,0)");
  ctx.fillStyle = dust;
  ctx.fillRect(0, horizonY - 30, width, 106);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "rgba(255,239,180,0.62)";
  ctx.lineWidth = 1;
  const bandOffset = (offset * 0.42 + time * 0.006) % 38;
  for (let y = horizonY + bandOffset - 38; y < horizonY + height * 0.12; y += 38) {
    const fade = Math.max(0, 1 - Math.abs(y - horizonY) / (height * 0.16));
    ctx.globalAlpha = fade * 0.12;
    ctx.beginPath();
    ctx.moveTo(width * 0.12, y);
    ctx.lineTo(width * 0.88, y + 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  playerX: number,
  playerY: number,
  time: number,
  isRecovering: boolean,
  isCrashed: boolean,
  sprites: RunnerLoadedSprites,
  auraIntensity = 0,
) {
  const x = (playerX / 100) * width;
  const y = (playerY / 100) * height;
  const carWidth = Math.min(width * 0.145, 62);
  const carHeight = carWidth * 0.58;
  const skid = isRecovering ? Math.sin(time * 0.04) * 4 : 0;

  if (auraIntensity > 0 && !isCrashed) {
    ctx.save();
    const auraRadius = Math.max(width * 0.18, 70);
    const aura = ctx.createRadialGradient(x + skid, y, 0, x + skid, y, auraRadius);
    aura.addColorStop(0, `rgba(255,235,110,${0.32 * auraIntensity})`);
    aura.addColorStop(0.45, `rgba(230,206,32,${0.18 * auraIntensity})`);
    aura.addColorStop(1, "rgba(230,206,32,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(x + skid - auraRadius, y - auraRadius, auraRadius * 2, auraRadius * 2);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(x + skid, y);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ctx.ellipse(0, carHeight * 0.52, carWidth * 0.46, carHeight * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  const playerSprite =
    isCrashed && sprites.playerRav4RearDamaged
      ? sprites.playerRav4RearDamaged
      : sprites.playerRav4Rear;

  if (playerSprite) {
    const spriteWidth = Math.min(width * 0.32, 136);
    const spriteHeight = spriteWidth * 1.02;
    ctx.drawImage(playerSprite, -spriteWidth / 2, -spriteHeight * 0.62, spriteWidth, spriteHeight);
    ctx.restore();
    return;
  }

  roundRect(ctx, -carWidth / 2, -carHeight * 0.34, carWidth, carHeight * 0.72, 5, "#D9D9D3");
  roundRect(
    ctx,
    -carWidth * 0.32,
    -carHeight * 0.74,
    carWidth * 0.64,
    carHeight * 0.42,
    5,
    "#ACB0AA",
  );
  roundRect(
    ctx,
    -carWidth * 0.23,
    -carHeight * 0.66,
    carWidth * 0.46,
    carHeight * 0.24,
    3,
    "#536675",
  );
  roundRect(
    ctx,
    -carWidth * 0.48,
    -carHeight * 0.14,
    carWidth * 0.15,
    carHeight * 0.18,
    2,
    "#D82A2A",
  );
  roundRect(
    ctx,
    carWidth * 0.33,
    -carHeight * 0.14,
    carWidth * 0.15,
    carHeight * 0.18,
    2,
    "#D82A2A",
  );

  ctx.fillStyle = RUNNER_COLORS.yellow;
  ctx.font = `800 ${Math.max(7, carWidth * 0.11)}px Montserrat, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("STREEX", 0, -carHeight * 0.52);
  ctx.restore();
}

function drawRoadsideEcosystem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
  topLeft: number,
  topRight: number,
  sprites: RunnerLoadedSprites,
) {
  const shoulder = ctx.createLinearGradient(0, horizonY, 0, height);
  shoulder.addColorStop(0, "rgba(117,102,67,0.12)");
  shoulder.addColorStop(1, "rgba(159,133,76,0.24)");

  ctx.save();
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    if (side === -1) {
      ctx.moveTo(0, horizonY);
      ctx.lineTo(topLeft, horizonY);
      ctx.lineTo(0, height);
    } else {
      ctx.moveTo(width, horizonY);
      ctx.lineTo(topRight, horizonY);
      ctx.lineTo(width, height);
    }
    ctx.closePath();
    ctx.fillStyle = shoulder;
    ctx.fill();
  }
  ctx.restore();

  drawSubtleRoadShoulder(ctx, width, height, horizonY, offset, topLeft, topRight);

  const spacing = 156;
  const scroll = (offset * 2.35) % spacing;
  for (let i = -2; i < 9; i += 1) {
    const y = horizonY + i * spacing + scroll;
    if (y < horizonY - 40 || y > height + 80) continue;

    const yPct = (y / height) * 100;
    const progress = roadDepthProgress(yPct);
    const leftRoad = lerp(topLeft, 0, progress);
    const rightRoad = lerp(topRight, width, progress);
    const scale = 0.22 + progress * 0.98;

    drawRoadsideCluster(
      ctx,
      leftRoad - width * (0.14 + pseudoRandom(i, 3) * 0.24),
      y,
      scale,
      i,
      -1,
      sprites,
    );
    drawRoadsideCluster(
      ctx,
      rightRoad + width * (0.14 + pseudoRandom(i, 9) * 0.24),
      y + spacing * 0.38,
      scale * 0.92,
      i + 13,
      1,
      sprites,
    );
  }

  const haze = ctx.createLinearGradient(0, horizonY - 24, 0, horizonY + 78);
  haze.addColorStop(0, "rgba(230,206,32,0)");
  haze.addColorStop(0.48, "rgba(124,116,78,0.18)");
  haze.addColorStop(1, "rgba(16,20,14,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizonY - 24, width, 102);
}

function drawSubtleRoadShoulder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
  topLeft: number,
  topRight: number,
) {
  ctx.save();
  for (const side of ["left", "right"] as const) {
    const shoulderGradient = ctx.createLinearGradient(0, horizonY, 0, height);
    shoulderGradient.addColorStop(0, "rgba(173,151,95,0.08)");
    shoulderGradient.addColorStop(0.55, "rgba(125,101,62,0.18)");
    shoulderGradient.addColorStop(1, "rgba(91,76,48,0.24)");
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    if (side === "left") {
      ctx.moveTo(topLeft, horizonY);
      ctx.lineTo(topLeft - width * 0.018, horizonY);
      ctx.lineTo(width * 0.08, height);
      ctx.lineTo(0, height);
    } else {
      ctx.moveTo(topRight, horizonY);
      ctx.lineTo(topRight + width * 0.018, horizonY);
      ctx.lineTo(width * 0.92, height);
      ctx.lineTo(width, height);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(230,206,32,0.11)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(0, height);
  ctx.moveTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let y = horizonY + ((offset * 1.35) % 48); y < height; y += 48) {
    const yPct = (y / height) * 100;
    const progress = roadDepthProgress(yPct);
    const leftInner = lerp(topLeft, 0, progress);
    const rightInner = lerp(topRight, width, progress);
    ctx.beginPath();
    ctx.moveTo(leftInner - width * (0.02 + progress * 0.08), y);
    ctx.lineTo(leftInner, y);
    ctx.moveTo(rightInner, y);
    ctx.lineTo(rightInner + width * (0.02 + progress * 0.08), y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoadsideCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  seed: number,
  side: -1 | 1,
  sprites: RunnerLoadedSprites,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(side, 1);
  ctx.globalAlpha = Math.min(0.88, 0.28 + scale * 0.42);

  const variant = seed % 5;
  const scrubSprite =
    variant === 0
      ? sprites.roadsideTreeCluster01
      : variant === 1
        ? sprites.roadsideRockCluster
        : variant % 2 === 0
          ? sprites.roadsideScrub01
          : sprites.roadsideScrub02;
  if (scrubSprite) {
    const scrubWidth = 82 * scale;
    const scrubHeight = scrubWidth * 1.15;
    ctx.drawImage(scrubSprite, -scrubWidth / 2, -scrubHeight * 0.62, scrubWidth, scrubHeight);
    ctx.restore();
    return;
  }

  const bushWidth = 30 * scale;
  const bushHeight = 12 * scale;
  ctx.fillStyle = seed % 3 === 0 ? "#384731" : seed % 3 === 1 ? "#465032" : "#59613D";
  ctx.beginPath();
  ctx.ellipse(0, 0, bushWidth, bushHeight, -0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(134,111,72,0.48)";
  ctx.beginPath();
  ctx.ellipse(18 * scale, 8 * scale, 16 * scale, 6 * scale, 0.18, 0, Math.PI * 2);
  ctx.fill();

  if (seed % 4 === 0) {
    ctx.fillStyle = "rgba(42,51,34,0.72)";
    ctx.beginPath();
    ctx.ellipse(-20 * scale, -8 * scale, 9 * scale, 28 * scale, -0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawRewardFx(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fx: RunnerRewardFx,
  time: number,
) {
  const lifetime = fx.until - fx.startedAt;
  const progress = Math.max(0, Math.min(1, (time - fx.startedAt) / lifetime));
  const alpha = 1 - progress;
  const x = roadLaneCenterX(width, fx.lane, fx.y);
  const y = (fx.y / 100) * height + progress * height * 0.035;
  const isVip = fx.kind === "vipRide";
  const isAirport = fx.kind === "airportRide";
  const isPassenger = fx.kind === "passengerPickup";
  const base = isVip
    ? width * 0.22
    : isAirport
      ? width * 0.17
      : isPassenger
        ? width * 0.14
        : width * 0.11;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = isVip ? "rgba(255,230,84,0.92)" : "rgba(230,206,32,0.78)";
  ctx.lineWidth = isVip ? 3 : 2;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    base * (0.26 + progress * 0.82),
    base * (0.12 + progress * 0.34),
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  const glow = ctx.createRadialGradient(x, y, 0, x, y, base * (0.7 + progress * 0.55));
  glow.addColorStop(0, isVip ? "rgba(255,235,110,0.36)" : "rgba(230,206,32,0.26)");
  glow.addColorStop(1, "rgba(230,206,32,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - base, y - base, base * 2, base * 2);

  if (isAirport || isVip) {
    ctx.strokeStyle = isVip ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.48)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + progress * 0.5;
      const inner = base * (0.16 + progress * 0.2);
      const outer = base * (0.38 + progress * 0.7);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
      ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawEntity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  entity: RunnerEntity,
  sprites: RunnerLoadedSprites,
) {
  const progress = roadDepthProgress(entity.y);
  const x = roadLaneCenterX(width, entity.lane, entity.y);
  const y = (entity.y / 100) * height;
  const scale = 0.26 + progress * 0.98;
  const baseSize = Math.min(width * 0.2, 82) * scale;
  const size = entity.type === "collectible" ? baseSize * 0.96 : baseSize * 1.08;

  drawGroundShadow(ctx, x, y, size, entity.type === "collectible" ? 0.32 : 0.52, sprites);

  if (entity.type === "collectible") {
    drawCollectible(ctx, x, y, size, entity.kind, sprites);
    return;
  }

  if (entity.kind === "ice") {
    if (sprites.icePatch) {
      drawSpriteCentered(ctx, sprites.icePatch, x, y, size * 1.52, size * 0.86);
    } else {
      drawIce(ctx, x, y, size);
    }
    return;
  }

  if (entity.kind === "construction") {
    const constructionSprite =
      entity.id % 2 === 0 ? sprites.coneCluster : sprites.constructionBarrier;
    if (constructionSprite) {
      drawSpriteCentered(ctx, constructionSprite, x, y, size * 1.18, size * 1.1);
    } else {
      drawConstruction(ctx, x, y, size);
    }
    return;
  }

  if (entity.kind === "deer" || entity.kind === "moose") {
    const wildlifeSprite = entity.kind === "moose" ? sprites.moose : sprites.deer;
    if (wildlifeSprite) {
      drawSpriteCentered(ctx, wildlifeSprite, x, y, size * 1.24, size * 1.1);
    } else {
      drawWildlife(ctx, x, y, size, entity.kind === "moose");
    }
    return;
  }

  if (entity.kind === "sedan" && sprites.trafficSedan) {
    const sedanSprite =
      entity.id % 5 === 0
        ? (sprites.trafficSport ?? sprites.trafficSedan)
        : entity.id % 4 === 0
          ? (sprites.sedanVip ?? sprites.trafficSedan)
          : sprites.trafficSedan;
    drawSpriteCentered(ctx, sedanSprite, x, y, size * 1.22, size * 1.2);
    return;
  }

  if (entity.kind === "suv" && sprites.trafficSuv) {
    drawSpriteCentered(ctx, sprites.trafficSuv, x, y, size * 1.22, size * 1.2);
    return;
  }

  if (entity.kind === "pickup" && sprites.trafficPickup) {
    const pickupSprite =
      entity.id % 3 === 0
        ? (sprites.trafficPickupSilver ?? sprites.trafficPickup)
        : sprites.trafficPickup;
    drawSpriteCentered(ctx, pickupSprite, x, y, size * 1.24, size * 1.2);
    return;
  }

  if (entity.kind === "liftedTruck" && sprites.liftedTruck) {
    drawSpriteCentered(ctx, sprites.liftedTruck, x, y, size * 1.36, size * 1.28);
    return;
  }

  drawTraffic(ctx, x, y, size, entity.kind);
}

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  kind: RunnerEntity["kind"],
  sprites: RunnerLoadedSprites,
) {
  ctx.save();
  ctx.shadowColor =
    kind === "vipRide"
      ? "rgba(255,216,82,0.72)"
      : kind === "passengerPickup"
        ? "#FFFFFF"
        : RUNNER_COLORS.yellow;
  ctx.shadowBlur =
    kind === "vipRide" ? 7 : kind === "airportRide" ? 13 : kind === "passengerPickup" ? 4 : 10;
  ctx.fillStyle = RUNNER_COLORS.yellow;

  if (sprites.collectGlow) {
    const glowScale =
      kind === "vipRide"
        ? 1.04
        : kind === "airportRide"
          ? 1.62
          : kind === "passengerPickup"
            ? 0.72
            : 1.18;
    ctx.save();
    ctx.globalAlpha =
      kind === "vipRide"
        ? 0.52
        : kind === "passengerPickup"
          ? 0.28
          : kind === "airportRide"
            ? 0.78
            : 0.58;
    drawSpriteCentered(ctx, sprites.collectGlow, x, y, size * glowScale, size * glowScale);
    ctx.restore();
  }

  if (kind === "reputationStar" && sprites.reputationStar) {
    drawSpriteCentered(ctx, sprites.reputationStar, x, y, size * 0.9, size * 0.9);
  } else if (kind === "passengerPickup" && sprites.passengerPickup) {
    drawSpriteCentered(ctx, sprites.passengerPickup, x, y, size * 1.18, size * 1.18);
  } else if (kind === "airportRide" && sprites.airportRide) {
    drawSpriteCentered(ctx, sprites.airportRide, x, y, size * 1.48, size * 1.34);
  } else if (kind === "vipRide" && sprites.vipRide) {
    drawSpriteCentered(ctx, sprites.vipRide, x, y, size * 1.14, size * 1.04);
  } else if (kind === "vipRide") {
    drawDiamond(ctx, x, y, size * 0.55);
  } else if (kind === "airportRide") {
    drawTerminal(ctx, x, y, size * 0.7);
  } else if (kind === "passengerPickup") {
    drawPassenger(ctx, x, y, size * 0.62);
  } else {
    drawStar(ctx, x, y, size * 0.52);
  }

  ctx.restore();
}

function drawTraffic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  kind: RunnerEntity["kind"],
) {
  const width = kind === "liftedTruck" ? size * 1.16 : size;
  const height = kind === "pickup" || kind === "liftedTruck" ? size * 0.68 : size * 0.58;
  const color =
    kind === "suv"
      ? "#4E5952"
      : kind === "pickup"
        ? "#6B604E"
        : kind === "liftedTruck"
          ? "#3A342B"
          : "#545B63";

  roundRect(ctx, x - width / 2, y - height / 2, width, height, 4, color);
  roundRect(ctx, x - width * 0.35, y - height * 0.35, width * 0.7, height * 0.3, 3, "#14191A");
  roundRect(ctx, x - width * 0.45, y + height * 0.19, width * 0.16, height * 0.16, 2, "#E9DFCB");
  roundRect(ctx, x + width * 0.29, y + height * 0.19, width * 0.16, height * 0.16, 2, "#E9DFCB");
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x - width * 0.38, y - height * 0.05, width * 0.76, Math.max(1, height * 0.04));
}

function drawConstruction(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#D58B28";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55);
  ctx.lineTo(x - size * 0.42, y + size * 0.38);
  ctx.lineTo(x + size * 0.42, y + size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillRect(x - size * 0.22, y - size * 0.03, size * 0.44, size * 0.08);
  ctx.fillRect(x - size * 0.3, y + size * 0.22, size * 0.6, size * 0.08);
}

function drawIce(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.74);
  gradient.addColorStop(0, "rgba(210,235,255,0.42)");
  gradient.addColorStop(1, "rgba(210,235,255,0.04)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.74, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.stroke();
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  intensity: number,
  sprites: RunnerLoadedSprites,
) {
  ctx.save();
  if (sprites.shadowSoft) {
    ctx.globalAlpha = Math.min(0.75, intensity + 0.12);
    drawSpriteCentered(ctx, sprites.shadowSoft, x, y + size * 0.28, size * 1.05, size * 0.42);
  } else {
    ctx.fillStyle = `rgba(0,0,0,${intensity})`;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.28, size * 0.46, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWildlife(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isMoose: boolean,
) {
  ctx.fillStyle = isMoose ? "#2E251E" : "#6B4A30";
  ctx.beginPath();
  ctx.ellipse(x, y, size * (isMoose ? 0.48 : 0.36), size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.32, y - size * 0.2, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(230,206,32,0.66)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.36, y - size * 0.34);
  ctx.lineTo(x + size * 0.52, y - size * 0.54);
  ctx.moveTo(x + size * 0.32, y - size * 0.34);
  ctx.lineTo(x + size * 0.18, y - size * 0.54);
  ctx.stroke();
}

function drawCrashFx(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  crashKind: RunnerEntity["kind"] | null,
  _sprites: RunnerLoadedSprites,
) {
  ctx.fillStyle = "rgba(255,45,45,0.055)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(11,11,11,0.3)";
  ctx.fillRect(0, 0, width, height);

  const impact = ctx.createRadialGradient(
    width / 2,
    height * 0.66,
    0,
    width / 2,
    height * 0.66,
    width * 0.44,
  );
  impact.addColorStop(0, "rgba(230,206,32,0.22)");
  impact.addColorStop(0.2, "rgba(230,206,32,0.08)");
  impact.addColorStop(1, "rgba(230,206,32,0)");
  ctx.fillStyle = impact;
  ctx.fillRect(0, height * 0.42, width, height * 0.42);

  ctx.fillStyle = RUNNER_COLORS.yellow;
  ctx.font = "900 13px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = crashKind
    ? RUNNER_OBSTACLE_LABELS[crashKind as keyof typeof RUNNER_OBSTACLE_LABELS]
    : "road";
  ctx.fillText(`IMPACT: ${label}`, width / 2, height * 0.2);
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : radius * 0.43;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPassenger(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.22, size * 0.35, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTerminal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  roundRect(
    ctx,
    x - size * 0.46,
    y - size * 0.2,
    size * 0.92,
    size * 0.58,
    3,
    RUNNER_COLORS.yellow,
  );
  ctx.fillStyle = RUNNER_COLORS.black;
  ctx.fillRect(x - size * 0.3, y - size * 0.02, size * 0.14, size * 0.14);
  ctx.fillRect(x - size * 0.07, y - size * 0.02, size * 0.14, size * 0.14);
  ctx.fillRect(x + size * 0.16, y - size * 0.02, size * 0.14, size * 0.14);
  ctx.fillStyle = RUNNER_COLORS.yellow;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.48);
  ctx.lineTo(x - size * 0.2, y - size * 0.2);
  ctx.lineTo(x + size * 0.2, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.8, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.8, y);
  ctx.closePath();
  ctx.fill();
}

function drawSpriteCentered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
}

function drawParallaxImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.drawImage(image, x, y, width, height);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function roadLaneCenterX(width: number, lane: number, yPct: number) {
  const progress = roadDepthProgress(yPct);
  const topRoadLeft = width * 0.37;
  const topRoadWidth = width * 0.26;
  const topX = topRoadLeft + topRoadWidth * ((lane + 0.5) / 3);
  const bottomLaneCenters = [0.25, 0.5, 0.75];
  const bottomX = (bottomLaneCenters[lane] ?? laneCenter(lane) / 100) * width;
  return lerp(topX, bottomX, progress);
}

function roadDepthProgress(yPct: number) {
  const horizonPct = RUNNER_HORIZON * 100;
  const raw = Math.max(0, Math.min(1, (yPct - horizonPct) / (100 - horizonPct)));
  return raw * raw * (3 - 2 * raw);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function pseudoRandom(seed: number, salt: number) {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawDustParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
  time: number,
) {
  const horizonY = height * RUNNER_HORIZON;
  const bandHeight = height - horizonY;
  if (bandHeight <= 0) return;
  ctx.save();
  ctx.fillStyle = "rgba(234,210,140,0.42)";
  for (let i = 0; i < DUST_PARTICLES.length; i += 1) {
    const p = DUST_PARTICLES[i];
    // Deterministic vertical scroll driven by time + roadOffset (no Math.random).
    const travel = (time * 0.00018 * p.speed + offset * 0.0035 + p.phase) % 1;
    const t = (travel + 1) % 1;
    const y = horizonY + t * bandHeight;
    const depth = t; // 0 near horizon, 1 near camera
    const driftWidth = 0.04 + depth * 0.6;
    const x = (p.xPct - 0.5) * width * driftWidth + width * 0.5
      + Math.sin((time * 0.0005 + p.phase) * Math.PI * 2) * (4 + depth * 10);
    const radius = p.size * (0.4 + depth * 1.4);
    ctx.globalAlpha = 0.08 + depth * 0.32;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function computePlayerAura(
  rewardFx: RunnerRewardFx[],
  time: number,
) {
  if (rewardFx.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < rewardFx.length; i += 1) {
    const fx = rewardFx[i];
    const lifetime = fx.until - fx.startedAt;
    if (lifetime <= 0) continue;
    const t = (time - fx.startedAt) / lifetime;
    if (t < 0 || t > 1) continue;
    const fade = 1 - t;
    const weight = fx.kind === "vipRide" ? 1.4 : fx.kind === "airportRide" ? 1.1 : 0.85;
    total += fade * weight;
  }
  return Math.min(1, total);
}

function getRewardFxDuration(kind: RunnerEntity["kind"]) {
  if (kind === "vipRide") return 1180;
  if (kind === "airportRide") return 980;
  if (kind === "passengerPickup") return 820;
  return 680;
}

function buildCollectibleToast(entity: RunnerEntity) {
  const points = entity.points ?? 0;
  if (entity.kind === "vipRide") return `VIP +${points}`;
  if (entity.kind === "airportRide") return `Airport +${points}`;
  if (entity.kind === "passengerPickup") return `Passenger +${points}`;
  return `Reputation +${points}`;
}

function fireHaptic(duration: number) {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}
