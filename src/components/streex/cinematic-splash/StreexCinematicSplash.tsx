import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  HERO_SHIFT,
  LETTERS_TRANSFORM,
  LOGO_VIEWBOX,
  STREE_PATH,
  WHITE_POINTS,
  X_GEOMETRY,
  YELLOW_POINTS,
} from "./logo";
import "./streex-cinematic-splash.css";

export type CinematicSplashVariant = "full" | "short";

export interface StreexCinematicSplashProps {
  variant?: CinematicSplashVariant;
  ready?: boolean;
  tagline?: string;
  onHandoff?: () => void;
  onComplete?: () => void;
}

const EASE = {
  ridesIn: "cubic-bezier(0.06, 0.92, 0.08, 1)",
  settle: "cubic-bezier(0.22, 1, 0.24, 1)",
  wipe: "cubic-bezier(0.32, 0.94, 0.18, 1)",
  retract: "cubic-bezier(0.62, 0.02, 0.32, 1)",
};

const TIMINGS = {
  full: {
    lineAt: 200,
    lineDur: 720,
    whiteAt: 500,
    whiteDur: 460,
    impactAt: 980,
    impactDur: 320,
    revealAt: 1350,
    revealDur: 520,
    glintAt: 1830,
    glintDur: 420,
    productAt: 1800,
    productDur: 400,
    exitAt: 2180,
    exitDur: 460,
  },
  short: {
    lineAt: 40,
    lineDur: 270,
    whiteAt: 120,
    whiteDur: 198,
    impactAt: 340,
    impactDur: 180,
    revealAt: 400,
    revealDur: 240,
    glintAt: 560,
    glintDur: 240,
    productAt: 470,
    productDur: 200,
    exitAt: 640,
    exitDur: 240,
  },
} as const;

const reducedMotionMs = 260;
const IDENTITY = "translate(0,0) rotate(0deg) scale(1,1)";

export function StreexCinematicSplash({
  variant = "full",
  ready = true,
  tagline = "Private rides. Elevated.",
  onHandoff,
  onComplete,
}: StreexCinematicSplashProps) {
  const timing = TIMINGS[variant];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<SVGGElement>(null);
  const wipeRef = useRef<SVGPolygonElement>(null);
  const xRef = useRef<SVGGElement>(null);
  const yellowRef = useRef<SVGGElement>(null);
  const whiteRef = useRef<SVGPolygonElement>(null);
  const glintRef = useRef<SVGRectElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<SVGGElement>(null);
  const animations = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const idleRef = useRef<Animation | null>(null);
  const readyRef = useRef(ready);
  const exitedRef = useRef(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const add = useCallback(
    (element: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      if (!element) return null;
      const animation = element.animate(keyframes, { fill: "both", ...options });
      animations.current.push(animation);
      return animation;
    },
    [],
  );

  const exit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    idleRef.current?.cancel();
    const duration = reduced ? Math.round(reducedMotionMs * 0.7) : timing.exitDur;
    if (reduced) {
      add(rootRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration, easing: EASE.settle });
    } else {
      if (variant === "full") {
        add(
          columnRef.current,
          [
            { transform: "translate3d(0,0,0) scale(1)" },
            {
              transform: "translate3d(0, calc(-50vh + 88px), 0) scale(0.8)",
            },
          ],
          { duration, easing: EASE.settle },
        );
        onHandoff?.();
      }
      add(
        stageRef.current,
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.045)", opacity: 0, offset: 0.6 },
          { transform: "scale(1.06)", opacity: 0 },
        ],
        { duration, easing: EASE.retract },
      );
      add(
        panelARef.current,
        [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(-118%, 58%, 0)" }],
        { duration, easing: EASE.retract },
      );
      add(
        panelBRef.current,
        [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(118%, -58%, 0)" }],
        { duration, easing: EASE.retract },
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        rootRef.current?.setAttribute("data-done", "true");
        onComplete?.();
      }, duration),
    );
  }, [add, onComplete, onHandoff, reduced, timing.exitDur, variant]);

  const beginIdle = useCallback(() => {
    if (exitedRef.current || idleRef.current || reduced) return;
    idleRef.current =
      xRef.current?.animate(
        [
          { filter: "drop-shadow(0 0 0px var(--sx-glow))" },
          { filter: "drop-shadow(0 0 16px var(--sx-glow))" },
          { filter: "drop-shadow(0 0 0px var(--sx-glow))" },
        ],
        { duration: 2200, iterations: Infinity, easing: "ease-in-out" },
      ) ?? null;
  }, [reduced]);

  useEffect(() => {
    readyRef.current = ready;
    if (ready && rootRef.current?.getAttribute("data-gate") === "open") exit();
  }, [exit, ready]);

  useEffect(() => {
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    idleRef.current?.cancel();
    idleRef.current = null;
    exitedRef.current = false;
    rootRef.current?.removeAttribute("data-done");
    rootRef.current?.removeAttribute("data-gate");
    const coverTo = LOGO_VIEWBOX.w + 380;

    if (reduced) {
      add(stageRef.current, [{ opacity: 0 }, { opacity: 1 }], {
        duration: Math.round(reducedMotionMs * 0.6),
        easing: EASE.settle,
      });
      add(wipeRef.current, [{ transform: `translate(${coverTo}px,0)` }], { duration: 1 });
      add(wordRef.current, [{ transform: "translate(0,0)" }], { duration: 1 });
      add(yellowRef.current, [{ transform: IDENTITY, opacity: 1 }], { duration: 1 });
      add(whiteRef.current, [{ transform: IDENTITY, opacity: 1 }], { duration: 1 });
      add(productRef.current, [{ opacity: 1 }], { duration: 1 });
      timers.current.push(
        window.setTimeout(() => {
          rootRef.current?.setAttribute("data-gate", "open");
          if (readyRef.current) exit();
        }, reducedMotionMs),
      );
    } else {
      add(
        yellowRef.current,
        [
          {
            transform: `translate(-1040px,0) rotate(${-X_GEOMETRY.yellowAngle}deg) scale(6, 0.15)`,
            opacity: 0,
          },
          {
            transform: `translate(-780px,0) rotate(${-X_GEOMETRY.yellowAngle}deg) scale(6, 0.15)`,
            opacity: 1,
            offset: 0.07,
          },
          {
            transform: `translate(-140px,0) rotate(${-X_GEOMETRY.yellowAngle}deg) scale(2.1, 0.22)`,
            opacity: 1,
            offset: 0.5,
          },
          {
            transform: "translate(-10px,0) rotate(-48deg) scale(1.24, 0.6)",
            opacity: 1,
            offset: 0.74,
          },
          { transform: IDENTITY, opacity: 1 },
        ],
        { duration: timing.lineDur, delay: timing.lineAt, easing: EASE.ridesIn },
      );
      add(
        whiteRef.current,
        [
          {
            transform: `translate(760px,0) rotate(${-X_GEOMETRY.whiteAngle}deg) scale(3.4, 0.2)`,
            opacity: 0,
          },
          {
            transform: `translate(560px,0) rotate(${-X_GEOMETRY.whiteAngle}deg) scale(3.4, 0.2)`,
            opacity: 1,
            offset: 0.1,
          },
          {
            transform: `translate(90px,0) rotate(${-X_GEOMETRY.whiteAngle}deg) scale(1.4, 0.4)`,
            opacity: 1,
            offset: 0.58,
          },
          { transform: IDENTITY, opacity: 1 },
        ],
        { duration: timing.whiteDur, delay: timing.whiteAt, easing: EASE.ridesIn },
      );
      accentRef.current?.querySelectorAll<SVGElement>("[data-accent]").forEach((element, index) =>
        add(
          element,
          [
            { transform: `translate(${-980 + index * 60}px,0)`, opacity: 0 },
            { transform: `translate(${-520 + index * 60}px,0)`, opacity: 0.85, offset: 0.35 },
            { transform: `translate(${-40 + index * 24}px,0)`, opacity: 0 },
          ],
          {
            duration: Math.round(timing.lineDur * 0.8),
            delay: timing.lineAt + index * 46,
            easing: EASE.ridesIn,
          },
        ),
      );
      add(
        xRef.current,
        [
          { transform: "scale(1)", filter: "drop-shadow(0 0 0 var(--sx-glow))" },
          {
            transform: "scale(1.045)",
            filter: "drop-shadow(0 0 22px var(--sx-glow))",
            offset: 0.22,
          },
          { transform: "scale(0.995)", offset: 0.6 },
          { transform: "scale(1)", filter: "drop-shadow(0 0 0 var(--sx-glow))" },
        ],
        { duration: timing.impactDur, delay: timing.impactAt, easing: EASE.settle },
      );
      add(
        wordRef.current,
        [{ transform: `translate(${HERO_SHIFT}px,0)` }, { transform: "translate(0,0)" }],
        { duration: timing.revealDur, delay: timing.revealAt, easing: EASE.wipe },
      );
      add(
        wipeRef.current,
        [{ transform: "translate(0,0)" }, { transform: `translate(${coverTo}px,0)` }],
        { duration: timing.revealDur, delay: timing.revealAt, easing: EASE.wipe },
      );
      add(
        glintRef.current,
        [
          { transform: "translate(-260px,0)", opacity: 0 },
          { transform: "translate(-90px,0)", opacity: 1, offset: 0.32 },
          { transform: "translate(240px,0)", opacity: 0 },
        ],
        { duration: timing.glintDur, delay: timing.glintAt, easing: EASE.wipe },
      );
      add(
        productRef.current,
        [
          { opacity: 0, letterSpacing: "0.08em", transform: "translate3d(0,6px,0)" },
          { opacity: 1, letterSpacing: "-0.02em", transform: "translate3d(0,0,0)" },
        ],
        { duration: timing.productDur, delay: timing.productAt, easing: EASE.settle },
      );
      timers.current.push(
        window.setTimeout(() => {
          rootRef.current?.setAttribute("data-gate", "open");
          if (readyRef.current) exit();
          else beginIdle();
        }, timing.exitAt),
      );
    }
    return () => {
      animations.current.forEach((animation) => animation.cancel());
      timers.current.forEach((timer) => window.clearTimeout(timer));
      idleRef.current?.cancel();
    };
  }, [add, beginIdle, exit, reduced, timing, variant]);

  const glintClipId = `streex-cinematic-glint-clip-${uid}`;
  const glintGradientId = `streex-cinematic-glint-gradient-${uid}`;
  const taglineWords = tagline.trim().split(/\s+/);
  const finalWord = taglineWords.pop() ?? "";
  const firstWords = taglineWords.join(" ");

  return (
    <div ref={rootRef} className="sx-cinematic-root" aria-hidden="true">
      <div ref={panelARef} className="sx-cinematic-panel sx-cinematic-panel--a" />
      <div ref={panelBRef} className="sx-cinematic-panel sx-cinematic-panel--b" />
      <div ref={stageRef} className="sx-cinematic-stage">
        <div ref={columnRef} className="sx-cinematic-column">
          <svg
            className="sx-cinematic-logo"
            viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`}
            focusable="false"
          >
            <defs>
              <clipPath id={glintClipId}>
                <polygon points={YELLOW_POINTS} />
              </clipPath>
              <linearGradient id={glintGradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.85" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g ref={wordRef} className="sx-cinematic-word">
              <g ref={accentRef}>
                {[0, 1, 2].map((index) => (
                  <rect
                    key={index}
                    data-accent
                    x={330}
                    y={64 + index * 20}
                    width={300}
                    height={2.5}
                    fill="var(--sx-yellow)"
                    className="sx-cinematic-accent"
                  />
                ))}
              </g>
              <path d={STREE_PATH} transform={LETTERS_TRANSFORM} fill="var(--sx-white)" />
              <polygon
                ref={wipeRef}
                className="sx-cinematic-cover"
                points="-420,-200 540,-200 788,340 -172,340"
                fill="var(--sx-black)"
              />
              <g ref={xRef} className="sx-cinematic-x">
                <polygon
                  ref={whiteRef}
                  className="sx-cinematic-stroke"
                  points={WHITE_POINTS}
                  fill="var(--sx-white)"
                />
                <g ref={yellowRef} className="sx-cinematic-stroke">
                  <polygon points={YELLOW_POINTS} fill="var(--sx-yellow)" />
                  <g clipPath={`url(#${glintClipId})`}>
                    <rect
                      ref={glintRef}
                      x={500}
                      y={-40}
                      width={70}
                      height={280}
                      fill={`url(#${glintGradientId})`}
                      transform={`skewX(${X_GEOMETRY.wipeSkew})`}
                      opacity={0}
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <div ref={productRef} className="sx-cinematic-product">
            <span className="sx-cinematic-product-primary">{firstWords}</span>
            <span className="sx-cinematic-product-accent">{finalWord}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
