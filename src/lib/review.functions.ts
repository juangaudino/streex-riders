import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SubmitReviewSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).default("streex"),
  tenantSlug: z.string().trim().min(1).max(63).optional(),
  previewToken: z.string().trim().max(4096).optional(),
  name: z.string().trim().max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(1).max(1000),
});
const ListSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).default("streex"),
  tenantSlug: z.string().trim().min(1).max(63).optional(),
  previewToken: z.string().trim().max(4096).optional(),
});

export const submitPassengerReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitReviewSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePublicTenant } = await import("./tenant.server");
    const tenant = await requirePublicTenant(data.tenantSlug, data.previewToken);
    if (data.tenantId !== tenant.id) throw new Error("Invalid driver workspace.");
    const { error } = await supabaseAdmin.from("reviews").insert({
      tenant_id: tenant.id,
      name: data.name?.trim() ? data.name.trim() : null,
      rating: data.rating,
      message: data.message.trim(),
      status: "pending",
    });

    if (error) {
      console.error("[submitPassengerReview] insert error", error);
      throw new Error("Failed to submit your review. Please try again.");
    }

    return { ok: true };
  });

export const listPublicReviews = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListSchema.parse(input))
  .handler(async ({ data: input }) => {
    const { requirePublicTenant } = await import("./tenant.server");
    const tenant = await requirePublicTenant(input.tenantSlug, input.previewToken);
    if (input.tenantId !== tenant.id) throw new Error("Invalid driver workspace.");
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("name, rating, message, location, created_at")
      .eq("tenant_id", tenant.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listPublicReviews] read error", error);
      throw new Error("Failed to load reviews.");
    }

    return { reviews: reviews ?? [] };
  });
