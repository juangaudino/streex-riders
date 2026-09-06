import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";
import {
  sendEmail,
  buildPassengerConfirmation,
  buildAdminNewRequest,
  buildPassengerConfirmed,
  buildAdminConfirmed,
  buildPassengerDeclined,
  buildAdminDeclined,
  getTenantEmailBrand,
} from "./booking-emails.server";
import { resolveBookingSlot } from "./availability.functions";
import { isScheduleConflictError } from "./schedule-conflicts";
import { syncBookingWithGoogleCalendar } from "./google-calendar-sync.server";
import {
  verifyBookingResponseToken,
  type BookingResponseAction,
} from "./booking-response-token.server";

type BookingRow = Tables<"bookings">;

const CreateSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).default("streex"),
  tenantSlug: z.string().trim().min(1).max(63).optional(),
  previewToken: z.string().trim().max(4096).optional(),
  serviceType: z.enum(["ride", "hourly"]).default("ride"),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(200),
  pickup: z.string().trim().min(1).max(300),
  destination: z.string().trim().min(1).max(300),
  date: z.string().trim().min(1).max(40),
  time: z.string().trim().min(1).max(20),
  durationMinutes: z.number().int().min(60).max(720).optional(),
  passengers: z.number().int().min(1).max(8),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateSchema.parse(input))
  .handler(async ({ data }) => {
    const durationMinutes =
      data.serviceType === "hourly" ? (data.durationMinutes ?? 120) : undefined;
    const { requirePublicTenant } = await import("./tenant.server");
    const tenant = await requirePublicTenant(data.tenantSlug, data.previewToken);
    if (data.tenantId !== tenant.id) throw new Error("Invalid driver workspace.");
    const slot = await resolveBookingSlot(tenant.id, data.date, data.time, durationMinutes);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        tenant_id: tenant.id,
        service_type: data.serviceType,
        name: data.name,
        phone: data.phone,
        email: data.email,
        pickup: data.pickup,
        destination: data.destination,
        date: data.date,
        time: data.time,
        passengers: data.passengers,
        notes: data.notes?.trim() ? data.notes.trim() : null,
        start_at: slot.startAt,
        end_at: slot.endAt,
        estimated_duration_minutes: slot.durationMinutes,
        status: "pending",
      })
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[createBooking] insert error", error);
      throw new Error("Failed to save your request. Please try again.");
    }

    try {
      const brand = await getTenantEmailBrand(booking.tenant_id);
      const conf = buildPassengerConfirmation(booking, brand);
      const notif = buildAdminNewRequest(booking, brand);
      await Promise.allSettled([
        sendEmail({ to: booking.email, ...conf }),
        sendEmail({ to: brand.email, ...notif }),
      ]);
    } catch (e) {
      console.error("[createBooking] email error", e);
    }

    return { ok: true, id: booking.id };
  });

const ResponseTokenSchema = z.object({ token: z.string().trim().min(1).max(4096) });
const ResponseStateSchema = ResponseTokenSchema.extend({
  action: z.enum(["accept", "decline"]),
});

type Outcome =
  | { status: "confirmed" | "declined"; booking: BookingRow }
  | { status: "already_processed"; current: string }
  | { status: "invalid" };

export type BookingResponseState = "ready" | "already" | "expired";

async function loadBookingResponseState(token: string, action: BookingResponseAction) {
  const capability = verifyBookingResponseToken(token, action);
  if (!capability) return "expired" satisfies BookingResponseState;

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("status")
    .eq("id", capability.bookingId)
    .maybeSingle();

  if (error) {
    console.error("[getBookingResponseState] read error", error);
    throw new Error("Unable to load this response.");
  }
  if (!booking) return "expired" satisfies BookingResponseState;
  return booking.status === "quoted" ? "ready" : "already";
}

export const getBookingResponseState = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResponseStateSchema.parse(input))
  .handler(async ({ data }) => loadBookingResponseState(data.token, data.action));

async function processResponse(token: string, action: BookingResponseAction): Promise<Outcome> {
  const capability = verifyBookingResponseToken(token, action);
  if (!capability) return { status: "invalid" };

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", capability.bookingId)
    .maybeSingle();

  if (readErr) {
    console.error("[processResponse] read error", readErr);
    throw new Error("Unable to process this request.");
  }
  if (!existing) return { status: "invalid" };
  if (existing.status !== "quoted") {
    return { status: "already_processed", current: existing.status };
  }

  const newStatus = action === "accept" ? "confirmed" : "declined";
  const { data: updated, error: updErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", capability.bookingId)
    .eq("status", "quoted")
    .select("*")
    .single();

  if (updErr || !updated) {
    const { data: current, error: currentErr } = await supabaseAdmin
      .from("bookings")
      .select("status")
      .eq("id", capability.bookingId)
      .maybeSingle();
    if (!currentErr && current && current.status !== "quoted") {
      return { status: "already_processed", current: current.status };
    }
    console.error("[processResponse] update error", updErr);
    if (isScheduleConflictError(updErr)) {
      throw new Error(
        "This ride is no longer available because another booking now occupies that time. Please contact STREEX to choose another time.",
      );
    }
    throw new Error("Unable to process this request.");
  }

  if (action === "accept") {
    await syncBookingWithGoogleCalendar(updated, updated.tenant_id);
  }

  try {
    const brand = await getTenantEmailBrand(updated.tenant_id);
    if (action === "accept") {
      await Promise.allSettled([
        sendEmail({ to: updated.email, ...buildPassengerConfirmed(updated, brand) }),
        sendEmail({ to: brand.email, ...buildAdminConfirmed(updated, brand) }),
      ]);
    } else {
      await Promise.allSettled([
        sendEmail({ to: updated.email, ...buildPassengerDeclined(updated, brand) }),
        sendEmail({ to: brand.email, ...buildAdminDeclined(updated, brand) }),
      ]);
    }
  } catch (e) {
    console.error("[processResponse] email error", e);
  }

  return { status: newStatus, booking: updated };
}

export const acceptBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResponseTokenSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.token, "accept"));

export const declineBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResponseTokenSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.token, "decline"));
