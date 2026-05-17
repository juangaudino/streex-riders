import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

const CONTACT_LINES = [
  { label: "Name", value: "Juan — Streex Rides" },
  { label: "Phone", value: "+1 (801) 797-4971" },
  { label: "Email", value: "streex.rides@gmail.com" },
  { label: "Website", value: "https://streexrides.lovable.app" },
];

const COPY_TEXT = `Juan — Streex Rides
Phone: +1 (801) 797-4971
Email: streex.rides@gmail.com
Website: https://streexrides.lovable.app`;

export function SaveContactModal({
  open,
  onOpenChange,
  vcard,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vcard: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COPY_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const dataUrl =
    "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0B0B] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Save Contact</DialogTitle>
          <DialogDescription className="text-white/55">
            If the contact didn't open automatically, copy the details below or
            download the card manually.
          </DialogDescription>
        </DialogHeader>

        <div className="streex-glass p-4 space-y-3">
          {CONTACT_LINES.map((c) => (
            <div key={c.label}>
              <div className="text-[10px] uppercase streex-tracking text-white/40">
                {c.label}
              </div>
              <div className="text-sm text-white">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={copy}
            className="w-full rounded-full bg-[#E6CE20] text-black font-semibold text-sm py-3 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Contact Info"}
          </button>
          <a
            href={dataUrl}
            download="Juan-StreexRides.vcf"
            className="w-full rounded-full border border-white/15 text-white font-medium text-sm py-3 text-center"
          >
            Download .vcf
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}