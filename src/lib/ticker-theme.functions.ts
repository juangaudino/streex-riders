import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdminAccess } from "./admin-auth.server";

const PublicSchema = z.object({ tenantSlug: z.string().trim().max(63).optional() }).optional();
const TICKER_STYLES = ["boarding", "pill"] as const;

type TickerStyle = (typeof TICKER_STYLES)[number];

function isTickerStyle(value: string | null | undefined): value is TickerStyle {
  return value === "boarding" || value === "pill";
}

function getFallbackTickerStyle(): TickerStyle {
  return isTickerStyle(CONFIG.tickerStyle) ? CONFIG.tickerStyle : "boarding";
}

export const getTickerTheme = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PublicSchema.parse(input))
  .handler(async ({ data: input }) => {
    const { requirePublicTenant } = await import("./tenant.server");
    const tenant = await requirePublicTenant(input?.tenantSlug);
    const fallback = getFallbackTickerStyle();

    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("tenant_id", tenant.id)
      .eq("key", "ticker_style")
      .maybeSingle();

    if (error) {
      console.error("[getTickerTheme] read error", error);
      return { tickerStyle: fallback, source: "fallback" as const };
    }

    return {
      tickerStyle: isTickerStyle(data?.value) ? data.value : fallback,
      source: isTickerStyle(data?.value) ? ("database" as const) : ("fallback" as const),
    };
  });

export const getAdminTickerTheme = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ adminKey: z.string().optional().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const result = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("tenant_id", access.tenantId)
      .eq("key", "ticker_style")
      .maybeSingle();
    const fallback = getFallbackTickerStyle();
    if (result.error) throw new Error("Failed to load ticker theme.");
    return { tickerStyle: isTickerStyle(result.data?.value) ? result.data.value : fallback };
  });
