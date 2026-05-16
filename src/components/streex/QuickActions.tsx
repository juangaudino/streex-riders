import { useState } from "react";
import { Wifi, MessageSquare, Phone, UserPlus, Instagram, LayoutGrid } from "lucide-react";
import { WifiModal } from "./WifiModal";
import { MoreOptionsSheet } from "./MoreOptionsSheet";

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

export function QuickActions() {
  const [wifiOpen, setWifiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const saveContact = () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:Juan — Streex Rides
N:Streex Rides;Juan;;;
TEL;TYPE=CELL:+18017974971
EMAIL:streex.rides@gmail.com
URL:https://streexrides.lovable.app
END:VCARD`;
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Juan-Streex-Rides.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    </section>
  );
}