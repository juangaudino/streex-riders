import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";
import {
  ADMIN_EMAIL,
  sendEmail,
  buildPassengerConfirmation,
  buildAdminNewRequest,
  buildPassengerConfirmed,
  buildAdminConfirmed,
  buildPassengerDeclined,
  buildAdminDeclined,
} from "./booking-emails.server";

type BookingRow = Tables<"bookings">;

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(200),
  pickup: z.string().trim().min(1).max(300),
  destination: z.string().trim().min(1).max(300),
  date: z.string().trim().min(1).max(40),
  time: z.string().trim().min(1).max(20),
  passengers: z.number().int().min(1).max(8),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        pickup: data.pickup,
        destination: data.destination,
        date: data.date,
        time: data.time,
        passengers: data.passengers,
        notes: data.notes?.trim() ? data.notes.trim() : null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[createBooking] insert error", error);
      throw new Error("Failed to save your request. Please try again.");
    }

    try {
      const conf = buildPassengerConfirmation(booking);
      const notif = buildAdminNewRequest(booking);
      await Promise.allSettled([
        sendEmail({ to: booking.email, ...conf }),
        sendEmail({ to: ADMIN_EMAIL, ...notif }),
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
    throw new Error("Unable to process this request.");
  }

  try {
    if (action === "accept") {
      await Promise.allSettled([
        sendEmail({ to: updated.email, ...buildPassengerConfirmed(updated) }),
        sendEmail({ to: ADMIN_EMAIL, ...buildAdminConfirmed(updated) }),
      ]);
    } else {
      await Promise.allSettled([
        sendEmail({ to: updated.email, ...buildPassengerDeclined(updated) }),
        sendEmail({ to: ADMIN_EMAIL, ...buildAdminDeclined(updated) }),
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
