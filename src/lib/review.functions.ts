import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SubmitReviewSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).default("streex"),
  name: z.string().trim().max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(1).max(1000),
});
const ListSchema = z.object({ tenantId: z.string().trim().min(1).max(80).default("streex") });

export const submitPassengerReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitReviewSchema.parse(input))
  .handler(async ({ data }) => {
    const tenant = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("id", data.tenantId)
      .eq("status", "active")
      .maybeSingle();
    if (tenant.error || !tenant.data) throw new Error("This driver page is not active.");
    const { error } = await supabaseAdmin.from("reviews").insert({
      tenant_id: data.tenantId,
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
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("name, rating, message, location, created_at")
      .eq("tenant_id", input.tenantId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listPublicReviews] read error", error);
      throw new Error("Failed to load reviews.");
    }

    return { reviews: reviews ?? [] };
  });
