import { useState } from "react";
import { Calendar, MessageSquare, Phone, UserPlus } from "lucide-react";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";
import type { AppConfig } from "@/config";
import runnerQuickActionCard from "@/features/runner/assets/quick-action/runner_quick_action_card.webp";

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
        className="streex-glass block overflow-hidden p-0 group"
        aria-label="Play STREEX Runner"
      >
        <img
          src={runnerQuickActionCard}
          alt="STREEX Runner. Play the challenge."
          className="block aspect-[1200/509] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          loading="lazy"
          decoding="async"
        />
      </a>
    </Reveal>
  );
}

function buildVcard(config: AppConfig) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${config.ownerName} - ${config.brandName}`,
    `N:${config.brandName};${config.ownerName};;;`,
    `ORG:${config.brandName}`,
    `TEL;TYPE=WORK,VOICE:${config.phone}`,
    `EMAIL;TYPE=WORK:${config.email}`,
    `URL:${config.website}`,
    "END:VCARD",
  ].join("\r\n");
}

export function QuickActions({ config }: { config: AppConfig }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const iconCls = "h-5 w-5 text-[#E6CE20]";
  const vcard = buildVcard(config);

  const saveContact = () => {
    try {
      const blob = new Blob([vcard], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${config.ownerName}-${config.brandName.replace(/\s+/g, "")}.vcf`,
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
        {config.sections.moreOptions && <RunnerFeaturedCard revealDelay={0} />}
        {config.sections.textMe && (
          <ActionCard
            icon={<MessageSquare className={iconCls} />}
            label="Text Me"
            description="Schedule a ride by SMS"
            href={`sms:${config.phone}?&body=${encodeURIComponent(`Hi ${config.ownerName}! I'd like to schedule a ride.`)}`}
            revealDelay={90}
          />
        )}
        {config.sections.callMe && (
          <ActionCard
            icon={<Phone className={iconCls} />}
            label="Call Me"
            description={`Reach ${config.ownerName} directly`}
            href={`tel:${config.phone}`}
            revealDelay={180}
          />
        )}
        {config.sections.saveContact && (
          <ActionCard
            icon={<UserPlus className={iconCls} />}
            label="Save Contact"
            description="Add to your phone"
            onClick={saveContact}
            revealDelay={270}
          />
        )}
        {config.sections.scheduleRide && (
          <ActionCard
            icon={<Calendar className={iconCls} />}
            label="Schedule Ride"
            description="Book ahead"
            onClick={() => setBookingOpen(true)}
            revealDelay={360}
          />
        )}
      </div>

      <SaveContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        vcard={vcard}
        config={config}
      />
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}
