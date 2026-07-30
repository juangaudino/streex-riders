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

const PublicSchema = z
  .object({
    tenantSlug: z.string().trim().max(63).optional(),
    previewToken: z.string().trim().max(4096).optional(),
  })
  .optional();
const AdminSchema = z.object({
  adminKey: z.string().optional().default(""),
});

const SaveSiteConfigSchema = AdminSchema.extend({
  config: SiteConfigOverrideSchema,
});

async function readSiteConfigOverride(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("tenant_id", tenantId)
    .eq("key", SITE_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.error("[readSiteConfigOverride] read error", error);
    return null;
  }

  return parseSiteConfigOverride(data?.value);
}

function baseConfigForTenant(tenant: {
  id: string;
  slug: string;
  display_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
}) {
  if (tenant.id === "streex") return CONFIG;
  const website = `https://rides.getstreex.com/${tenant.slug}`;
  return {
    ...CONFIG,
    brandName: tenant.display_name,
    ownerName: tenant.owner_name,
    email: tenant.owner_email,
    phone: tenant.owner_phone || CONFIG.phone,
    phoneDisplay: tenant.owner_phone || CONFIG.phoneDisplay,
    website,
    seoUrl: website,
    seoTitle: `${tenant.display_name} | Private Rides by STREEX`,
    seoDescription: `Private rides with ${tenant.owner_name}, powered by STREEX Rides. Reliable, comfortable and personalized transportation.`,
  };
}

export const getPublicSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PublicSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePublicTenant } = await import("./tenant.server");
    const tenant = await requirePublicTenant(data?.tenantSlug, data?.previewToken);
    const override = await readSiteConfigOverride(tenant.id);
    return {
      config: mergeSiteConfig(baseConfigForTenant(tenant), override),
      tenant,
      source: override ? "database" : "fallback",
    };
  });

export const getAdminSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id,slug,display_name,owner_name,owner_email,owner_phone")
      .eq("id", access.tenantId)
      .single();
    if (tenantError || !tenant) throw new Error("Failed to load workspace.");
    const override = await readSiteConfigOverride(access.tenantId);
    return {
      config: mergeSiteConfig(baseConfigForTenant(tenant), override),
      override: override ?? {},
      source: override ? "database" : "fallback",
    };
  });

export const updateAdminSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveSiteConfigSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id,slug,display_name,owner_name,owner_email,owner_phone")
      .eq("id", access.tenantId)
      .single();
    if (tenantError || !tenant) throw new Error("Failed to load workspace.");

    const { error } = await supabaseAdmin.from("app_settings").upsert(
      {
        key: SITE_CONFIG_KEY,
        tenant_id: access.tenantId,
        value: JSON.stringify(data.config),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,key" },
    );

    if (error) {
      console.error("[updateAdminSiteConfig] update error", error);
      throw new Error(`Failed to update site config: ${error.message}`);
    }
    await supabaseAdmin
      .from("tenants")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", access.tenantId);

    return {
      ok: true,
      config: mergeSiteConfig(baseConfigForTenant(tenant), data.config),
    };
  });
