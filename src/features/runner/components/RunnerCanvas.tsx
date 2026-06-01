import { useCallback, useEffect, useRef, useState } from "react";
import { RUNNER_COLORS, RUNNER_HORIZON, RUNNER_OBSTACLE_LABELS } from "../runner.config";
import type { RunnerControls, RunnerEntity, RunnerGameSnapshot, RunnerLane } from "../runner.types";
import { RUNNER_SPRITES, type RunnerSpriteKey } from "../assets/manifest";
import { detectRunnerCollision, laneCenter } from "../engine/collision";
import { getDifficulty } from "../engine/difficulty";
import { createSpawnMemory, createSpawnWave } from "../engine/spawnEngine";

type RunnerLoadedSprites = Partial<Record<RunnerSpriteKey, HTMLImageElement>>;

type RunnerState = {
  running: boolean;
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
};

export function RunnerCanvas({ onGameOver }: RunnerControls) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const memoryRef = useRef(createSpawnMemory());
  const animationRef = useRef<number | null>(null);
  const spritesRef = useRef<RunnerLoadedSprites>({});
  const [scoreLabel, setScoreLabel] = useState(0);
  const [toastLabel, setToastLabel] = useState<string | null>(null);

  const stateRef = useRef<RunnerState>({
    running: true,
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
  });

  const move = useCallback((direction: -1 | 1) => {
    const state = stateRef.current;
    if (!state.running || state.crashUntil) return;
    const nextLane = Math.max(0, Math.min(2, state.targetLane + direction)) as RunnerLane;
    state.targetLane = nextLane;
  }, []);

  const handlePointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
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
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

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
            state.entities = state.entities.filter((item) => item.id !== entity.id);
            fireHaptic(entity.kind === "vipRide" ? 45 : 12);
            continue;
          }

          if (collision.type === "hazard") {
            state.iceDriftUntil = time + 620;
            state.toast = { text: "Recover", until: time + 560 };
            state.entities = state.entities.filter((item) => item.id !== entity.id);
            fireHaptic(24);
            continue;
          }

          if (collision.type === "crash") {
            state.crashUntil = time + 780;
            state.crashKind = entity.kind;
            state.running = false;
            fireHaptic(70);
            break;
          }
        }
      }

      drawRunnerFrame(ctx, width, height, state, time, spritesRef.current);

      if (state.toast && time > state.toast.until) {
        state.toast = null;
      }

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
          rank: Math.max(1, 48 - Math.floor(state.score / 18)),
          aboveRiders: Math.max(0, Math.floor(state.score * 0.82) + 17),
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
      <div className="runner-hud" aria-live="polite">
        <span>Score</span>
        <strong>{scoreLabel}</strong>
      </div>
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

        .runner-hud {
          position: absolute;
          top: max(18px, env(safe-area-inset-top));
          right: 18px;
          display: grid;
          justify-items: end;
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
  state.entities
    .slice()
    .sort((a, b) => a.y - b.y)
    .forEach((entity) => drawEntity(ctx, width, height, entity, sprites));
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
  sky.addColorStop(0, "#20251F");
  sky.addColorStop(0.65, "#161A16");
  sky.addColorStop(1, "#11110F");
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
    drawParallaxImage(ctx, sprites.mountainFar, 0, horizonY - height * 0.21, width, height * 0.32);
  } else {
    drawMountainLayer(ctx, width, horizonY, height * 0.1, RUNNER_COLORS.mountainFar, time * 0.002);
  }

  if (sprites.mountainNear) {
    drawParallaxImage(ctx, sprites.mountainNear, 0, horizonY - height * 0.2, width, height * 0.38);
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
  shoulderGradient.addColorStop(0, "#171812");
  shoulderGradient.addColorStop(1, "#080807");
  ctx.fillStyle = shoulderGradient;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  const roadGradient = ctx.createLinearGradient(0, horizonY, 0, height);
  roadGradient.addColorStop(0, RUNNER_COLORS.roadLight);
  roadGradient.addColorStop(1, RUNNER_COLORS.road);
  ctx.fillStyle = roadGradient;
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  if (sprites.roadTexture) {
    ctx.save();
    ctx.clip();
    drawScrollingRoadTexture(ctx, sprites.roadTexture, width, height, horizonY, offset);
    ctx.restore();
  } else {
    ctx.fill();
  }

  if (sprites.roadEdgeAlt) {
    drawRoadEdges(ctx, sprites.roadEdgeAlt, width, height, horizonY, offset);
  }

  const textureSpacing = 18;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  for (let y = horizonY + ((offset * 1.2) % textureSpacing); y < height; y += textureSpacing) {
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
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    ctx.setLineDash([22, 18]);
    ctx.lineDashOffset = -offset;
    ctx.beginPath();
    ctx.moveTo(topX, horizonY);
    ctx.lineTo(bottomX, height);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(230,206,32,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(topLeft, horizonY);
  ctx.lineTo(0, height);
  ctx.moveTo(topRight, horizonY);
  ctx.lineTo(width, height);
  ctx.stroke();
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
) {
  const x = (playerX / 100) * width;
  const y = (playerY / 100) * height;
  const carWidth = Math.min(width * 0.18, 76);
  const carHeight = carWidth * 0.58;
  const skid = isRecovering ? Math.sin(time * 0.04) * 4 : 0;

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
    const spriteWidth = Math.min(width * 0.42, 176);
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
  const scale = 0.22 + progress * 0.92;
  const size = Math.min(width * 0.18, 72) * scale;

  drawGroundShadow(ctx, x, y, size, entity.type === "collectible" ? 0.32 : 0.52, sprites);

  if (entity.type === "collectible") {
    drawCollectible(ctx, x, y, size, entity.kind, sprites);
    return;
  }

  if (entity.kind === "ice") {
    if (sprites.icePatch) {
      drawSpriteCentered(ctx, sprites.icePatch, x, y, size * 1.55, size * 0.88);
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
      drawSpriteCentered(ctx, wildlifeSprite, x, y, size * 1.26, size * 1.12);
    } else {
      drawWildlife(ctx, x, y, size, entity.kind === "moose");
    }
    return;
  }

  if (entity.kind === "sedan" && sprites.trafficSedan) {
    drawSpriteCentered(ctx, sprites.trafficSedan, x, y, size * 1.2, size * 1.18);
    return;
  }

  if (entity.kind === "suv" && sprites.trafficSuv) {
    drawSpriteCentered(ctx, sprites.trafficSuv, x, y, size * 1.2, size * 1.18);
    return;
  }

  if (entity.kind === "pickup" && sprites.trafficPickup) {
    drawSpriteCentered(ctx, sprites.trafficPickup, x, y, size * 1.22, size * 1.18);
    return;
  }

  if (entity.kind === "liftedTruck" && sprites.liftedTruck) {
    drawSpriteCentered(ctx, sprites.liftedTruck, x, y, size * 1.36, size * 1.26);
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
  ctx.shadowColor = RUNNER_COLORS.yellow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = RUNNER_COLORS.yellow;

  if (sprites.collectGlow) {
    drawSpriteCentered(ctx, sprites.collectGlow, x, y, size * 1.42, size * 1.42);
  }

  if (kind === "reputationStar" && sprites.reputationStar) {
    drawSpriteCentered(ctx, sprites.reputationStar, x, y, size * 1.05, size * 1.05);
  } else if (kind === "passengerPickup" && sprites.passengerPickup) {
    drawSpriteCentered(ctx, sprites.passengerPickup, x, y, size * 1.04, size * 1.04);
  } else if (kind === "airportRide" && sprites.airportRide) {
    drawSpriteCentered(ctx, sprites.airportRide, x, y, size * 1.12, size * 1.02);
  } else if (kind === "vipRide" && sprites.vipRide) {
    drawSpriteCentered(ctx, sprites.vipRide, x, y, size * 1.16, size * 1.06);
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
  sprites: RunnerLoadedSprites,
) {
  ctx.fillStyle = "rgba(255,45,45,0.13)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(11,11,11,0.42)";
  ctx.fillRect(0, 0, width, height);
  if (sprites.skidMarksAlt) {
    ctx.save();
    ctx.globalAlpha = 0.52;
    drawSpriteCentered(
      ctx,
      sprites.skidMarksAlt,
      width / 2,
      height * 0.74,
      width * 0.72,
      width * 0.42,
    );
    ctx.restore();
  }
  if (sprites.crashFlash) {
    ctx.save();
    ctx.globalAlpha = 0.76;
    drawSpriteCentered(
      ctx,
      sprites.crashFlash,
      width / 2,
      height * 0.57,
      width * 0.72,
      width * 0.5,
    );
    ctx.restore();
  }
  ctx.fillStyle = RUNNER_COLORS.yellow;
  ctx.font = "900 16px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = crashKind
    ? RUNNER_OBSTACLE_LABELS[crashKind as keyof typeof RUNNER_OBSTACLE_LABELS]
    : "road";
  ctx.fillText(`Crash: ${label}`, width / 2, height * 0.2);
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

function drawScrollingRoadTexture(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
) {
  const textureHeight = Math.max(260, width * 1.25);
  const textureWidth = width * 1.4;
  const x = (width - textureWidth) / 2;
  const startY = horizonY - textureHeight + ((offset * 4) % textureHeight);

  for (let y = startY; y < height; y += textureHeight) {
    ctx.drawImage(image, x, y, textureWidth, textureHeight);
  }

  const shade = ctx.createLinearGradient(0, horizonY, 0, height);
  shade.addColorStop(0, "rgba(11,11,11,0.38)");
  shade.addColorStop(0.55, "rgba(11,11,11,0)");
  shade.addColorStop(1, "rgba(11,11,11,0.26)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, horizonY, width, height - horizonY);
}

function drawRoadEdges(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  horizonY: number,
  offset: number,
) {
  const edgeWidth = width * 0.32;
  const edgeHeight = Math.max(280, width * 1.35);
  const startY = horizonY - edgeHeight + ((offset * 5) % edgeHeight);

  ctx.save();
  ctx.globalAlpha = 0.58;
  for (let y = startY; y < height; y += edgeHeight) {
    ctx.drawImage(image, -edgeWidth * 0.48, y, edgeWidth, edgeHeight);
    ctx.save();
    ctx.translate(width + edgeWidth * 0.48, y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0, edgeWidth, edgeHeight);
    ctx.restore();
  }
  ctx.restore();
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
  const bottomX = (laneCenter(lane) / 100) * width;
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
