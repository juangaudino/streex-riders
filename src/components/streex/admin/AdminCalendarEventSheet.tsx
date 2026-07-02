import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function fmtRange(startAt: string | null, endAt: string | null) {
  if (!startAt || !endAt) return `${fmt(startAt)} → ${fmt(endAt)}`;
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    hour: "numeric",
    minute: "2-digit",
  });
  if (dateFormatter.format(start) === dateFormatter.format(end)) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
  }
  return `${fmt(startAt)} → ${fmt(endAt)}`;
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
        className="streex-calendar-event-sheet max-h-[calc(100vh-32px)] gap-0 overflow-y-auto border p-0 shadow-2xl"
        style={{
          width: "min(560px, calc(100vw - 32px))",
          maxWidth: "none",
          background: "var(--admin-surface)",
          color: "var(--admin-fg)",
          borderColor: "var(--admin-border)",
        }}
      >
        {item?.kind === "ride" && (
          <div className="flex flex-col">
            <DialogHeader
              className="px-6 pt-6 pb-4 pr-16 border-b"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg">{item.name}</DialogTitle>
                  <DialogDescription
                    className="mt-1 text-xs"
                    style={{ color: "var(--admin-fg-muted)" }}
                  >
                    Ride details and calendar actions
                  </DialogDescription>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold"
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
            <div className="px-6 py-5 space-y-4 text-sm">
              <Row label="When">{fmtRange(item.startAt, item.endAt)}</Row>
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
              className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t"
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
              className="px-6 pt-6 pb-4 pr-16 border-b"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <DialogTitle className="text-base">Manual block</DialogTitle>
              <DialogDescription className="text-xs" style={{ color: "var(--admin-fg-muted)" }}>
                Time intentionally unavailable for booking
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5 space-y-4 text-sm">
              <Row label="From">{fmt(item.startAt)}</Row>
              <Row label="Until">{fmt(item.endAt)}</Row>
              <Row label="Reason">{item.reason || "—"}</Row>
            </div>
            <div
              className="flex items-center justify-end gap-2 px-6 py-4 border-t"
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
    <div className="streex-calendar-detail-row grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3">
      <span
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "var(--admin-fg-subtle)" }}
      >
        {label}
      </span>
      <div className="min-w-0 break-words leading-relaxed">{children}</div>
    </div>
  );
}
