import { useEffect, useState } from "react";
import logo from "@/assets/streex-logo.webp";

export function Header() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-400 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
      style={{
        backgroundColor: "rgba(11,11,11,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto max-w-md px-5 py-3 flex items-center">
        <img src={logo} alt="Streex" className="h-8 w-auto" />
      </div>
    </header>
  );
}
