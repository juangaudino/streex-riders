import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function updatePricingQuoteLifecycleForBooking(
  bookingId: string,
  tenantId: string,
  status: "completed" | "cancelled" | "declined",
) {
  const now = new Date().toISOString();
  const next =
    status === "completed"
      ? { status: "completed", commission_status: "payable", completed_at: now, updated_at: now }
      : { status: "void", commission_status: "void", updated_at: now };
  const result = await supabaseAdmin
    .from("pricing_quotes")
    .update(next)
    .eq("booking_id", bookingId)
    .eq("tenant_id", tenantId)
    .eq("status", "sent");
  if (result.error) console.error("[pricing] quote lifecycle update failed", result.error);
}
