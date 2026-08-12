import { describe, expect, test } from "bun:test";
import {
  createHigherOrLowerRound,
  UTAH_HIGHER_OR_LOWER_QUESTIONS,
} from "../src/features/passenger/utah-higher-or-lower.ts";

describe("Utah: Higher or Lower", () => {
  test("creates a ten-question round without duplicates", () => {
    const round = createHigherOrLowerRound(UTAH_HIGHER_OR_LOWER_QUESTIONS, 10, () => 0.42);

    expect(round).toHaveLength(10);
    expect(new Set(round.map((question) => question.id)).size).toBe(10);
  });

  test("never returns more questions than its local bank contains", () => {
    expect(createHigherOrLowerRound(UTAH_HIGHER_OR_LOWER_QUESTIONS, 100, () => 0.5)).toHaveLength(
      UTAH_HIGHER_OR_LOWER_QUESTIONS.length,
    );
  });

  test("keeps comparison content bilingual and structurally valid", () => {
    for (const question of UTAH_HIGHER_OR_LOWER_QUESTIONS) {
      expect(["left", "right"]).toContain(question.correctSide);
      expect(question.prompt.en.length).toBeGreaterThan(0);
      expect(question.prompt.es.length).toBeGreaterThan(0);
      expect(question.left.en.length).toBeGreaterThan(0);
      expect(question.right.es.length).toBeGreaterThan(0);
      expect(question.explanation.en.length).toBeGreaterThan(0);
      expect(question.sourceUrl.startsWith("https://")).toBe(true);
    }
  });
});
