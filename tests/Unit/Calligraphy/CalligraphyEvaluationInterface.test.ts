import { describe, expect, it } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import {
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  TEST_CALLIGRAPHY_FINALIZED_ATTEMPT
} from "../../Support/TestData";

/**
 * Requirement: R54
 * Type: Unit
 * Condition: Precondition, Invariant and Postcondition
 */
describe("CalligraphyEvaluationInterface", () => {
  it("evaluates a finalized attempt with all required metrics", async () => {
    const controller = CreateCalligraphyEvaluationController({});

    const result = await controller.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(result.metrics).toEqual(expect.objectContaining({
      strokeCount: expect.any(Number),
      strokeOrder: expect.any(Number),
      approximateDirection: expect.any(Number),
      generalSimilarity: expect.any(Number)
    }));
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Precondition, Invariant and Postcondition
   */
  it("calculates a score inside the permitted range", () => {
    const controller = CreateCalligraphyEvaluationController({});

    const score = controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Precondition, Invariant and Postcondition
   */
  it("creates visual feedback that matches the evaluation result", () => {
    const controller = CreateCalligraphyEvaluationController({});

    const feedback = controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(feedback).toEqual({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    });
  });
});
