import { useEffect, useRef, useState } from "react";

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
        <div className="flex items-center gap-4 mb-5">
          <div
            className="rounded-full flex items-center justify-center bg-black border border-[#E6CE20]/30"
            style={{ width: 80, height: 80 }}
          >
            <span
              style={{
                color: "#E6CE20",
                fontFamily: "Montserrat",
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1,
              }}
            >
              J
            </span>
          </div>
          <h2 className="text-2xl font-bold">Meet Juan</h2>
        </div>
        <div className="space-y-4 text-[15px] leading-relaxed text-white/80">
          <p>Hi, I'm Juan — the creator behind Streex Rides.</p>
          <p>
            I've always believed that great experiences are built through
            attention to detail, thoughtful design and genuine human
            connection.
          </p>
          <p>
            With a background in branding, technology and creative projects,
            I created Streex to offer something different: a more personal,
            comfortable and elevated way to move around Utah.
          </p>
          <p>
            For me, transportation isn't just about getting somewhere. It's
            about how the experience feels along the way.
          </p>
          <p className="text-white">Welcome to Streex.</p>
        </div>
      </div>
    </section>
  );
}