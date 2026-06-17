import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdminAccess } from "./admin-auth.server";
import {
  mergeSiteConfig,
  parseSiteConfigOverride,
  SITE_CONFIG_KEY,
  SiteConfigOverrideSchema,
} from "./site-config";

const EmptySchema = z.object({}).optional();
const AdminSchema = z.object({
  adminKey: z.string().min(1),
});

const SaveSiteConfigSchema = AdminSchema.extend({
  config: SiteConfigOverrideSchema,
});

async function readSiteConfigOverride() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", SITE_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.error("[readSiteConfigOverride] read error", error);
    return null;
  }

  return parseSiteConfigOverride(data?.value);
}

export const getPublicSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmptySchema.parse(input))
  .handler(async () => {
    const override = await readSiteConfigOverride();
    return {
      config: mergeSiteConfig(CONFIG, override),
      source: override ? "database" : "fallback",
    };
  });

export const getAdminSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);
    const override = await readSiteConfigOverride();
    return {
      config: mergeSiteConfig(CONFIG, override),
      override: override ?? {},
      source: override ? "database" : "fallback",
    };
  });

export const updateAdminSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveSiteConfigSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin.from("app_settings").upsert(
      {
        key: SITE_CONFIG_KEY,
        value: JSON.stringify(data.config),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      console.error("[updateAdminSiteConfig] update error", error);
      throw new Error(`Failed to update site config: ${error.message}`);
    }

    return {
      ok: true,
      config: mergeSiteConfig(CONFIG, data.config),
    };
  });
