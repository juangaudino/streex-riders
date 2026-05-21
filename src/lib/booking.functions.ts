import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  ADMIN_EMAIL,
  sendEmail,
  buildPassengerConfirmation,
  buildAdminNewRequest,
  buildPassengerQuote,
  buildPassengerConfirmed,
  buildAdminConfirmed,
  buildPassengerDeclined,
  buildAdminDeclined,
} from "./booking-emails.server";

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

    const b = booking as any;
    try {
      const conf = buildPassengerConfirmation(b);
      const notif = buildAdminNewRequest(b);
      await Promise.allSettled([
        sendEmail({ to: b.email, ...conf }),
        sendEmail({ to: ADMIN_EMAIL, ...notif }),
      ]);
    } catch (e) {
      console.error("[createBooking] email error", e);
    }

    return { ok: true, id: b.id as string };
  });

const QuoteSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive().max(100000),
});

export const sendQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuoteSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ price: data.price, status: "quoted" })
      .eq("id", data.id)
      .select("*")
      .single();

    if (error || !booking) {
      console.error("[sendQuote] update error", error);
      throw new Error("Failed to send quote.");
    }

    const b = booking as any;
    const msg = buildPassengerQuote(b);
    await sendEmail({ to: b.email, ...msg });
    return { ok: true };
  });

const StatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Failed to update booking.");
    return { ok: true };
  });

const IdSchema = z.object({ id: z.string().uuid() });

type Outcome =
  | { status: "confirmed" | "declined"; booking: any }
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
  if ((existing as any).status !== "quoted") {
    return { status: "already_processed", current: (existing as any).status };
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

  const b = updated as any;
  try {
    if (action === "accept") {
      await Promise.allSettled([
        sendEmail({ to: b.email, ...buildPassengerConfirmed(b) }),
        sendEmail({ to: ADMIN_EMAIL, ...buildAdminConfirmed(b) }),
      ]);
    } else {
      await Promise.allSettled([
        sendEmail({ to: b.email, ...buildPassengerDeclined(b) }),
        sendEmail({ to: ADMIN_EMAIL, ...buildAdminDeclined(b) }),
      ]);
    }
  } catch (e) {
    console.error("[processResponse] email error", e);
  }

  return { status: newStatus, booking: b };
}

export const acceptBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.id, "accept"));

export const declineBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data }) => processResponse(data.id, "decline"));