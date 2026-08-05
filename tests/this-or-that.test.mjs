import { describe, expect, test } from "bun:test";
import {
  calculateRideVibe,
  createChoiceRound,
  THIS_OR_THAT_QUESTIONS,
} from "../src/features/passenger/this-or-that.ts";

describe("This or That", () => {
  test("creates a ten-choice round without duplicates", () => {
    const round = createChoiceRound(THIS_OR_THAT_QUESTIONS, 10, () => 0.42);
    expect(round).toHaveLength(10);
    expect(new Set(round.map(({ id }) => id)).size).toBe(10);
  });

  test("keeps all choices bilingual", () => {
    for (const question of THIS_OR_THAT_QUESTIONS) {
      expect(question.prompt.en.length).toBeGreaterThan(0);
      expect(question.prompt.es.length).toBeGreaterThan(0);
      expect(question.options).toHaveLength(2);
      expect(question.options.every(({ label }) => label.en && label.es)).toBe(true);
    }
  });

  test("gives every local choice a context-aware visual scene", () => {
    const visualKeys = new Set();

    for (const question of THIS_OR_THAT_QUESTIONS) {
      for (const option of question.options) {
        expect(typeof option.visualKey).toBe("string");
        visualKeys.add(option.visualKey);
      }
    }

    expect(visualKeys.size).toBeGreaterThanOrEqual(24);
    expect(visualKeys.has("nightMarket")).toBe(false);
  });

  test("returns the strongest ride vibe", () => {
    expect(calculateRideVibe(["explorer", "comfort", "explorer", "roadTrip"])).toBe("explorer");
  });

  test("uses the latest tied choice instead of a fixed personality bias", () => {
    expect(calculateRideVibe(["explorer", "comfort"])).toBe("comfort");
    expect(calculateRideVibe(["comfort", "explorer"])).toBe("explorer");
  });
});
