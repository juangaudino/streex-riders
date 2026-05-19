import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";

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
          <div
            className="rounded-full flex items-center justify-center bg-black mb-4"
            style={{
              width: 90,
              height: 90,
              border: "2px solid rgba(230,206,32,0.4)",
              boxShadow: "0 0 16px rgba(230,206,32,0.15)",
            }}
          >
            <User className="h-9 w-9 text-white/40" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold">Meet Juan</h2>
        </div>
        <div className="space-y-4 text-[15px] leading-relaxed text-white/80">
          <p>Hi, I'm Juan — creator of Streex Rides.</p>
          <p>
            I believe transportation can be more than a ride — it can be a
            genuinely comfortable and thoughtful experience.
          </p>
          <p>
            Fluent in English and Spanish, with a background in branding,
            technology and creative projects, I built Streex around one
            simple idea: details matter.
          </p>
          <p>
            While continuing my studies at Weber State University, I'm
            building Streex as a more personal, elevated and human way to
            move around Utah.
          </p>
          <p className="text-white">I look forward to being your driver.</p>
        </div>
      </div>
    </section>
  );
}