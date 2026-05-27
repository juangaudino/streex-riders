import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";

const CONTACT_LINES: { label: string; value: string; href?: string }[] = [
  { label: "Name", value: `${CONFIG.ownerName} — ${CONFIG.brandName}` },
  { label: "Phone", value: CONFIG.phoneDisplay, href: `tel:${CONFIG.phone}` },
  { label: "Email", value: CONFIG.email, href: `mailto:${CONFIG.email}` },
  { label: "Website", value: CONFIG.website.replace(/^https?:\/\//, ""), href: CONFIG.website },
];

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

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.phoneDisplay);
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
          <DialogTitle className="text-white">Save Juan's Contact</DialogTitle>
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
              {c.href ? (
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-sm text-white underline-offset-2 hover:underline"
                >
                  {c.value}
                </a>
              ) : (
                <div className="text-sm text-white">{c.value}</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={copyPhone}
            className="w-full rounded-full bg-[#E6CE20] text-black font-semibold text-sm py-3 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Phone Number"}
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