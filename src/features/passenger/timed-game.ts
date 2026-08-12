export const TIMED_GAME_QUESTION_DURATION_MS = 10_000;
export const TIMED_GAME_WARNING_MS = 3_000;

export function getTimedGameProgress(
  remainingMs: number,
  durationMs = TIMED_GAME_QUESTION_DURATION_MS,
) {
  if (durationMs <= 0) return 0;
  return Math.max(0, Math.min(1, remainingMs / durationMs));
}

export function isTimedGameWarning(remainingMs: number) {
  return remainingMs > 0 && remainingMs <= TIMED_GAME_WARNING_MS;
}
