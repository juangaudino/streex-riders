import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { assertAdminAccess, requireSuperAdmin } from "./admin-auth.server";
import {
  buildAdminNewRequest,
  buildPassengerCancelled,
  buildPassengerRejected,
  buildPassengerQuote,
  getTenantEmailBrand,
  sendEmail,
} from "./booking-emails.server";
import { bookingConflictMessage } from "./schedule-conflicts";
import { syncBookingWithGoogleCalendar } from "./google-calendar-sync.server";
import { updatePricingQuoteLifecycleForBooking } from "./pricing-lifecycle.server";

const AdminSchema = z.object({
  adminKey: z.string().optional().default(""),
});

const BookingStatusSchema = AdminSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "declined", "completed", "cancelled"]),
});

const QuoteSchema = AdminSchema.extend({
  id: z.string().uuid(),
  price: z.number().positive().max(100000),
});

const ReviewStatusSchema = AdminSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

const ReviewIdSchema = AdminSchema.extend({
  id: z.string().uuid(),
});

const TickerThemeSchema = AdminSchema.extend({
  tickerStyle: z.enum(["boarding", "pill"]),
});

const RunnerScoreStatusSchema = AdminSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

const RunnerScoreUpdateSchema = AdminSchema.extend({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(24),
  score: z.number().int().min(0).max(999999),
});
const PassengerAnalyticsSummarySchema = AdminSchema.extend({
  days: z.number().int().min(1).max(90).default(30),
});
const PASSENGER_ANALYTICS_BETA_START_KEY = "passenger_analytics_beta_start_v1";

function parseAnalyticsReportingStart(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

async function getPassengerAnalyticsReportingStart(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("tenant_id", tenantId)
    .eq("key", PASSENGER_ANALYTICS_BETA_START_KEY)
    .maybeSingle();

  if (error) {
    console.error("[PassengerAnalytics] beta start read error", error);
    throw new Error("Unable to load Passenger analytics settings.");
  }

  return parseAnalyticsReportingStart(data?.value);
}

function passengerAnalyticsGame(metadata: Json) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const game = metadata.game;
  return game === "trivia" || game === "choice" || game === "higher-lower" ? game : null;
}

export const listAdminBookings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("tenant_id", access.tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listAdminBookings] read error", error);
      throw new Error("Failed to load bookings.");
    }

    return { bookings: bookings ?? [] };
  });

export const getAdminPassengerAnalyticsSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PassengerAnalyticsSummarySchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const reportingStartedAt = await getPassengerAnalyticsReportingStart(access.tenantId);
    const requestedCutoff = new Date(Date.now() - data.days * 24 * 60 * 60 * 1_000);
    const reportingStart = reportingStartedAt ? new Date(reportingStartedAt) : null;
    const cutoff = (reportingStart && reportingStart > requestedCutoff ? reportingStart : requestedCutoff).toISOString();
    const [sessionsResult, eventsResult] = await Promise.all([
      supabaseAdmin
        .from("passenger_analytics_sessions")
        .select("id,active_duration_ms,interaction_count,lifecycle,started_at")
        .eq("tenant_id", access.tenantId)
        .gte("started_at", cutoff),
      supabaseAdmin
        .from("passenger_analytics_events")
        .select("event_name,screen,session_id,metadata")
        .eq("tenant_id", access.tenantId)
        .gte("occurred_at", cutoff),
    ]);
    if (sessionsResult.error || eventsResult.error) {
      console.error("[PassengerAnalytics] admin summary error", {
        sessions: sessionsResult.error,
        events: eventsResult.error,
      });
      throw new Error("Unable to load Passenger analytics.");
    }

    const sessions = sessionsResult.data ?? [];
    const events = eventsResult.data ?? [];
    const byScreen = Object.fromEntries(
      Array.from(new Set(events.map((event) => event.screen))).map((screen) => [
        screen,
        events.filter((event) => event.event_name === "screen_viewed" && event.screen === screen)
          .length,
      ]),
    );
    const gameCounts = Object.fromEntries(
      ["trivia", "choice", "higher-lower"].map((game) => [
        game,
        {
          opened: events.filter(
            (event) => event.event_name === "game_opened" && passengerAnalyticsGame(event.metadata) === game,
          ).length,
          started: events.filter(
            (event) => event.event_name === "game_started" && passengerAnalyticsGame(event.metadata) === game,
          ).length,
          completed: events.filter(
            (event) => event.event_name === "game_completed" && passengerAnalyticsGame(event.metadata) === game,
          ).length,
        },
      ]),
    );

    return {
      days: data.days,
      reportingStartedAt,
      sessions: sessions.length,
      interactiveSessions: sessions.filter((session) => session.interaction_count > 0).length,
      sessionsWithoutInteraction: sessions.filter((session) => session.interaction_count === 0).length,
      averageActiveDurationMs: sessions.length
        ? Math.round(
            sessions.reduce((total, session) => total + session.active_duration_ms, 0) / sessions.length,
          )
        : 0,
      firstInteractions: events.filter((event) => event.event_name === "first_interaction").length,
      music: {
        opened: events.filter((event) => event.event_name === "music_opened").length,
        actions: events.filter((event) => event.event_name === "music_action").length,
      },
      idle: {
        entered: events.filter((event) => event.event_name === "idle_entered").length,
        logicalRest: events.filter((event) => event.event_name === "logical_rest_entered").length,
      },
      byScreen,
      games: gameCounts,
      lifecycle: {
        tabletUnverified: sessions.filter((session) => session.lifecycle === "tablet_unverified").length,
        driverConfirmed: sessions.filter((session) => session.lifecycle === "driver_confirmed").length,
      },
    };
  });

export const startAdminPassengerAnalyticsBeta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const reportingStartedAt = new Date().toISOString();
    const { error } = await supabaseAdmin.from("app_settings").upsert(
      {
        key: PASSENGER_ANALYTICS_BETA_START_KEY,
        tenant_id: access.tenantId,
        value: reportingStartedAt,
        updated_at: reportingStartedAt,
      },
      { onConflict: "tenant_id,key" },
    );
    if (error) {
      console.error("[PassengerAnalytics] beta start save error", error);
      throw new Error("Unable to start Passenger beta measurement.");
    }
    return { reportingStartedAt };
  });

export const sendAdminQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ price: data.price, status: "quoted" })
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId)
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[sendAdminQuote] update error", error);
      throw new Error(bookingConflictMessage(error) ?? "Failed to send quote.");
    }

    const brand = await getTenantEmailBrand(access.tenantId);
    const msg = buildPassengerQuote(booking, brand);
    await sendEmail({ to: booking.email, ...msg });
    return { ok: true };
  });

export const updateAdminBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BookingStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId)
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[updateAdminBookingStatus] update error", error);
      throw new Error(bookingConflictMessage(error) ?? "Failed to update booking.");
    }

    const calendarSync = await syncBookingWithGoogleCalendar(booking, access.tenantId);
    if (data.status === "completed" || data.status === "cancelled" || data.status === "declined") {
      await updatePricingQuoteLifecycleForBooking(booking.id, access.tenantId, data.status);
    }
    if (data.status === "declined" || data.status === "cancelled") {
      try {
        const brand = await getTenantEmailBrand(access.tenantId);
        const message =
          data.status === "cancelled"
            ? buildPassengerCancelled(booking, brand)
            : buildPassengerRejected(booking, brand);
        await sendEmail({ to: booking.email, ...message });
      } catch (emailError) {
        console.error("[updateAdminBookingStatus] status email failed", emailError);
      }
    }
    return { ok: true, calendarSync };
  });

export const retryAdminBookingCalendarSync = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId)
      .single();
    if (error || !booking) throw new Error("Failed to load booking for calendar sync.");
    if (booking.status !== "confirmed" && booking.status !== "cancelled") {
      throw new Error("Only confirmed or cancelled rides can be synchronized.");
    }

    const calendarSync = await syncBookingWithGoogleCalendar(booking, access.tenantId);
    if (calendarSync.status === "error") throw new Error(calendarSync.error);
    return { ok: true, calendarSync };
  });

export const resendAdminBookingNotification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId)
      .single();

    if (error || !booking) {
      console.error("[resendAdminBookingNotification] read error", error);
      throw new Error("Failed to load booking.");
    }

    const brand = await getTenantEmailBrand(access.tenantId);
    await sendEmail({ to: brand.email, ...buildAdminNewRequest(booking, brand) });
    return { ok: true };
  });

export const listAdminReviews = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("tenant_id", access.tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listAdminReviews] read error", error);
      throw new Error("Failed to load reviews.");
    }

    return { reviews: reviews ?? [] };
  });

export const updateAdminReviewStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin
      .from("reviews")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId);

    if (error) {
      console.error("[updateAdminReviewStatus] update error", error);
      throw new Error("Failed to update review.");
    }

    return { ok: true };
  });

export const deleteAdminReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", data.id)
      .eq("tenant_id", access.tenantId);

    if (error) {
      console.error("[deleteAdminReview] delete error", error);
      throw new Error("Failed to delete review.");
    }

    return { ok: true };
  });

export const updateAdminTickerTheme = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TickerThemeSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin.from("app_settings").upsert(
      {
        key: "ticker_style",
        tenant_id: access.tenantId,
        value: data.tickerStyle,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,key" },
    );

    if (error) {
      console.error("[updateAdminTickerTheme] update error", error);
      throw new Error(`Failed to update ticker theme: ${error.message}`);
    }

    return { ok: true, tickerStyle: data.tickerStyle };
  });

export const listAdminRunnerScores = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    await requireSuperAdmin(data.adminKey);

    const { data: scores, error } = await supabaseAdmin
      .from("runner_scores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listAdminRunnerScores] read error", error);
      if (isRunnerScoresMissing(error)) {
        throw new Error(getRunnerScoresNotReadyMessage());
      }
      throw new Error("Failed to load runner scores.");
    }

    return { scores: scores ?? [] };
  });

export const updateAdminRunnerScoreStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RunnerScoreStatusSchema.parse(input))
  .handler(async ({ data }) => {
    await requireSuperAdmin(data.adminKey);

    const { error } = await supabaseAdmin
      .from("runner_scores")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) {
      console.error("[updateAdminRunnerScoreStatus] update error", error);
      if (isRunnerScoresMissing(error)) {
        throw new Error(getRunnerScoresNotReadyMessage());
      }
      throw new Error("Failed to update runner score.");
    }

    return { ok: true };
  });

export const updateAdminRunnerScore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RunnerScoreUpdateSchema.parse(input))
  .handler(async ({ data }) => {
    await requireSuperAdmin(data.adminKey);

    const { error } = await supabaseAdmin
      .from("runner_scores")
      .update({
        name: data.name,
        score: data.score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      console.error("[updateAdminRunnerScore] update error", error);
      if (isRunnerScoresMissing(error)) {
        throw new Error(getRunnerScoresNotReadyMessage());
      }
      throw new Error("Failed to edit runner score.");
    }

    return { ok: true };
  });

export const deleteAdminRunnerScore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    await requireSuperAdmin(data.adminKey);

    const { error } = await supabaseAdmin.from("runner_scores").delete().eq("id", data.id);

    if (error) {
      console.error("[deleteAdminRunnerScore] delete error", error);
      if (isRunnerScoresMissing(error)) {
        throw new Error(getRunnerScoresNotReadyMessage());
      }
      throw new Error("Failed to delete runner score.");
    }

    return { ok: true };
  });

function isRunnerScoresMissing(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return (
    candidate.code === "42P01" || candidate.code === "PGRST205" || text.includes("runner_scores")
  );
}

function getRunnerScoresNotReadyMessage() {
  return "Horizon records are not ready yet. Apply the runner_scores migration in Lovable Cloud.";
}
