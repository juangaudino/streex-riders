import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AdminSchema = z.object({
  adminKey: z.string().min(1),
});

const DateSchema = z.object({
  tenantId: z.string().trim().min(1).max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().min(5).max(1440).optional(),
});

const AvailabilitySettingsSchema = AdminSchema.extend({
  daysActive: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  minNoticeHours: z.number().int().min(0).max(720),
  slotDurationMinutes: z.number().int().min(5).max(240),
  defaultRideDurationMinutes: z.number().int().min(5).max(1440),
  timezone: z.string().trim().min(1).max(80).default("America/Denver"),
});

const BlockSchema = AdminSchema.extend({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().trim().max(300).optional().nullable(),
});

const BlockIdSchema = AdminSchema.extend({
  id: z.string().uuid(),
});

export type AvailableSlot = {
  startAt: string;
  endAt: string;
  time: string;
  label: string;
};

export async function resolveBookingSlot(date: string, time: string, durationMinutes?: number) {
  const { resolveBookingSlotServer } = await import("./availability.server");
  return resolveBookingSlotServer(date, time, durationMinutes);
}

export const getAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DateSchema.parse(input))
  .handler(async ({ data }) => {
    const { getAvailableSlotsServer } = await import("./availability.server");
    return getAvailableSlotsServer(data.tenantId, data.date, data.durationMinutes);
  });

export const getAdminAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdminSchema.parse(input))
  .handler(async ({ data }) => {
    const { getAdminAvailabilityServer } = await import("./availability.server");
    return getAdminAvailabilityServer(data.adminKey);
  });

export const updateAdminAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AvailabilitySettingsSchema.parse(input))
  .handler(async ({ data }) => {
    const { updateAdminAvailabilityServer } = await import("./availability.server");
    return updateAdminAvailabilityServer(data);
  });

export const createAdminBlockedSlot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BlockSchema.parse(input))
  .handler(async ({ data }) => {
    const { createAdminBlockedSlotServer } = await import("./availability.server");
    return createAdminBlockedSlotServer(data);
  });

export const deleteAdminBlockedSlot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => BlockIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { deleteAdminBlockedSlotServer } = await import("./availability.server");
    return deleteAdminBlockedSlotServer(data);
  });
