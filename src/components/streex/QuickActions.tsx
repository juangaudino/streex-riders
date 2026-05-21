import { useState } from "react";
import { Wifi, MessageSquare, Phone, UserPlus, Calendar, LayoutGrid } from "lucide-react";
import { WifiModal } from "./WifiModal";
import { MoreOptionsSheet } from "./MoreOptionsSheet";
import { SaveContactModal } from "./SaveContactModal";
import { BookingFormModal } from "./BookingFormModal";
import { Reveal } from "./Reveal";

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
      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/12 border border-[#E6CE20]/25">
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
    <button onClick={onClick} className="text-left w-full">{content}</button>
  );
  return <Reveal delay={revealDelay}>{inner}</Reveal>;
}

const STREEX_VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:Juan - Streex Rides",
  "N:Streex Rides;Juan;;;",
  "ORG:Streex Rides",
  "TEL;TYPE=WORK,VOICE:+18017974971",
  "EMAIL;TYPE=WORK:streex.rides@gmail.com",
  "URL:https://streexrides.lovable.app",
  "END:VCARD",
].join("\r\n");

export function QuickActions() {
  const [wifiOpen, setWifiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const iconCls = "h-5 w-5 text-[#E6CE20]";

  const saveContact = () => {
    try {
      const blob = new Blob([STREEX_VCARD], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Juan-StreexRides.vcf");
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
        <ActionCard
          icon={<Wifi className={iconCls} />}
          label="Connect WiFi"
          description="Free onboard WiFi"
          onClick={() => setWifiOpen(true)}
          revealDelay={0}
        />
        <ActionCard
          icon={<MessageSquare className={iconCls} />}
          label="Text Me"
          description="Schedule a ride by SMS"
          href="sms:+18017974971&body=Hi%20Juan!%20I'd%20like%20to%20schedule%20a%20ride."
          revealDelay={90}
        />
        <ActionCard
          icon={<Phone className={iconCls} />}
          label="Call Me"
          description="Reach Juan directly"
          href="tel:+18017974971"
          revealDelay={180}
        />
        <ActionCard
          icon={<UserPlus className={iconCls} />}
          label="Save Contact"
          description="Add to your phone"
          onClick={saveContact}
          revealDelay={270}
        />
        <ActionCard
          icon={<Calendar className={iconCls} />}
          label="Schedule Ride"
          description="Book ahead"
          onClick={() => setBookingOpen(true)}
          revealDelay={360}
        />
        <ActionCard
          icon={<LayoutGrid className={iconCls} />}
          label="More Options"
          description="WhatsApp & Instagram"
          onClick={() => setMoreOpen(true)}
          revealDelay={450}
        />
      </div>

      <WifiModal open={wifiOpen} onOpenChange={setWifiOpen} />
      <MoreOptionsSheet open={moreOpen} onOpenChange={setMoreOpen} />
      <SaveContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        vcard={STREEX_VCARD}
      />
      <BookingFormModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}