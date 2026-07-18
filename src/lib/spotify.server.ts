import {
  createSpotifyOAuthState,
  decryptSpotifyToken,
  encryptSpotifyToken,
  verifySpotifyOAuthState,
} from "./spotify-crypto.server";

const SPOTIFY_API = "https://api.spotify.com/v1";

export const SPOTIFY_PERSONAL_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
] as const;

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type SpotifyPlaybackResponse = {
  device?: { name?: string };
  is_playing?: boolean;
  item?: {
    name?: string;
    album?: { name?: string; images?: Array<{ url?: string }> };
    artists?: Array<{ name?: string }>;
  } | null;
  error?: { message?: string };
};

export type PersonalSpotifyPlayback = {
  hasActiveDevice: boolean;
  isPlaying: boolean;
  track: {
    title: string;
    artist: string;
    album: string | null;
    artworkUrl: string | null;
  } | null;
};

function getSpotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI?.trim() || "https://rides.getstreex.com/spotify/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Spotify personal integration is not configured.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function isSpotifyPersonalIntegrationEnabled() {
  return process.env.SPOTIFY_PERSONAL_INTEGRATION_ENABLED === "true";
}

export function assertSpotifyPersonalIntegrationEnabled() {
  if (!isSpotifyPersonalIntegrationEnabled()) {
    throw new Error("Spotify personal integration is disabled.");
  }
}

export function buildSpotifyAuthorizationUrl() {
  assertSpotifyPersonalIntegrationEnabled();
  const { clientId, redirectUri } = getSpotifyConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_PERSONAL_SCOPES.join(" "),
    state: createSpotifyOAuthState(),
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(code: string, state: string) {
  assertSpotifyPersonalIntegrationEnabled();
  verifySpotifyOAuthState(state);
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig();
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = (await response.json()) as TokenResponse;
  if (!response.ok || !tokens.refresh_token) {
    console.error("[Spotify] token exchange failed", tokens.error);
    throw new Error(tokens.error_description || "Spotify did not return offline access.");
  }

  return {
    encryptedRefreshToken: encryptSpotifyToken(tokens.refresh_token),
    scopes: (tokens.scope || SPOTIFY_PERSONAL_SCOPES.join(" ")).split(" ").filter(Boolean),
  };
}

export async function refreshSpotifyAccessToken(encryptedRefreshToken: string) {
  assertSpotifyPersonalIntegrationEnabled();
  const { clientId, clientSecret } = getSpotifyConfig();
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: decryptSpotifyToken(encryptedRefreshToken),
    }),
  });
  const tokens = (await response.json()) as TokenResponse;
  if (!response.ok || !tokens.access_token) {
    console.error("[Spotify] token refresh failed", tokens.error);
    throw new Error("Spotify needs to be reconnected by the driver.");
  }
  return tokens.access_token;
}

export async function getSpotifyPlayback(accessToken: string): Promise<PersonalSpotifyPlayback> {
  const response = await spotifyFetch(`${SPOTIFY_API}/me/player`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 204) {
    return { hasActiveDevice: false, isPlaying: false, track: null };
  }

  const result = (await response.json()) as SpotifyPlaybackResponse;
  if (!response.ok) throw new Error(result.error?.message || "Spotify playback is unavailable.");

  const item = result.item;
  return {
    hasActiveDevice: Boolean(result.device?.name),
    isPlaying: Boolean(result.is_playing),
    track: item?.name
      ? {
          title: item.name,
          artist: (item.artists ?? []).flatMap((artist) => (artist.name ? [artist.name] : [])).join(", ") || "Spotify",
          album: item.album?.name ?? null,
          artworkUrl: item.album?.images?.find((image) => image.url)?.url ?? null,
        }
      : null,
  };
}

export async function controlSpotifyPlayback(
  accessToken: string,
  command: "play" | "pause" | "next",
) {
  const endpoint =
    command === "play"
      ? "/me/player/play"
      : command === "pause"
        ? "/me/player/pause"
        : "/me/player/next";
  const response = await spotifyFetch(`${SPOTIFY_API}${endpoint}`, {
    method: command === "next" ? "POST" : "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.ok || response.status === 204) return;

  const result = (await response.json().catch(() => ({}))) as SpotifyPlaybackResponse;
  throw new Error(result.error?.message || "Spotify could not control the active audio device.");
}

async function spotifyFetch(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Spotify did not respond in time.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
