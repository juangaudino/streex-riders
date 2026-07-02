import {
  createCalendarOAuthState,
  decryptCalendarToken,
  encryptCalendarToken,
  verifyCalendarOAuthState,
} from "./calendar-crypto.server";

const FALLBACK_CLIENT_ID =
  "413780579419-qlg1lh30k481ajl4tk8bu57acdr2dt93.apps.googleusercontent.com";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
] as const;

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type GoogleCalendarListItem = {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
};

export type GoogleBusyInterval = {
  start: string;
  end: string;
};

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() || FALLBACK_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim() ||
    "https://rides.getstreex.com/google-calendar/callback";

  if (!clientSecret) throw new Error("GOOGLE_CALENDAR_CLIENT_SECRET is not configured.");
  return { clientId, clientSecret, redirectUri };
}

export function buildGoogleCalendarAuthorizationUrl() {
  const { clientId, redirectUri } = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    state: createCalendarOAuthState(),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(code: string, state: string) {
  verifyCalendarOAuthState(state);
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = (await response.json()) as TokenResponse;
  if (!response.ok || !tokens.access_token || !tokens.refresh_token) {
    console.error("[Google Calendar] token exchange failed", tokens.error);
    throw new Error(tokens.error_description || "Google did not return offline calendar access.");
  }
  return {
    accessToken: tokens.access_token,
    encryptedRefreshToken: encryptCalendarToken(tokens.refresh_token),
    scopes: (tokens.scope || GOOGLE_CALENDAR_SCOPES.join(" ")).split(" ").filter(Boolean),
  };
}

export async function refreshGoogleCalendarAccessToken(encryptedRefreshToken: string) {
  const { clientId, clientSecret } = getGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptCalendarToken(encryptedRefreshToken),
      grant_type: "refresh_token",
    }),
  });
  const tokens = (await response.json()) as TokenResponse;
  if (!response.ok || !tokens.access_token) {
    console.error("[Google Calendar] token refresh failed", tokens.error);
    throw new Error("Google Calendar access needs to be reconnected.");
  }
  return tokens.access_token;
}

export async function listGoogleCalendars(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100&minAccessRole=reader",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const result = (await response.json()) as {
    items?: Array<{
      id?: string;
      summary?: string;
      primary?: boolean;
      accessRole?: string;
    }>;
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(result.error?.message || "Failed to load Google calendars.");

  return (result.items ?? []).flatMap((calendar): GoogleCalendarListItem[] => {
    if (!calendar.id) return [];
    return [
      {
        id: calendar.id,
        summary: calendar.summary || calendar.id,
        primary: Boolean(calendar.primary),
        accessRole: calendar.accessRole || "reader",
      },
    ];
  });
}

export async function queryGoogleCalendarFreeBusy(
  accessToken: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string,
  timeZone: string,
) {
  if (calendarIds.length === 0) return [] as GoogleBusyInterval[];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone,
        items: calendarIds.map((id) => ({ id })),
      }),
      signal: controller.signal,
    });
    const result = (await response.json()) as {
      calendars?: Record<
        string,
        { busy?: GoogleBusyInterval[]; errors?: Array<{ reason?: string }> }
      >;
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new Error(result.error?.message || "Google Calendar availability request failed.");
    }

    const intervals: GoogleBusyInterval[] = [];
    for (const calendarId of calendarIds) {
      const calendar = result.calendars?.[calendarId];
      if (!calendar || (calendar.errors?.length ?? 0) > 0) {
        throw new Error(`Google Calendar could not read availability for ${calendarId}.`);
      }
      for (const interval of calendar.busy ?? []) {
        if (interval.start && interval.end) intervals.push(interval);
      }
    }
    return intervals;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Google Calendar availability request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function revokeGoogleCalendarToken(encryptedRefreshToken: string) {
  const token = decryptCalendarToken(encryptedRefreshToken);
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).catch(() => undefined);
}
