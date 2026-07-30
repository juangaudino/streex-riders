import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_TENANT_ID } from "./admin-auth.server";

export async function resolvePublicTenant(slug?: string | null, previewToken?: string) {
  const normalized = slug?.trim().toLowerCase();
  const query = supabaseAdmin
    .from("tenants")
    .select("id,slug,display_name,owner_name,owner_email,owner_phone,status")
    .eq(normalized ? "slug" : "id", normalized || DEFAULT_TENANT_ID);
  const { data: tenant, error } = await query.maybeSingle();
  if (error) throw new Error("Unable to load this STREEX workspace.");
  if (!tenant) return null;
  if (tenant.status !== "active") {
    if (!previewToken) return null;
    const { verifyTenantPreviewToken } = await import("./tenant-preview.server");
    if (!verifyTenantPreviewToken(previewToken, tenant.id)) return null;
  }
  return tenant;
}

export async function requirePublicTenant(slug?: string | null, previewToken?: string) {
  const tenant = await resolvePublicTenant(slug, previewToken);
  if (!tenant) throw new Error("This STREEX driver page is not available.");
  return tenant;
}
