import { describe, expect, test } from "bun:test";
import {
  getTimedGameProgress,
  isTimedGameWarning,
  TIMED_GAME_QUESTION_DURATION_MS,
} from "../src/features/passenger/timed-game.ts";

describe("timed passenger games", () => {
  test("uses a ten-second question window", () => {
    expect(TIMED_GAME_QUESTION_DURATION_MS).toBe(10_000);
  });

  test("keeps timer progress within the visible range", () => {
    expect(getTimedGameProgress(15_000)).toBe(1);
    expect(getTimedGameProgress(5_000)).toBe(0.5);
    expect(getTimedGameProgress(-100)).toBe(0);
  });

  test("flags the final three seconds without treating zero as a warning", () => {
    expect(isTimedGameWarning(3_000)).toBe(true);
    expect(isTimedGameWarning(3_001)).toBe(false);
    expect(isTimedGameWarning(0)).toBe(false);
  });
});
