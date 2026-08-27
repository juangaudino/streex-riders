import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
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
});

const IngestSchema = z.object({
  session: SessionSchema,
  events: z.array(EventSchema).max(25),
});

// This route is intentionally a server-side broker. The browser never receives
// a service key and the anonymous tablet does not get database table access.
export const ingestPassengerAnalytics = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IngestSchema.parse(input))
  .handler(async ({ data }) => {
    const tenant = await requirePublicTenant();
    const { session, events } = data;
    const { error: sessionError } = await supabaseAdmin
      .from("passenger_analytics_sessions")
      .upsert(
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

    if (!events.length) return { accepted: 0 };

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
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (eventsError) {
      console.error("[PassengerAnalytics] event write error", eventsError);
      throw new Error("Passenger analytics are temporarily unavailable.");
    }

    return { accepted: events.length };
  });
