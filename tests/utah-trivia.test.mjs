import { describe, expect, test } from "bun:test";
import { createTriviaRound, UTAH_TRIVIA_QUESTIONS } from "../src/features/passenger/utah-trivia.ts";

describe("Utah Trivia", () => {
  test("creates a ten-question round without duplicates", () => {
    const round = createTriviaRound(UTAH_TRIVIA_QUESTIONS, 10, () => 0.42);

    expect(round).toHaveLength(10);
    expect(new Set(round.map((question) => question.id)).size).toBe(10);
  });

  test("never returns more questions than the bank contains", () => {
    expect(createTriviaRound(UTAH_TRIVIA_QUESTIONS, 100, () => 0.5)).toHaveLength(
      UTAH_TRIVIA_QUESTIONS.length,
    );
  });

  test("supports deterministic shuffling for reliable rounds", () => {
    const first = createTriviaRound(UTAH_TRIVIA_QUESTIONS, 10, () => 0.25);
    const second = createTriviaRound(UTAH_TRIVIA_QUESTIONS, 10, () => 0.25);

    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id));
  });

  test("keeps every answer and explanation bilingual and valid", () => {
    for (const question of UTAH_TRIVIA_QUESTIONS) {
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.prompt.en.length).toBeGreaterThan(0);
      expect(question.prompt.es.length).toBeGreaterThan(0);
      expect(question.explanation.en.length).toBeGreaterThan(0);
      expect(question.explanation.es.length).toBeGreaterThan(0);
      expect(question.options.every((option) => option.en && option.es)).toBe(true);
    }
  });
});
