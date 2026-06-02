import { useState } from "react";
import { Wifi, MessageSquare, Phone, UserPlus, Calendar } from "lucide-react";
import { WifiModal } from "./WifiModal";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";
import { RUNNER_SPRITES } from "@/features/runner/assets/manifest";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";

function ActionCard({
  icon,
  label,
  description,
  onClick,
  href,
  download,
  revealDelay = 0,
  logoMode = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  revealDelay?: number;
  logoMode?: boolean;
}) {
  const content = (
    <div className="streex-glass p-5 h-full flex flex-col gap-3 cursor-pointer">
      <div
        className={`flex items-center justify-center bg-[#E6CE20]/12 border border-[#E6CE20]/25 ${
          logoMode ? "h-16 w-full rounded-xl px-4" : "h-10 w-10 rounded-full"
        }`}
      >
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
  const [wifiOpen, setWifiOpen] = useState(false);
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
        {CONFIG.sections.wifi && (
          <ActionCard
            icon={<Wifi className={iconCls} />}
            label="Connect WiFi"
            description="Free onboard WiFi"
            onClick={() => setWifiOpen(true)}
            revealDelay={0}
          />
        )}
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
        {CONFIG.sections.moreOptions && (
          <ActionCard
            icon={<img src={RUNNER_SPRITES.runnerLogoLockup} alt="" className="h-auto w-full" />}
            label="STREEX Runner"
            description="Play the Challenge"
            href="/runner-lab"
            logoMode
            revealDelay={450}
          />
        )}
      </div>

      <WifiModal open={wifiOpen} onOpenChange={setWifiOpen} />
      <SaveContactModal open={contactOpen} onOpenChange={setContactOpen} vcard={STREEX_VCARD} />
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}
