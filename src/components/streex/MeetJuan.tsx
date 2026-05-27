import { useEffect, useRef, useState } from "react";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";

export function MeetJuan() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="px-6 mt-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 700ms ease, transform 700ms ease",
      }}
    >
      <div
        className="streex-glass p-6"
        style={{ borderLeft: "2px solid #E6CE20" }}
      >
        <div className="flex flex-col items-center text-center mb-5">
          <img
            src={CONFIG.meetPhoto}
            alt={CONFIG.ownerName}
            className="rounded-full mb-4 object-cover"
            style={{
              width: 90,
              height: 90,
              border: "2px solid rgba(230,206,32,0.4)",
              boxShadow: "0 0 16px rgba(230,206,32,0.15)",
            }}
          />
          <h2 className="text-2xl font-bold">{CONFIG.meetTitle}</h2>
        </div>
        <div className="space-y-4 text-[15px] leading-relaxed text-white/80">
          {CONFIG.meetBody.map((p, i) => (
            <p key={i} className={i === CONFIG.meetBody.length - 1 ? "text-white" : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}