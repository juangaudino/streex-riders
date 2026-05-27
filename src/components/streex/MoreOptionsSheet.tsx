import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageCircle, Instagram } from "lucide-react";
// To customize this template, edit src/config.ts
import { CONFIG } from "@/config";

export function MoreOptionsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-[#0B0B0B] border-t border-white/10 rounded-t-3xl text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-left">More Options</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3 pb-6">
          <a
            href={CONFIG.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="streex-glass flex items-center gap-4 px-5 py-4 active:scale-[0.97]"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/15 border border-[#E6CE20]/30">
              <MessageCircle className="h-5 w-5 text-[#E6CE20]" />
            </div>
            <div>
              <div className="font-semibold">WhatsApp</div>
              <div className="text-xs text-white/60">Message Juan on WhatsApp</div>
            </div>
          </a>
          <a
            href={CONFIG.instagramDM}
            target="_blank"
            rel="noreferrer"
            className="streex-glass flex items-center gap-4 px-5 py-4 active:scale-[0.97]"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/15 border border-[#E6CE20]/30">
              <Instagram className="h-5 w-5 text-[#E6CE20]" />
            </div>
            <div>
              <div className="font-semibold">Instagram DM</div>
              <div className="text-xs text-white/60">Direct message on Instagram</div>
            </div>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}