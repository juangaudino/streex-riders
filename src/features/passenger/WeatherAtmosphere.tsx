import { useEffect, useRef } from "react";

/**
 * Lightweight weather atmosphere for the Passenger forecast dialog.
 * It is presentational only: native Canvas, no external assets or requests.
 */
export type AtmosphereVariant =
  | "thunderstorms"
  | "rain"
  | "snow"
  | "fog"
  | "smoke"
  | "partly-cloudy-night"
  | "cloudy"
  | "clear";

const BACKGROUNDS: Record<AtmosphereVariant, string> = {
  thunderstorms: "radial-gradient(ellipse at 30% 20%, #1a1a3e 0%, #0b0b0b 70%)",
  rain: "radial-gradient(ellipse at 34% 15%, #162644 0%, #090d14 72%)",
  snow: "radial-gradient(ellipse at 40% 15%, #12203a 0%, #0a0f1e 70%)",
  fog: "radial-gradient(ellipse at 50% 10%, #27313e 0%, #0c1014 74%)",
  smoke: "radial-gradient(ellipse at 38% 12%, #35291e 0%, #11100e 74%)",
  "partly-cloudy-night": "radial-gradient(ellipse at 75% 12%, #131b33 0%, #080c18 72%)",
  cloudy: "radial-gradient(ellipse at 48% 16%, #1e2730 0%, #0a0d10 74%)",
  clear: "radial-gradient(ellipse at 82% 10%, #1a1200 0%, #0b0b0b 68%)",
};

type Drop = { x: number; y: number; len: number; speed: number; alpha: number };
type Flake = { x: number; y: number; r: number; speed: number; phase: number; drift: number };
type Particle = { x: number; y: number; r: number; speed: number; drift: number; alpha: number };
type Star = { x: number; y: number; r: number; phase: number; rate: number };

const RAIN_ANGLE = (15 * Math.PI) / 180;

export function WeatherAtmosphere({
  variant,
  className = "",
}: {
  variant: AtmosphereVariant;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const drops: Drop[] = [];
    const flakes: Flake[] = [];
    const particles: Particle[] = [];
    const stars: Star[] = [];

    const seed = () => {
      drops.length = 0;
      flakes.length = 0;
      particles.length = 0;
      stars.length = 0;
      if (variant === "thunderstorms" || variant === "rain") {
        const count = variant === "thunderstorms" ? 220 : 130;
        for (let index = 0; index < count; index += 1) {
          drops.push({
            x: Math.random() * (width + height),
            y: Math.random() * height,
            len: 10 + Math.random() * (variant === "thunderstorms" ? 28 : 18),
            speed: (variant === "thunderstorms" ? 520 : 310) + Math.random() * 620,
            alpha: 0.25 + Math.random() * 0.42,
          });
        }
      } else if (variant === "snow") {
        for (let index = 0; index < 150; index += 1) {
          const r = 1 + Math.random() * 2;
          flakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r,
            speed: 14 + r * 16 + Math.random() * 14,
            phase: Math.random() * Math.PI * 2,
            drift: 8 + Math.random() * 22,
          });
        }
      } else if (variant === "partly-cloudy-night") {
        for (let index = 0; index < 28; index += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.7,
            r: 0.6 + Math.random() * 1.1,
            phase: Math.random() * Math.PI * 2,
            rate: 0.4 + Math.random() * 0.9,
          });
        }
      } else if (variant === "fog" || variant === "smoke") {
        const count = variant === "smoke" ? 54 : 38;
        for (let index = 0; index < count; index += 1) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: (variant === "smoke" ? 18 : 26) + Math.random() * 70,
            speed: 4 + Math.random() * 13,
            drift: 8 + Math.random() * 24,
            alpha: (variant === "smoke" ? 0.025 : 0.035) + Math.random() * 0.045,
          });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let frameId = 0;
    let last = performance.now();
    let nextStrike = performance.now() + 2500 + Math.random() * 3500;

    const flash = () => {
      const element = flashRef.current;
      if (!element) return;
      element.style.transition = "none";
      element.style.opacity = "0.15";
      window.setTimeout(() => {
        element.style.transition = "opacity 120ms linear";
        element.style.opacity = "0";
      }, 20);
      window.setTimeout(() => {
        element.style.transition = "none";
        element.style.opacity = "0.07";
        window.setTimeout(() => {
          element.style.transition = "opacity 140ms linear";
          element.style.opacity = "0";
        }, 20);
      }, 200);
    };

    const drawClouds = (time: number, alpha = 0.06) => {
      ctx.save();
      for (const cloud of [
        { x: 0.1, y: 0.16, scale: 1, speed: 0.000018 },
        { x: 0.55, y: 0.3, scale: 0.7, speed: 0.000012 },
        { x: 0.8, y: 0.1, scale: 0.85, speed: 0.000015 },
      ]) {
        const offset = ((time * cloud.speed + cloud.x) % 1.4) - 0.2;
        const cx = offset * width;
        const cy = cloud.y * height;
        const scale = cloud.scale * (width / 900);
        ctx.fillStyle = `rgba(200, 214, 245, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 190 * scale, 62 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 130 * scale, cy - 22 * scale, 140 * scale, 48 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 140 * scale, cy + 12 * scale, 120 * scale, 42 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);

      if (variant === "thunderstorms" || variant === "rain") {
        const dx = Math.sin(RAIN_ANGLE);
        const dy = Math.cos(RAIN_ANGLE);
        ctx.lineCap = "round";
        for (const drop of drops) {
          drop.x += dx * drop.speed * dt;
          drop.y += dy * drop.speed * dt;
          if (drop.y > height) {
            drop.y = -20 - Math.random() * height * 0.3;
            drop.x = Math.random() * (width + height) - height * 0.3;
          }
          ctx.strokeStyle = `rgba(180, 205, 255, ${drop.alpha})`;
          ctx.lineWidth = drop.len > 30 ? 1.35 : 1;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - dx * drop.len, drop.y - dy * drop.len);
          ctx.stroke();
        }
        if (variant === "thunderstorms" && !reduced && now > nextStrike) {
          flash();
          nextStrike = now + 4000 + Math.random() * 4000;
        }
      } else if (variant === "snow") {
        for (const flake of flakes) {
          flake.phase += dt * 1.1;
          flake.y += flake.speed * dt;
          const x = flake.x + Math.sin(flake.phase) * flake.drift;
          if (flake.y - flake.r > height) {
            flake.y = -8;
            flake.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(233, 242, 255, ${0.35 + flake.r * 0.14})`;
          ctx.beginPath();
          ctx.arc(x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (variant === "partly-cloudy-night") {
        const moonX = width * 0.86;
        const moonY = height * 0.14;
        const halo = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 150);
        halo.addColorStop(0, "rgba(214, 226, 255, 0.18)");
        halo.addColorStop(1, "rgba(214, 226, 255, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(moonX - 160, moonY - 160, 320, 320);
        ctx.fillStyle = "rgba(232, 238, 255, 0.72)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(moonX + 10, moonY - 8, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        for (const star of stars) {
          star.phase += dt * star.rate;
          ctx.fillStyle = `rgba(255,255,255,${0.28 + (Math.sin(star.phase) + 1) * 0.26})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
        drawClouds(now);
      } else if (variant === "fog" || variant === "smoke") {
        const color = variant === "smoke" ? "191, 156, 116" : "208, 220, 235";
        for (const particle of particles) {
          particle.x += particle.speed * dt;
          particle.y += Math.sin((particle.x + now * 0.018) * 0.015) * particle.drift * dt;
          if (particle.x - particle.r > width) {
            particle.x = -particle.r;
            particle.y = Math.random() * height;
          }
          const haze = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r);
          haze.addColorStop(0, `rgba(${color}, ${particle.alpha})`);
          haze.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = haze;
          ctx.fillRect(particle.x - particle.r, particle.y - particle.r, particle.r * 2, particle.r * 2);
        }
      } else if (variant === "cloudy") {
        drawClouds(now, 0.11);
      } else {
        const cx = width * 0.92;
        const cy = -height * 0.08;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((now / 90000) % (Math.PI * 2));
        const reach = Math.hypot(width, height) * 1.2;
        for (let index = 0; index < 14; index += 1) {
          ctx.rotate((Math.PI * 2) / 14);
          ctx.fillStyle = `rgba(255, 214, 120, ${index % 2 ? 0.03 : 0.06})`;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(reach, reach * 0.06);
          ctx.lineTo(reach, -reach * 0.06);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [variant]);

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: BACKGROUNDS[variant] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {variant === "thunderstorms" ? (
        <span ref={flashRef} className="absolute inset-0 bg-white" style={{ opacity: 0 }} />
      ) : null}
    </span>
  );
}
