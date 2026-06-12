import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EmptySchema = z.object({}).optional();
const TICKER_STYLES = ["boarding", "pill"] as const;

type TickerStyle = (typeof TICKER_STYLES)[number];

function isTickerStyle(value: string | null | undefined): value is TickerStyle {
  return value === "boarding" || value === "pill";
}

function getFallbackTickerStyle(): TickerStyle {
  return isTickerStyle(CONFIG.tickerStyle) ? CONFIG.tickerStyle : "boarding";
}

export const getTickerTheme = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmptySchema.parse(input))
  .handler(async () => {
    const fallback = getFallbackTickerStyle();

    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("value")
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
