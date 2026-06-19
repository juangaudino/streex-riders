import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type CalendarSheetItem =
  | {
      kind: "ride";
      id: string;
      name: string;
      status: string;
      startAt: string | null;
      endAt: string | null;
      serviceType?: string | null;
      estimatedDurationMinutes?: number | null;
      pickup: string;
      destination: string;
      passengers: number;
      price: number | null;
    }
  | {
      kind: "block";
      id: string;
      startAt: string;
      endAt: string;
      reason: string | null;
    };

function fmt(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function durationMinutes(startAt: string | null, endAt: string | null) {
  if (!startAt || !endAt) return null;
  const ms = new Date(endAt).getTime() - new Date(startAt).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return Math.round(ms / 60000);
}

export function AdminCalendarEventSheet({
  item,
  open,
  onClose,
  onComplete,
  onCancel,
  onDeleteBlock,
}: {
  item: CalendarSheetItem | null;
  open: boolean;
  onClose: () => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md border-0 p-0 overflow-hidden"
        style={{ background: "var(--admin-surface)", color: "var(--admin-fg)" }}
      >
        {item?.kind === "ride" && (
          <div className="flex flex-col">
            <DialogHeader
              className="px-5 pt-5 pb-3 border-b"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-base">{item.name}</DialogTitle>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold"
                  style={{
                    background: "rgba(230,206,32,0.16)",
                    color: "#a98f00",
                    border: "1px solid rgba(230,206,32,0.35)",
                  }}
                >
                  {item.status}
                </span>
              </div>
            </DialogHeader>
            <div className="px-5 py-4 space-y-3 text-sm">
              <Row label="When">
                {fmt(item.startAt)} → {fmt(item.endAt)}
              </Row>
              <Row label="Service">
                {item.serviceType === "hourly"
                  ? `Hourly${
                      item.estimatedDurationMinutes
                        ? ` · ${Math.round(item.estimatedDurationMinutes / 60)} hr`
                        : ""
                    }`
                  : "Point to Point"}
                {durationMinutes(item.startAt, item.endAt) != null && (
                  <span style={{ color: "var(--admin-fg-muted)" }}>
                    {" · "}
                    {durationMinutes(item.startAt, item.endAt)} min
                  </span>
                )}
              </Row>
              <Row label="Pickup">{item.pickup}</Row>
              <Row label="Destination">{item.destination}</Row>
              <Row label="Passengers">{item.passengers}</Row>
              {item.price != null && (
                <Row label="Price">
                  <span style={{ color: "#a98f00", fontWeight: 600 }}>
                    ${Number(item.price).toFixed(2)}
                  </span>
                </Row>
              )}
            </div>
            <div
              className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-t"
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-2)" }}
            >
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(item.id)}
                  className="rounded-full px-3 py-1.5 text-xs border"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg-muted)" }}
                >
                  Cancel ride
                </button>
              )}
              {onComplete && item.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() => onComplete(item.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "#E6CE20", color: "#0b0b0b" }}
                >
                  Mark complete
                </button>
              )}
            </div>
          </div>
        )}

        {item?.kind === "block" && (
          <div className="flex flex-col">
            <DialogHeader
              className="px-5 pt-5 pb-3 border-b"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <DialogTitle className="text-base">Manual block</DialogTitle>
            </DialogHeader>
            <div className="px-5 py-4 space-y-3 text-sm">
              <Row label="From">{fmt(item.startAt)}</Row>
              <Row label="Until">{fmt(item.endAt)}</Row>
              <Row label="Reason">{item.reason || "—"}</Row>
            </div>
            <div
              className="flex items-center justify-end gap-2 px-5 py-3 border-t"
              style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-2)" }}
            >
              {onDeleteBlock && (
                <button
                  type="button"
                  onClick={() => onDeleteBlock(item.id)}
                  className="rounded-full px-3 py-1.5 text-xs border"
                  style={{ borderColor: "rgba(220,38,38,0.4)", color: "#dc2626" }}
                >
                  Delete block
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-24 shrink-0 text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "var(--admin-fg-subtle)" }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0 break-words">{children}</div>
    </div>
  );
}
