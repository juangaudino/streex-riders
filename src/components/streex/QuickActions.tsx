import { useState } from "react";
import { ArrowRight, Calendar, MessageSquare, Phone, UserPlus } from "lucide-react";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";
import playerRav4 from "@/features/runner/assets/sprites/player_rav4_rear.webp";
import runnerLogo from "@/features/runner/assets/sprites/runner_logo_official.webp";

function ActionCard({
  icon,
  label,
  description,
  onClick,
  href,
  download,
  revealDelay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  revealDelay?: number;
}) {
  const content = (
    <div className="streex-glass p-5 h-full flex flex-col gap-3 cursor-pointer">
      <div className="h-10 w-10 rounded-full flex items-center justify-center border bg-[#E6CE20]/12 border-[#E6CE20]/25">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold text-white">{label}</div>
        <div className="text-xs text-white/55 mt-1 leading-snug">{description}</div>
      </div>
    </div>
  );
  const inner = href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      {...(download ? { download: "" } : {})}
    >
      {content}
    </a>
  ) : (
    <button onClick={onClick} className="text-left w-full">
      {content}
    </button>
  );
  return <Reveal delay={revealDelay}>{inner}</Reveal>;
}

function RunnerFeaturedCard({ revealDelay = 0 }: { revealDelay?: number }) {
  return (
    <Reveal delay={revealDelay} className="col-span-2">
      <a
        href="/runner-lab"
        className="streex-glass relative h-full min-h-[116px] overflow-hidden p-5 grid grid-cols-[minmax(104px,0.86fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 group"
        aria-label="Play STREEX Runner"
      >
        <div className="pointer-events-none absolute inset-0 opacity-95" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(230,206,32,0.14),transparent_30%),linear-gradient(118deg,rgba(230,206,32,0.08),transparent_42%),linear-gradient(90deg,rgba(255,255,255,0.035),transparent_34%,rgba(230,206,32,0.055)_72%,transparent)]" />
          <div className="absolute inset-y-0 right-0 w-[58%] bg-[radial-gradient(ellipse_at_76%_42%,rgba(230,206,32,0.2),transparent_30%),linear-gradient(180deg,rgba(11,11,11,0)_0%,rgba(11,11,11,0.5)_78%)]" />
          <div className="absolute bottom-0 right-[3%] h-[74%] w-[47%] origin-bottom skew-x-[-10deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)),linear-gradient(90deg,transparent_0_20%,rgba(230,206,32,0.22)_49%,rgba(230,206,32,0.22)_51%,transparent_80%)] opacity-60 [clip-path:polygon(46%_0,58%_0,100%_100%,0_100%)]" />
          <div className="absolute bottom-7 right-[19%] h-[1px] w-[34%] bg-[#E6CE20]/30 shadow-[0_0_16px_rgba(230,206,32,0.35)]" />
          <div className="absolute bottom-0 right-0 h-full w-full bg-[linear-gradient(180deg,transparent_0_58%,rgba(0,0,0,0.62)_100%)]" />
        </div>

        <div className="relative z-10 min-w-0 flex items-center">
          <div className="absolute -inset-5 bg-[#E6CE20]/12 blur-2xl opacity-75 transition-opacity group-hover:opacity-100" />
          <img
            src={runnerLogo}
            alt="STREEX Runner"
            className="relative w-full max-w-[138px] sm:max-w-[174px] object-contain drop-shadow-[0_0_18px_rgba(230,206,32,0.24)]"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="relative z-10 min-w-0">
          <div className="text-[15px] font-semibold text-white leading-tight">STREEX Runner</div>
          <div className="text-xs text-white/55 mt-1 leading-snug">Play the Challenge</div>
          <div className="mt-2 hidden sm:inline-flex items-center rounded-full border border-[#E6CE20]/20 bg-[#E6CE20]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#E6CE20]/80">
            Ride Elevated
          </div>
        </div>

        <img
          src={playerRav4}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 right-[52px] z-[1] w-[68px] opacity-70 drop-shadow-[0_12px_20px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:right-[72px] sm:w-[84px] sm:opacity-85"
          loading="lazy"
          decoding="async"
        />

        <div className="relative z-10 h-10 w-10 rounded-full border border-[#E6CE20]/35 bg-[#E6CE20]/14 text-[#E6CE20] flex items-center justify-center shadow-[0_0_20px_rgba(230,206,32,0.12)] transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </div>
      </a>
    </Reveal>
  );
}

const STREEX_VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  `FN:${CONFIG.ownerName} - ${CONFIG.brandName}`,
  `N:${CONFIG.brandName};${CONFIG.ownerName};;;`,
  `ORG:${CONFIG.brandName}`,
  `TEL;TYPE=WORK,VOICE:${CONFIG.phone}`,
  `EMAIL;TYPE=WORK:${CONFIG.email}`,
  `URL:${CONFIG.website}`,
  "END:VCARD",
].join("\r\n");

export function QuickActions() {
  const [contactOpen, setContactOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const iconCls = "h-5 w-5 text-[#E6CE20]";

  const saveContact = () => {
    try {
      const blob = new Blob([STREEX_VCARD], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${CONFIG.ownerName}-${CONFIG.brandName.replace(/\s+/g, "")}.vcf`,
      );
      link.setAttribute("type", "text/vcard");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // ignore — fallback below
    }
  };

  return (
    <section className="px-5 mt-10">
      <h2 className="text-[11px] uppercase streex-tracking text-white/50 font-semibold mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CONFIG.sections.textMe && (
          <ActionCard
            icon={<MessageSquare className={iconCls} />}
            label="Text Me"
            description="Schedule a ride by SMS"
            href={`sms:${CONFIG.phone}?&body=${encodeURIComponent(`Hi ${CONFIG.ownerName}! I'd like to schedule a ride.`)}`}
            revealDelay={0}
          />
        )}
        {CONFIG.sections.callMe && (
          <ActionCard
            icon={<Phone className={iconCls} />}
            label="Call Me"
            description={`Reach ${CONFIG.ownerName} directly`}
            href={`tel:${CONFIG.phone}`}
            revealDelay={90}
          />
        )}
        {CONFIG.sections.saveContact && (
          <ActionCard
            icon={<UserPlus className={iconCls} />}
            label="Save Contact"
            description="Add to your phone"
            onClick={saveContact}
            revealDelay={180}
          />
        )}
        {CONFIG.sections.scheduleRide && (
          <ActionCard
            icon={<Calendar className={iconCls} />}
            label="Schedule Ride"
            description="Book ahead"
            onClick={() => setBookingOpen(true)}
            revealDelay={270}
          />
        )}
        {CONFIG.sections.moreOptions && <RunnerFeaturedCard revealDelay={360} />}
      </div>

      <SaveContactModal open={contactOpen} onOpenChange={setContactOpen} vcard={STREEX_VCARD} />
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}
