type DatabaseErrorLike = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

function errorText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as DatabaseErrorLike;
  return [candidate.code, candidate.message, candidate.details, candidate.hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

export function isScheduleConflictError(error: unknown) {
  const text = errorText(error);
  return (
    text.includes("23P01") ||
    text.includes("BOOKING_SCHEDULE_CONFLICT") ||
    text.includes("BOOKING_MANUAL_BLOCK_CONFLICT") ||
    text.includes("MANUAL_BLOCK_BOOKING_CONFLICT")
  );
}

export function bookingConflictMessage(error: unknown) {
  return isScheduleConflictError(error)
    ? "This ride conflicts with another quoted or confirmed booking, or with a manual block. Cancel the conflicting item or choose another time."
    : null;
}

export function manualBlockConflictMessage(error: unknown) {
  return isScheduleConflictError(error)
    ? "This block overlaps a quoted or confirmed ride. Cancel or reschedule the ride before blocking this time."
    : null;
}
