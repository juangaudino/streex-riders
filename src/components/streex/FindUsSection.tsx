import { Reveal } from "./Reveal";
import { MessageCircle } from "lucide-react";
import type { AppConfig } from "@/config";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const NextdoorIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
    <path d="M12 2L2 7.5V22h8v-6.5c0-1.1.9-2 2-2s2 .9 2 2V22h8V7.5L12 2z" />
  </svg>
);

type SocialButton = {
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  href: string;
  active: boolean;
};

function getButtons(config: AppConfig): SocialButton[] {
  return [
    {
      icon: <MessageCircle width={28} height={28} strokeWidth={2} />,
      label: "WhatsApp",
      href: config.whatsapp,
      active: Boolean(config.whatsapp),
    },
    {
      icon: <InstagramIcon />,
      label: "Instagram",
      href: config.instagramUrl,
      active: Boolean(config.instagramUrl),
    },
    {
      icon: <GoogleIcon />,
      label: "Google",
      href: config.googleReviews || "#",
      active: Boolean(config.googleReviews),
    },
    {
      icon: <NextdoorIcon />,
      label: "Nextdoor",
      href: config.nextdoor || "#",
      active: Boolean(config.nextdoor),
    },
  ];
}

export function FindUsSection({ config }: { config: AppConfig }) {
  const buttons = getButtons(config);

  return (
    <Reveal>
      <section className="px-6 mt-16">
        <h2 className="text-2xl font-bold mb-5">More Ways to Connect</h2>
        <div className="flex flex-nowrap items-start justify-center gap-2 sm:gap-3">
          {buttons.map((b) => {
            const content = (
              <div
                className={`streex-glass flex flex-col items-center justify-center gap-2 py-4 px-2 sm:px-3 flex-1 min-w-0 ${
                  b.active ? "active:scale-[0.97] cursor-pointer" : "cursor-default opacity-45"
                }`}
                style={{ borderRadius: 14 }}
              >
                <div
                  className={`flex items-center justify-center ${b.active ? "text-[#E6CE20]" : "text-white/40"}`}
                >
                  {b.icon}
                </div>
                <div
                  className="text-center"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(9px, 2.45vw, 11px)",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.15,
                  }}
                >
                  {b.label}
                </div>
                {b.subLabel && (
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: 9,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {b.subLabel}
                  </div>
                )}
              </div>
            );

            return b.active ? (
              <a
                key={b.label}
                href={b.href}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-0"
              >
                {content}
              </a>
            ) : (
              <div key={b.label} className="flex-1 min-w-0">
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}
