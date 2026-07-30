import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const DEFAULT_TENANT_ID = "streex";
export const ACTIVE_TENANT_HEADER = "x-streex-tenant";

export type AdminAccess = {
  userId: string | null;
  email: string | null;
  tenantId: string;
  isSuperAdmin: boolean;
  emergencyAccess: boolean;
};

function getBearerToken() {
  const authorization = getRequest()?.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
}

function getRequestedTenantId() {
  return getRequest()?.headers.get(ACTIVE_TENANT_HEADER)?.trim() || null;
}

async function readAuthenticatedUser() {
  const token = getBearerToken();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function assertAdminAccess(adminKey?: string | null): Promise<AdminAccess> {
  const user = await readAuthenticatedUser();
  const requestedTenantId = getRequestedTenantId();

  if (user) {
    const [{ data: platformAdmin }, { data: memberships, error: membershipError }] =
      await Promise.all([
        supabaseAdmin
          .from("platform_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabaseAdmin
          .from("tenant_memberships")
          .select("tenant_id,status")
          .eq("user_id", user.id)
          .neq("status", "suspended"),
      ]);

    if (membershipError) throw new Error("Unable to verify workspace access.");
    const invitedTenantIds = (memberships ?? [])
      .filter((membership) => membership.status === "invited")
      .map((membership) => membership.tenant_id);
    if (invitedTenantIds.length) {
      await supabaseAdmin
        .from("tenant_memberships")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .in("tenant_id", invitedTenantIds);
    }
    const isSuperAdmin = Boolean(platformAdmin);
    const allowedTenantIds = (memberships ?? []).map((membership) => membership.tenant_id);
    const tenantId =
      requestedTenantId || allowedTenantIds[0] || (isSuperAdmin ? DEFAULT_TENANT_ID : null);

    if (!tenantId) throw new Error("No active workspace is assigned to this account.");
    if (!isSuperAdmin && !allowedTenantIds.includes(tenantId)) throw new Error("Access denied.");

    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("id,status")
      .eq("id", tenantId)
      .maybeSingle();
    if (!tenant || tenant.status === "archived") throw new Error("Workspace not found.");
    if (tenant.status === "suspended" && !isSuperAdmin)
      throw new Error("This workspace is suspended.");

    return {
      userId: user.id,
      email: user.email ?? null,
      tenantId,
      isSuperAdmin,
      emergencyAccess: false,
    };
  }

  const expected = process.env.ADMIN_ACCESS_KEY;
  if (expected && adminKey && adminKey === expected) {
    return {
      userId: null,
      email: null,
      tenantId: requestedTenantId || DEFAULT_TENANT_ID,
      isSuperAdmin: true,
      emergencyAccess: true,
    };
  }

  if (!expected) throw new Error("ADMIN_ACCESS_KEY is not configured in the server environment.");
  throw new Error("Access denied.");
}

export async function requireSuperAdmin(adminKey?: string | null) {
  const access = await assertAdminAccess(adminKey);
  if (!access.isSuperAdmin) throw new Error("Super Admin access required.");
  return access;
}

export async function getAuthenticatedUserId() {
  return (await readAuthenticatedUser())?.id ?? null;
}
