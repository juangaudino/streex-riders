import { useState } from "react";
import { Calendar, MessageSquare, Phone, UserPlus } from "lucide-react";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";
import playStreex from "@/features/runner/assets/quick-action/play_streex.webp";
import runnerQuickActionBg from "@/features/runner/assets/quick-action/runner_quick_action_bg_with_rav4.webp";
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
        className="streex-glass relative h-full min-h-[168px] overflow-hidden p-5 group"
        aria-label="Play STREEX Runner"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src={runnerQuickActionBg}
            alt=""
            className="h-full w-full object-cover object-[56%_58%] opacity-95 saturate-[0.96]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,0.72)_0%,rgba(11,11,11,0.2)_48%,rgba(11,11,11,0.28)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/76 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full min-h-[128px] flex-col justify-center">
          <div className="max-w-[58%] sm:max-w-[54%]">
            <img
              src={runnerLogo}
              alt="STREEX Runner"
              className="w-full max-w-[235px] object-contain drop-shadow-[0_0_22px_rgba(230,206,32,0.36)]"
              loading="lazy"
              decoding="async"
            />
            <img
              src={playStreex}
              alt="Play"
              className="mt-3 w-[132px] object-contain drop-shadow-[0_0_18px_rgba(230,206,32,0.32)] transition-transform duration-300 group-hover:translate-y-[-1px] sm:w-[154px]"
              loading="lazy"
              decoding="async"
            />
          </div>
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
        {CONFIG.sections.moreOptions && <RunnerFeaturedCard revealDelay={0} />}
        {CONFIG.sections.textMe && (
          <ActionCard
            icon={<MessageSquare className={iconCls} />}
            label="Text Me"
            description="Schedule a ride by SMS"
            href={`sms:${CONFIG.phone}?&body=${encodeURIComponent(`Hi ${CONFIG.ownerName}! I'd like to schedule a ride.`)}`}
            revealDelay={90}
          />
        )}
        {CONFIG.sections.callMe && (
          <ActionCard
            icon={<Phone className={iconCls} />}
            label="Call Me"
            description={`Reach ${CONFIG.ownerName} directly`}
            href={`tel:${CONFIG.phone}`}
            revealDelay={180}
          />
        )}
        {CONFIG.sections.saveContact && (
          <ActionCard
            icon={<UserPlus className={iconCls} />}
            label="Save Contact"
            description="Add to your phone"
            onClick={saveContact}
            revealDelay={270}
          />
        )}
        {CONFIG.sections.scheduleRide && (
          <ActionCard
            icon={<Calendar className={iconCls} />}
            label="Schedule Ride"
            description="Book ahead"
            onClick={() => setBookingOpen(true)}
            revealDelay={360}
          />
        )}
      </div>

      <SaveContactModal open={contactOpen} onOpenChange={setContactOpen} vcard={STREEX_VCARD} />
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}
