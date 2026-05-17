import { useState } from "react";
import { Wifi, MessageSquare, Phone, UserPlus, Instagram, LayoutGrid } from "lucide-react";
import { WifiModal } from "./WifiModal";
import { MoreOptionsSheet } from "./MoreOptionsSheet";
import { SaveContactModal } from "./SaveContactModal";

function ActionCard({
  icon,
  label,
  description,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
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
  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {content}
      </a>
    );
  }
  return <button onClick={onClick} className="text-left">{content}</button>;
}

const STREEX_VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Juan - Streex Rides
N:Streex Rides;Juan;;;
TEL;TYPE=CELL:+18017974971
EMAIL:streex.rides@gmail.com
URL:https://streexrides.lovable.app
END:VCARD`;

export function QuickActions() {
  const [wifiOpen, setWifiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const saveContact = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    try {
      const blob = new Blob([STREEX_VCARD], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      if (isIOS) {
        // iOS Safari handles vcard best via navigation to the blob URL
        window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        // Open fallback modal shortly after in case nothing happens
        setTimeout(() => setContactOpen(true), 1200);
        return;
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = "Juan-StreexRides.vcf";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setContactOpen(true);
    }
  };

  const iconCls = "h-5 w-5 text-[#E6CE20]";

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
        />
        <ActionCard
          icon={<MessageSquare className={iconCls} />}
          label="Text Me"
          description="Schedule a ride by SMS"
          href="sms:+18017974971&body=Hi%20Juan!%20I'd%20like%20to%20schedule%20a%20ride."
        />
        <ActionCard
          icon={<Phone className={iconCls} />}
          label="Call Me"
          description="Reach Juan directly"
          href="tel:+18017974971"
        />
        <ActionCard
          icon={<UserPlus className={iconCls} />}
          label="Save Contact"
          description="Add to your phone"
          onClick={saveContact}
        />
        <ActionCard
          icon={<Instagram className={iconCls} />}
          label="Instagram"
          description="Follow @streex.rides"
          href="https://instagram.com/streex.rides"
        />
        <ActionCard
          icon={<LayoutGrid className={iconCls} />}
          label="More Options"
          description="WhatsApp & DMs"
          onClick={() => setMoreOpen(true)}
        />
      </div>

      <WifiModal open={wifiOpen} onOpenChange={setWifiOpen} />
      <MoreOptionsSheet open={moreOpen} onOpenChange={setMoreOpen} />
      <SaveContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        vcard={STREEX_VCARD}
      />
    </section>
  );
}