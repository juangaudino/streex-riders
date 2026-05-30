import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdminAccess } from "./admin-auth.server";
import {
  ADMIN_EMAIL,
  buildAdminNewRequest,
  buildPassengerQuote,
  sendEmail,
} from "./booking-emails.server";

const AdminSchema = z.object({
  adminKey: z.string().min(1),
});

const BookingStatusSchema = AdminSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

const QuoteSchema = AdminSchema.extend({
  id: z.string().uuid(),
  price: z.number().positive().max(100000),
});

const ReviewStatusSchema = AdminSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

const ReviewIdSchema = AdminSchema.extend({
  id: z.string().uuid(),
});

const TickerThemeSchema = AdminSchema.extend({
  tickerStyle: z.enum(["boarding", "pill"]),
});

export const verifyAdminKey = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);
    return { ok: true };
  });

export const listAdminBookings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listAdminBookings] read error", error);
      throw new Error("Failed to load bookings.");
    }

    return { bookings: bookings ?? [] };
  });

export const sendAdminQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ price: data.price, status: "quoted" })
      .eq("id", data.id)
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[sendAdminQuote] update error", error);
      throw new Error("Failed to send quote.");
    }

    const msg = buildPassengerQuote(booking);
    await sendEmail({ to: booking.email, ...msg });
    return { ok: true };
  });

export const updateAdminBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BookingStatusSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("[updateAdminBookingStatus] update error", error);
      throw new Error("Failed to update booking.");
    }

    return { ok: true };
  });

export const resendAdminBookingNotification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error || !booking) {
      console.error("[resendAdminBookingNotification] read error", error);
      throw new Error("Failed to load booking.");
    }

    await sendEmail({ to: ADMIN_EMAIL, ...buildAdminNewRequest(booking) });
    return { ok: true };
  });

export const listAdminReviews = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listAdminReviews] read error", error);
      throw new Error("Failed to load reviews.");
    }

    return { reviews: reviews ?? [] };
  });

export const updateAdminReviewStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewStatusSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin
      .from("reviews")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("[updateAdminReviewStatus] update error", error);
      throw new Error("Failed to update review.");
    }

    return { ok: true };
  });

export const deleteAdminReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReviewIdSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", data.id);

    if (error) {
      console.error("[deleteAdminReview] delete error", error);
      throw new Error("Failed to delete review.");
    }

    return { ok: true };
  });

export const updateAdminTickerTheme = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TickerThemeSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminAccess(data.adminKey);

    const { error } = await supabaseAdmin.from("app_settings").upsert({
      key: "ticker_style",
      value: data.tickerStyle,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[updateAdminTickerTheme] update error", error);
      throw new Error("Failed to update ticker theme.");
    }

    return { ok: true, tickerStyle: data.tickerStyle };
  });
