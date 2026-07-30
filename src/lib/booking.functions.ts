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

type BookingRow = Tables<"bookings">;

const CreateSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).default("streex"),
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
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("id,status")
      .eq("id", data.tenantId)
      .eq("status", "active")
      .maybeSingle();
    if (!tenant) throw new Error("This driver is not accepting ride requests.");
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

const IdSchema = z.object({ id: z.string().uuid() });

type Outcome =
  | { status: "confirmed" | "declined"; booking: BookingRow }
  | { status: "already_processed"; current: string }
  | { status: "not_found" };

async function processResponse(id: string, action: "accept" | "decline"): Promise<Outcome> {
  const { data: existing, error: readErr } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    console.error("[processResponse] read error", readErr);
    throw new Error("Unable to process this request.");
  }
  if (!existing) return { status: "not_found" };
  if (existing.status !== "quoted") {
    return { status: "already_processed", current: existing.status };
  }

  const newStatus = action === "accept" ? "confirmed" : "declined";
  const { data: updated, error: updErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("status", "quoted")
    .select("*")
    .single();

  if (updErr || !updated) {
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
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.id, "accept"));

export const declineBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.id, "decline"));
