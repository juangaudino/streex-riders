import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  PASSENGER_ANALYTICS_ENGAGEMENT_END_REASONS,
  PASSENGER_ANALYTICS_ENGAGEMENT_SOURCES,
  PASSENGER_ANALYTICS_ELEMENTS,
  PASSENGER_ANALYTICS_EVENT_NAMES,
  PASSENGER_ANALYTICS_SCREENS,
  PASSENGER_GAME_IDS,
} from "./passenger-analytics";
import { requirePublicTenant } from "./tenant.server";

const IsoDateSchema = z.string().datetime({ offset: true });
const MetadataSchema = z
  .object({
    game: z.enum(PASSENGER_GAME_IDS).optional(),
    source: z.enum(["idle", "navigation", "home", "test_control"]).optional(),
    action: z.enum(["play", "pause", "next", "search", "top_50", "vibes"]).optional(),
  })
  .strict()
  .default({});

const EngagementSchema = z
  .object({
    id: z.string().uuid(),
    deviceInstallationId: z.string().uuid(),
    entryScreen: z.enum(PASSENGER_ANALYTICS_SCREENS),
    entrySource: z.enum(PASSENGER_ANALYTICS_ENGAGEMENT_SOURCES),
    startedAt: IsoDateSchema,
    lastActiveAt: IsoDateSchema,
    endedAt: IsoDateSchema.optional(),
    endedBy: z.enum(PASSENGER_ANALYTICS_ENGAGEMENT_END_REASONS).optional(),
    activeDurationMs: z.number().int().min(0).max(86_400_000),
    interactionCount: z.number().int().min(0).max(10_000),
  })
  .superRefine((engagement, context) => {
    if (Boolean(engagement.endedAt) !== Boolean(engagement.endedBy)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An engagement end time and reason must be provided together.",
      });
    }
  });

const SessionSchema = z.object({
  id: z.string().uuid(),
  deviceInstallationId: z.string().uuid(),
  startedAt: IsoDateSchema,
  lastActiveAt: IsoDateSchema,
  activeDurationMs: z.number().int().min(0).max(86_400_000),
  interactionCount: z.number().int().min(0).max(10_000),
});

const EventSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(PASSENGER_ANALYTICS_EVENT_NAMES),
  screen: z.enum(PASSENGER_ANALYTICS_SCREENS),
  element: z.enum(PASSENGER_ANALYTICS_ELEMENTS),
  occurredAt: IsoDateSchema,
  durationMs: z.number().int().min(0).max(86_400_000).optional(),
  metadata: MetadataSchema.optional(),
  engagementId: z.string().uuid().optional(),
});

const IngestSchema = z.object({
  session: SessionSchema,
  engagements: z.array(EngagementSchema).max(25),
  events: z.array(EventSchema).max(25),
});

// This route is intentionally a server-side broker. The browser never receives
// a service key and the anonymous tablet does not get database table access.
export const ingestPassengerAnalytics = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IngestSchema.parse(input))
  .handler(async ({ data }) => {
    const tenant = await requirePublicTenant();
    const { session, engagements, events } = data;
    const { error: sessionError } = await supabaseAdmin.from("passenger_analytics_sessions").upsert(
      {
        id: session.id,
        tenant_id: tenant.id,
        device_installation_id: session.deviceInstallationId,
        lifecycle: "tablet_unverified",
        started_at: session.startedAt,
        last_active_at: session.lastActiveAt,
        active_duration_ms: session.activeDurationMs,
        interaction_count: session.interactionCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (sessionError) {
      console.error("[PassengerAnalytics] session write error", sessionError);
      throw new Error("Passenger analytics are temporarily unavailable.");
    }

    if (engagements.length) {
      const { error: engagementError } = await supabaseAdmin
        .from("passenger_analytics_engagements")
        .upsert(
          engagements.map((engagement) => ({
            id: engagement.id,
            tenant_id: tenant.id,
            device_installation_id: engagement.deviceInstallationId,
            lifecycle: "tablet_unverified",
            entry_screen: engagement.entryScreen,
            entry_source: engagement.entrySource,
            started_at: engagement.startedAt,
            last_active_at: engagement.lastActiveAt,
            ended_at: engagement.endedAt ?? null,
            ended_by: engagement.endedBy ?? null,
            active_duration_ms: engagement.activeDurationMs,
            interaction_count: engagement.interactionCount,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "id" },
        );
      if (engagementError) {
        console.error("[PassengerAnalytics] engagement write error", engagementError);
        throw new Error("Passenger analytics are temporarily unavailable.");
      }
    }

    if (!events.length) return { accepted: 0, engagementsAccepted: engagements.length };

    const { error: eventsError } = await supabaseAdmin.from("passenger_analytics_events").upsert(
      events.map((event) => ({
        id: event.id,
        tenant_id: tenant.id,
        session_id: session.id,
        event_name: event.name,
        screen: event.screen,
        element: event.element,
        occurred_at: event.occurredAt,
        duration_ms: event.durationMs ?? null,
        metadata: event.metadata ?? {},
        engagement_id: event.engagementId ?? null,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (eventsError) {
      console.error("[PassengerAnalytics] event write error", eventsError);
      throw new Error("Passenger analytics are temporarily unavailable.");
    }

    return { accepted: events.length, engagementsAccepted: engagements.length };
  });
