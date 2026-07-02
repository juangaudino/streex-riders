import { useCallback, useEffect, useState } from "react";
import { CalendarSync, CheckCircle2, ExternalLink, RefreshCw, Unplug } from "lucide-react";
import {
  disconnectGoogleCalendar,
  getGoogleCalendarOptions,
  getGoogleCalendarStatus,
  saveGoogleCalendarSettings,
  startGoogleCalendarConnection,
} from "@/lib/calendar.functions";

type CalendarOption = {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
};

type ConnectionStatus = Awaited<ReturnType<typeof getGoogleCalendarStatus>>;

export function GoogleCalendarConnectionCard({ adminKey }: { adminKey: string }) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [busyCalendarIds, setBusyCalendarIds] = useState<string[]>([]);
  const [writeCalendarId, setWriteCalendarId] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextStatus = await getGoogleCalendarStatus({ data: { adminKey } });
      setStatus(nextStatus);
      setBusyCalendarIds(nextStatus.busyCalendarIds);
      setWriteCalendarId(nextStatus.writeCalendarId || "");
      if (nextStatus.connected) {
        const result = await getGoogleCalendarOptions({ data: { adminKey } });
        setCalendars(result.calendars);
      } else {
        setCalendars([]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load Google Calendar status.",
      );
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = async () => {
    setWorking(true);
    setError(null);
    try {
      const result = await startGoogleCalendarConnection({ data: { adminKey } });
      window.location.assign(result.authorizationUrl);
    } catch (connectError) {
      setError(
        connectError instanceof Error ? connectError.message : "Connection could not start.",
      );
      setWorking(false);
    }
  };

  const toggleBusyCalendar = (calendarId: string) => {
    setBusyCalendarIds((current) => {
      if (current.includes(calendarId)) {
        if (calendarId === writeCalendarId) return current;
        return current.filter((id) => id !== calendarId);
      }
      return [...current, calendarId];
    });
  };

  const selectWriteCalendar = (calendarId: string) => {
    setWriteCalendarId(calendarId);
    setBusyCalendarIds((current) =>
      current.includes(calendarId) ? current : [...current, calendarId],
    );
  };

  const save = async () => {
    if (!writeCalendarId) {
      setError("Select the dedicated STREEX Rides calendar first.");
      return;
    }
    setWorking(true);
    setError(null);
    setMessage(null);
    try {
      await saveGoogleCalendarSettings({
        data: { adminKey, busyCalendarIds, writeCalendarId },
      });
      setMessage("Google Calendar settings saved.");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Calendar settings were not saved.",
      );
    } finally {
      setWorking(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google Calendar from STREEX?")) return;
    setWorking(true);
    setError(null);
    try {
      await disconnectGoogleCalendar({ data: { adminKey } });
      setMessage("Google Calendar disconnected.");
      await load();
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : "Calendar was not disconnected.",
      );
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <p className="text-xs text-white/45">Loading Google Calendar connection...</p>;
  }

  if (!status?.connected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
            <CalendarSync className="h-5 w-5 text-[#E6CE20]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Not connected</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">
              Connect the calendar account used for your personal schedule and STREEX rides.
            </p>
          </div>
        </div>
        {error && <CalendarError message={error} />}
        {message && <CalendarMessage message={message} />}
        <button
          type="button"
          onClick={() => void connect()}
          disabled={working}
          className="self-start inline-flex items-center gap-2 rounded-xl bg-[#E6CE20] px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          <ExternalLink className="h-4 w-4" />
          {working ? "Connecting..." : "Connect Google Calendar"}
        </button>
      </div>
    );
  }

  const writableCalendars = calendars.filter(
    (calendar) => calendar.accessRole === "owner" || calendar.accessRole === "writer",
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E6CE20]" />
          <div>
            <p className="text-sm font-semibold text-white">Connected</p>
            <p className="mt-0.5 text-[11px] text-white/45">
              {status.accountEmail || "Google Calendar account"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={working}
          aria-label="Refresh Google calendars"
          className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && <CalendarError message={error} />}
      {!error && status.lastError && (
        <CalendarError message={`Last calendar sync issue: ${status.lastError}`} />
      )}
      {message && <CalendarMessage message={message} />}

      <div>
        <p className="text-[10px] uppercase streex-tracking text-white/45 mb-2">
          Calendars that block availability
        </p>
        <div className="space-y-2">
          {calendars.map((calendar) => (
            <label
              key={calendar.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3"
            >
              <input
                type="checkbox"
                checked={busyCalendarIds.includes(calendar.id)}
                onChange={() => toggleBusyCalendar(calendar.id)}
                className="mt-0.5 accent-[#E6CE20]"
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">
                  {calendar.summary}
                </span>
                {calendar.primary && (
                  <span className="mt-0.5 block text-[10px] text-white/40">Primary calendar</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase streex-tracking text-white/45 mb-2">
          Calendar for confirmed STREEX rides
        </p>
        <select
          value={writeCalendarId}
          onChange={(event) => selectWriteCalendar(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#151515] px-3 py-3 text-sm text-white focus:outline-none focus:border-[#E6CE20]/40"
        >
          <option value="">Select STREEX Rides calendar</option>
          {writableCalendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.summary}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          Create a separate calendar named STREEX Rides in Google Calendar if it is not listed, then
          refresh this card.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={working || !writeCalendarId || busyCalendarIds.length === 0}
          className="rounded-xl bg-[#E6CE20] px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-50"
        >
          {working ? "Saving..." : "Save calendar settings"}
        </button>
        <button
          type="button"
          onClick={() => void disconnect()}
          disabled={working}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/55 hover:text-red-300 disabled:opacity-50"
        >
          <Unplug className="h-3.5 w-3.5" />
          Disconnect
        </button>
      </div>
    </div>
  );
}

function CalendarError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-400/25 bg-red-400/[0.05] px-3 py-2 text-xs text-red-300">
      {message}
    </p>
  );
}

function CalendarMessage({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[#E6CE20]/25 bg-[#E6CE20]/[0.05] px-3 py-2 text-xs text-[#E6CE20]">
      {message}
    </p>
  );
}
