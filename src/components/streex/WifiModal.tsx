import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wifi } from "lucide-react";

export function WifiModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const handleOpenWifi = () => {
    try {
      window.location.href = "App-Prefs:root=WIFI";
    } catch {
      // fallback handled by visible instructions
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 p-0 bg-transparent shadow-none max-w-sm"
      >
        <div className="streex-glass p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/15 border border-[#E6CE20]/30">
                <Wifi className="h-5 w-5 text-[#E6CE20]" />
              </div>
              <DialogTitle className="text-lg font-bold">Connect to Streex WiFi</DialogTitle>
            </div>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-base tracking-widest text-[#E6CE20]">
              STREEX-5G
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              No password required. Open your WiFi settings and select the network.
            </p>

            <button
              onClick={handleOpenWifi}
              className="w-full rounded-2xl bg-[#E6CE20] text-[#0B0B0B] font-bold py-3 text-sm tracking-wide transition active:scale-[0.97]"
            >
              Open WiFi Settings
            </button>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/55">
              To connect: open your iPhone Settings → WiFi → select <span className="text-[#E6CE20]">STREEX-5G</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}