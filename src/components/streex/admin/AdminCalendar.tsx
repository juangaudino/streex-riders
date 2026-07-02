import { useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { useIsMobile } from "@/hooks/use-mobile";
import { intlNamedTimeZonePlugin } from "@/lib/fullcalendar-intl-timezone";
import type { CalendarSheetItem } from "./AdminCalendarEventSheet";

export type CalendarAgendaItem = {
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
};

export type CalendarBlockItem = {
  id: string;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type CalendarGoogleBusyItem = {
  id: string;
  startAt: string;
  endAt: string;
};

function serviceLabel(t?: string | null) {
  if (t === "hourly") return "Hourly";
  return "Point to Point";
}

export function AdminCalendar({
  agenda,
  blocks,
  googleBusy,
  onSelect,
}: {
  agenda: CalendarAgendaItem[];
  blocks: CalendarBlockItem[];
  googleBusy: CalendarGoogleBusyItem[];
  onSelect: (item: CalendarSheetItem) => void;
}) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    calendarRef.current?.getApi().changeView(isMobile ? "listWeek" : "timeGridWeek");
  }, [isMobile]);

  const events: EventInput[] = useMemo(() => {
    const rideEvents: EventInput[] = agenda
      .filter((r) => r.startAt)
      .map((r) => ({
        id: `ride:${r.id}`,
        title: r.name,
        start: r.startAt!,
        end:
          r.endAt ||
          new Date(
            new Date(r.startAt!).getTime() + (r.estimatedDurationMinutes ?? 60) * 60000,
          ).toISOString(),
        classNames: [
          "streex-evt",
          r.status === "confirmed" ? "streex-evt-confirmed" : "streex-evt-quoted",
        ],
        extendedProps: { kind: "ride", data: r, serviceLabel: serviceLabel(r.serviceType) },
      }));

    const blockEvents: EventInput[] = blocks.map((b) => ({
      id: `block:${b.id}`,
      title: b.reason || "Manual block",
      start: b.startAt,
      end: b.endAt,
      classNames: ["streex-evt", "streex-evt-block"],
      extendedProps: { kind: "block", data: b },
    }));

    const googleEvents: EventInput[] = googleBusy.map((item) => ({
      id: `google:${item.id}`,
      title: "Google Calendar busy",
      start: item.startAt,
      end: item.endAt,
      editable: false,
      classNames: ["streex-evt", "streex-evt-google"],
      extendedProps: { kind: "google" },
    }));

    return [...rideEvents, ...blockEvents, ...googleEvents];
  }, [agenda, blocks, googleBusy]);

  const onClick = (arg: EventClickArg) => {
    const props = arg.event.extendedProps as {
      kind: "ride" | "block" | "google";
      data: CalendarAgendaItem | CalendarBlockItem;
    };
    if (props.kind === "google") return;
    if (props.kind === "ride") {
      const r = props.data as CalendarAgendaItem;
      onSelect({ kind: "ride", ...r });
    } else {
      const b = props.data as CalendarBlockItem;
      onSelect({ kind: "block", ...b });
    }
  };

  return (
    <div className="streex-admin-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, listPlugin, interactionPlugin, intlNamedTimeZonePlugin]}
        initialView={isMobile ? "listWeek" : "timeGridWeek"}
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        timeZone="America/Denver"
        height="auto"
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        scrollTime="07:00:00"
        allDaySlot={false}
        nowIndicator
        expandRows
        firstDay={0}
        events={events}
        eventClick={onClick}
        eventContent={(arg) => {
          const props = arg.event.extendedProps as { kind: string; serviceLabel?: string };
          return (
            <div className="streex-evt-inner">
              <div className="streex-evt-title">{arg.event.title}</div>
              <div className="streex-evt-meta">
                {arg.timeText}
                {props.serviceLabel ? ` · ${props.serviceLabel}` : ""}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
