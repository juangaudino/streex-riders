import type { AppConfig } from "@/config";

export function Splash({ config }: { config: AppConfig }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0B]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230,206,32,0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center streex-fade-in">
        <img src={config.logoSrc} alt={config.brandName} className="w-56 h-auto" />
        <p className="mt-8 text-xs streex-tracking text-white/80 uppercase">{config.tagline}</p>
      </div>
    </div>
  );
}
