import { describe, expect, it } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import type { CalligraphyAttempt, CalligraphyEvaluationResult } from "../../../src/Shared/DomainTypes";

const FINALIZED_ATTEMPT: CalligraphyAttempt = {
  targetCharacter: "水",
  categoryId: "jlpt-n5",
  isFinalized: true,
  strokes: [
    {
      points: [{ x: 1, y: 1 }],
      startedAt: "2026-05-14T10:00:00.000Z",
      endedAt: "2026-05-14T10:00:01.000Z"
    }
  ]
};

const EVALUATION_RESULT: CalligraphyEvaluationResult = {
  targetCharacter: "水",
  score: 82,
  summary: "The attempt is recognizable.",
  metrics: {
    strokeCount: 1,
    strokeOrder: 1,
    approximateDirection: 1,
    generalSimilarity: 0.8
  }
};

/**
 * R54 Pre/Inv/Post: Evaluation only runs for finalized attempts and considers all required metrics.
 */
describe("CalligraphyEvaluationInterface", () => {
  it("evaluates a finalized attempt with all required metrics", async () => {
    const controller = CreateCalligraphyEvaluationController({});

    const result = await controller.evaluateAttempt(FINALIZED_ATTEMPT);

    expect(result.metrics).toEqual(expect.objectContaining({
      strokeCount: expect.any(Number),
      strokeOrder: expect.any(Number),
      approximateDirection: expect.any(Number),
      generalSimilarity: expect.any(Number)
    }));
  });

  /**
   * R55 Pre/Inv/Post: A valid result produces a score inside the permitted range.
   */
  it("calculates a score inside the permitted range", () => {
    const controller = CreateCalligraphyEvaluationController({});

    const score = controller.calculateScore(EVALUATION_RESULT);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  /**
   * R56 Pre/Inv/Post: Feedback corresponds to the calculated evaluation result.
   */
  it("creates visual feedback that matches the evaluation result", () => {
    const controller = CreateCalligraphyEvaluationController({});

    const feedback = controller.createFeedback(EVALUATION_RESULT);

    expect(feedback).toEqual({
      score: 82,
      summary: "The attempt is recognizable.",
      isOverlayVisible: true
    });
  });
});
