import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdminAccess } from "./admin-auth.server";
import { createCalendarOAuthState } from "./calendar-crypto.server";
import {
  buildGoogleCalendarAuthorizationUrl,
  exchangeGoogleCalendarCode,
  listGoogleCalendars,
  refreshGoogleCalendarAccessToken,
  revokeGoogleCalendarToken,
} from "./google-calendar.server";

const CONNECTION_ID = "google-primary";
const AdminSchema = z.object({ adminKey: z.string().optional().default("") });
const CallbackSchema = z.object({
  code: z.string().min(1).max(4096),
  state: z.string().min(1).max(4096),
});
const SettingsSchema = AdminSchema.extend({
  busyCalendarIds: z.array(z.string().min(1).max(1024)).max(50),
  writeCalendarId: z.string().min(1).max(1024),
});

export const startGoogleCalendarConnection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const oauthState = createCalendarOAuthState({
      tenantId: access.tenantId,
      userId: access.userId,
    });
    const { error } = await supabaseAdmin.from("calendar_oauth_states").insert({
      nonce: oauthState.payload.nonce,
      tenant_id: access.tenantId,
      user_id: access.userId,
      expires_at: new Date(oauthState.payload.issuedAt + 10 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error("Unable to start secure Google authorization.");
    return { authorizationUrl: buildGoogleCalendarAuthorizationUrl(oauthState.state) };
  });

export const completeGoogleCalendarConnection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CallbackSchema.parse(input))
  .handler(async ({ data }) => {
    const tokens = await exchangeGoogleCalendarCode(data.code, data.state);
    const now = new Date().toISOString();
    const { data: consumedState, error: stateError } = await supabaseAdmin
      .from("calendar_oauth_states")
      .update({ consumed_at: now })
      .eq("nonce", tokens.statePayload.nonce)
      .eq("tenant_id", tokens.statePayload.tenantId)
      .is("consumed_at", null)
      .gt("expires_at", now)
      .select("tenant_id")
      .maybeSingle();
    if (stateError || !consumedState)
      throw new Error("Google authorization was already used or expired.");
    const calendars = await listGoogleCalendars(tokens.accessToken);
    const primary = calendars.find((calendar) => calendar.primary);

    const { error } = await supabaseAdmin.from("calendar_connections").upsert(
      {
        id: CONNECTION_ID,
        tenant_id: tokens.statePayload.tenantId,
        provider: "google",
        account_email: primary?.id ?? null,
        encrypted_refresh_token: tokens.encryptedRefreshToken,
        scopes: tokens.scopes,
        busy_calendar_ids: primary ? [primary.id] : [],
        write_calendar_id: null,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_error: null,
      },
      { onConflict: "tenant_id,id" },
    );
    if (error) {
      console.error("[Google Calendar] connection save failed", error);
      throw new Error("Google connected, but the secure connection could not be saved.");
    }
    return { ok: true };
  });

export const getGoogleCalendarStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: connection, error } = await supabaseAdmin
      .from("calendar_connections")
      .select("account_email,busy_calendar_ids,write_calendar_id,connected_at,last_error")
      .eq("id", CONNECTION_ID)
      .eq("tenant_id", access.tenantId)
      .maybeSingle();
    if (error) throw new Error("Failed to load Google Calendar connection status.");
    return {
      connected: Boolean(connection),
      accountEmail: connection?.account_email ?? null,
      busyCalendarIds: Array.isArray(connection?.busy_calendar_ids)
        ? connection.busy_calendar_ids.filter((item): item is string => typeof item === "string")
        : [],
      writeCalendarId: connection?.write_calendar_id ?? null,
      connectedAt: connection?.connected_at ?? null,
      lastError: connection?.last_error ?? null,
    };
  });

export const getGoogleCalendarOptions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: connection, error } = await supabaseAdmin
      .from("calendar_connections")
      .select("encrypted_refresh_token")
      .eq("id", CONNECTION_ID)
      .eq("tenant_id", access.tenantId)
      .single();
    if (error || !connection) throw new Error("Connect Google Calendar first.");
    const accessToken = await refreshGoogleCalendarAccessToken(connection.encrypted_refresh_token);
    return { calendars: await listGoogleCalendars(accessToken) };
  });

export const saveGoogleCalendarSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SettingsSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    if (!data.busyCalendarIds.includes(data.writeCalendarId)) {
      throw new Error("The STREEX write calendar must also block availability.");
    }
    const { error } = await supabaseAdmin
      .from("calendar_connections")
      .update({
        busy_calendar_ids: data.busyCalendarIds,
        write_calendar_id: data.writeCalendarId,
        updated_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", CONNECTION_ID)
      .eq("tenant_id", access.tenantId);
    if (error) throw new Error("Failed to save Google Calendar settings.");
    return { ok: true };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: connection } = await supabaseAdmin
      .from("calendar_connections")
      .select("encrypted_refresh_token")
      .eq("id", CONNECTION_ID)
      .eq("tenant_id", access.tenantId)
      .maybeSingle();
    if (connection) await revokeGoogleCalendarToken(connection.encrypted_refresh_token);
    const { error } = await supabaseAdmin
      .from("calendar_connections")
      .delete()
      .eq("id", CONNECTION_ID)
      .eq("tenant_id", access.tenantId);
    if (error) throw new Error("Failed to disconnect Google Calendar.");
    return { ok: true };
  });
