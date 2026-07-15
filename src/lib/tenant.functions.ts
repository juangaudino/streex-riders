import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { assertAdminAccess, requireSuperAdmin } from "./admin-auth.server";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "assets",
  "booking",
  "google-calendar",
  "privacy",
  "runner-lab",
  "sitemap.xml",
]);

const AdminSchema = z.object({ adminKey: z.string().optional().default("") });
const CreateDriverSchema = AdminSchema.extend({
  displayName: z.string().trim().min(2).max(120),
  ownerName: z.string().trim().min(2).max(120),
  ownerEmail: z.string().trim().email().max(200),
  ownerPhone: z.string().trim().max(40).optional().nullable(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,62}$/),
});
const TenantStatusSchema = AdminSchema.extend({
  tenantId: z.string().min(1).max(80),
  status: z.enum(["draft", "active", "suspended", "archived"]),
});
const BootstrapSchema = AdminSchema.extend({
  email: z.string().trim().email().max(200),
  fullName: z.string().trim().min(2).max(120),
});
const TenantOwnerSchema = AdminSchema.extend({
  tenantId: z.string().min(1).max(80),
  ownerName: z.string().trim().min(2).max(120),
  ownerEmail: z.string().trim().email().max(200),
});
const TenantActionSchema = AdminSchema.extend({ tenantId: z.string().min(1).max(80) });

async function findAuthUserByEmail(email: string) {
  const normalized = email.toLowerCase();
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("Unable to inspect invited users.");
    const found = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function inviteOrFindUser(email: string) {
  const existing = await findAuthUserByEmail(email);
  if (existing) return { user: existing, invited: false };
  const redirectTo = `${process.env.SITE_URL || "https://rides.getstreex.com"}/admin`;
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error || !data.user) throw new Error(error?.message || "Unable to invite this driver.");
  return { user: data.user, invited: true };
}

async function writeAudit(
  tenantId: string | null,
  actorUserId: string | null,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabaseAdmin.from("audit_log").insert({
    tenant_id: tenantId,
    actor_user_id: actorUserId,
    action,
    metadata: metadata as Json,
  });
  if (error) console.error("[audit_log] write failed", error);
}

export const getAdminSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    let tenants;
    if (access.isSuperAdmin) {
      const result = await supabaseAdmin.from("tenants").select("*").order("created_at");
      if (result.error) throw new Error("Failed to load workspaces.");
      tenants = result.data ?? [];
    } else {
      const memberships = await supabaseAdmin
        .from("tenant_memberships")
        .select("tenant_id")
        .eq("user_id", access.userId!)
        .neq("status", "suspended");
      const ids = (memberships.data ?? []).map((item) => item.tenant_id);
      const result = ids.length
        ? await supabaseAdmin.from("tenants").select("*").in("id", ids).order("created_at")
        : { data: [], error: null };
      if (result.error) throw new Error("Failed to load workspaces.");
      tenants = result.data ?? [];
    }

    const tenantsWithStatus = await Promise.all(
      tenants.map(async (tenant) => {
        const [config, calendar, availability, activity] = await Promise.all([
          supabaseAdmin
            .from("app_settings")
            .select("value")
            .eq("tenant_id", tenant.id)
            .eq("key", "site_config_v2")
            .maybeSingle(),
          supabaseAdmin
            .from("calendar_connections")
            .select("connected_at")
            .eq("tenant_id", tenant.id)
            .eq("id", "google-primary")
            .maybeSingle(),
          supabaseAdmin
            .from("tenant_availability")
            .select("tenant_id")
            .eq("tenant_id", tenant.id)
            .maybeSingle(),
          supabaseAdmin
            .from("audit_log")
            .select("created_at")
            .eq("tenant_id", tenant.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        return {
          ...tenant,
          onboarding: {
            configurationReady: Boolean(config.data?.value && config.data.value !== "{}"),
            calendarConnected: Boolean(calendar.data),
            availabilityReady: Boolean(availability.data),
          },
          lastActivityAt: activity.data?.created_at ?? tenant.updated_at,
        };
      }),
    );

    return {
      user: access.userId ? { id: access.userId, email: access.email } : null,
      activeTenantId: access.tenantId,
      isSuperAdmin: access.isSuperAdmin,
      emergencyAccess: access.emergencyAccess,
      tenants: tenantsWithStatus,
    };
  });

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BootstrapSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await requireSuperAdmin(data.adminKey);
    if (!access.emergencyAccess)
      throw new Error("Bootstrap is only available from emergency access.");
    const existingAdmins = await supabaseAdmin
      .from("platform_admins")
      .select("user_id", { count: "exact", head: true });
    if ((existingAdmins.count ?? 0) > 0) throw new Error("A Super Admin account already exists.");

    const { user, invited } = await inviteOrFindUser(data.email);
    const now = new Date().toISOString();
    const results = await Promise.all([
      supabaseAdmin.from("user_profiles").upsert({
        user_id: user.id,
        full_name: data.fullName,
        updated_at: now,
      }),
      supabaseAdmin.from("platform_admins").upsert({ user_id: user.id }),
      supabaseAdmin.from("tenant_memberships").upsert({
        tenant_id: "streex",
        user_id: user.id,
        role: "owner",
        status: invited ? "invited" : "active",
        updated_at: now,
      }),
    ]);
    if (results.some((result) => result.error)) throw new Error("Unable to bootstrap Super Admin.");
    await writeAudit("streex", user.id, "super_admin.bootstrapped", { email: data.email });
    return { ok: true, invited };
  });

export const createDriverTenant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateDriverSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await requireSuperAdmin(data.adminKey);
    if (RESERVED_SLUGS.has(data.slug)) throw new Error("This public URL is reserved.");

    const tenantId = crypto.randomUUID();
    const { error: tenantError } = await supabaseAdmin.from("tenants").insert({
      id: tenantId,
      slug: data.slug,
      display_name: data.displayName,
      owner_name: data.ownerName,
      owner_email: data.ownerEmail,
      owner_phone: data.ownerPhone || null,
      status: "draft",
    });
    if (tenantError) {
      if (tenantError.code === "23505") throw new Error("That URL slug is already in use.");
      throw new Error("Unable to create the driver workspace.");
    }

    try {
      const { user, invited } = await inviteOrFindUser(data.ownerEmail);
      const now = new Date().toISOString();
      const writes = await Promise.all([
        supabaseAdmin.from("user_profiles").upsert({
          user_id: user.id,
          full_name: data.ownerName,
          phone: data.ownerPhone || null,
          updated_at: now,
        }),
        supabaseAdmin.from("tenant_memberships").insert({
          tenant_id: tenantId,
          user_id: user.id,
          role: "owner",
          status: invited ? "invited" : "active",
        }),
        supabaseAdmin.from("tenant_availability").insert({ tenant_id: tenantId }),
        supabaseAdmin.from("app_settings").insert([
          { tenant_id: tenantId, key: "site_config_v2", value: "{}" },
          { tenant_id: tenantId, key: "ticker_style", value: "boarding" },
        ]),
      ]);
      if (writes.some((result) => result.error)) throw new Error("Workspace provisioning failed.");
      await writeAudit(tenantId, access.userId, "tenant.created", {
        slug: data.slug,
        ownerEmail: data.ownerEmail,
      });
      return { ok: true, tenantId, invited };
    } catch (error) {
      await supabaseAdmin.from("tenants").delete().eq("id", tenantId);
      throw error;
    }
  });

export const updateTenantStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TenantStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await requireSuperAdmin(data.adminKey);
    if (data.tenantId === "streex" && data.status !== "active") {
      throw new Error("The primary STREEX workspace cannot be disabled.");
    }
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.tenantId);
    if (error) throw new Error("Unable to update workspace status.");
    await writeAudit(data.tenantId, access.userId, "tenant.status_changed", {
      status: data.status,
    });
    return { ok: true };
  });

export const sendTenantAccessLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TenantActionSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await requireSuperAdmin(data.adminKey);
    const tenant = await supabaseAdmin
      .from("tenants")
      .select("owner_email")
      .eq("id", data.tenantId)
      .single();
    if (tenant.error || !tenant.data) throw new Error("Driver workspace was not found.");
    const redirectTo = `${process.env.SITE_URL || "https://rides.getstreex.com"}/admin`;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(tenant.data.owner_email, {
      redirectTo,
    });
    if (error) throw new Error("Unable to send the access link.");
    await writeAudit(data.tenantId, access.userId, "tenant.access_link_sent", {
      email: tenant.data.owner_email,
    });
    return { ok: true };
  });

export const changeTenantOwner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TenantOwnerSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await requireSuperAdmin(data.adminKey);
    const { user, invited } = await inviteOrFindUser(data.ownerEmail);
    const now = new Date().toISOString();
    const currentOwners = await supabaseAdmin
      .from("tenant_memberships")
      .select("user_id")
      .eq("tenant_id", data.tenantId)
      .eq("role", "owner");
    if (currentOwners.error) throw new Error("Unable to inspect the current owner.");
    const oldIds = (currentOwners.data ?? [])
      .map((membership) => membership.user_id)
      .filter((id) => id !== user.id);
    if (oldIds.length) {
      const demote = await supabaseAdmin
        .from("tenant_memberships")
        .update({ role: "admin", updated_at: now })
        .eq("tenant_id", data.tenantId)
        .in("user_id", oldIds);
      if (demote.error) throw new Error("Unable to update the previous owner.");
    }
    const writes = await Promise.all([
      supabaseAdmin
        .from("user_profiles")
        .upsert({ user_id: user.id, full_name: data.ownerName, updated_at: now }),
      supabaseAdmin.from("tenant_memberships").upsert({
        tenant_id: data.tenantId,
        user_id: user.id,
        role: "owner",
        status: invited ? "invited" : "active",
        updated_at: now,
      }),
      supabaseAdmin
        .from("tenants")
        .update({ owner_name: data.ownerName, owner_email: data.ownerEmail, updated_at: now })
        .eq("id", data.tenantId),
    ]);
    if (writes.some((write) => write.error))
      throw new Error("Unable to change the workspace owner.");
    await writeAudit(data.tenantId, access.userId, "tenant.owner_changed", {
      email: data.ownerEmail,
    });
    return { ok: true, invited };
  });

export const listTenantAudit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const { data: entries, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .eq("tenant_id", access.tenantId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Unable to load activity history.");
    return { entries: entries ?? [] };
  });

export const getTenantPreviewLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const access = await assertAdminAccess(data.adminKey);
    const tenant = await supabaseAdmin
      .from("tenants")
      .select("slug")
      .eq("id", access.tenantId)
      .single();
    if (tenant.error || !tenant.data) throw new Error("Workspace not found.");
    const { createTenantPreviewToken } = await import("./tenant-preview.server");
    const token = createTenantPreviewToken(access.tenantId);
    const path = access.tenantId === "streex" ? "/" : `/${tenant.data.slug}`;
    return {
      url: `${process.env.SITE_URL || "https://rides.getstreex.com"}${path}?preview=${encodeURIComponent(token)}`,
    };
  });
