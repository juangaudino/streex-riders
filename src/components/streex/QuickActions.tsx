import { useState } from "react";
import { ArrowRight, Calendar, MessageSquare, Phone, UserPlus } from "lucide-react";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";
import runnerLogo from "@/features/runner/assets/sprites/runner_logo_official.png";

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
        className="streex-glass h-full min-h-[116px] p-5 grid grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden group"
        aria-label="Play STREEX Runner"
      >
        <div className="relative min-w-0 flex items-center">
          <div className="absolute -inset-5 bg-[#E6CE20]/8 blur-2xl opacity-70 transition-opacity group-hover:opacity-100" />
          <img
            src={runnerLogo}
            alt="STREEX Runner"
            className="relative w-full max-w-[148px] sm:max-w-[168px] object-contain"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-white leading-tight">STREEX Runner</div>
          <div className="text-xs text-white/55 mt-1 leading-snug">Play the Challenge</div>
        </div>
        <div className="h-10 w-10 rounded-full border border-[#E6CE20]/30 bg-[#E6CE20]/12 text-[#E6CE20] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
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
