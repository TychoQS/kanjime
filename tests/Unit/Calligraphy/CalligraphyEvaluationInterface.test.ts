import { describe, expect, it } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import {
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  TEST_CALLIGRAPHY_FINALIZED_ATTEMPT, TEST_CALLIGRAPHY_EMPTY_ATTEMPT, TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT
} from "../../Support/TestData";
import {buildRequirementTitle} from "../../Support/RequirementTest";

describe("CalligraphyEvaluationInterface", () => {

/**
 * Requirement: R54
 * Type: Unit
 * Condition: Precondition
 */
it(buildRequirementTitle("R54", "Unit", "Precondition", "evaluateAttempt throws when attempt has no strokes"), async () => {
  const controller = CreateCalligraphyEvaluationController({});

  await expect(controller.evaluateAttempt(TEST_CALLIGRAPHY_EMPTY_ATTEMPT)).rejects.toThrow();
});

/**
 * Requirement: R54
 * Type: Unit
 * Condition: Invariant
 */
it(buildRequirementTitle("R54", "Unit", "Invariant", "evaluation considers all required metrics"), async () => {
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
 * Requirement: R54
 * Type: Unit
 * Condition: Postcondition
 */
it(buildRequirementTitle("R54", "Unit", "Postcondition", "evaluateAttempt generates a result for the finalized attempt"), async () => {
  const controller = CreateCalligraphyEvaluationController({});

  const result = await controller.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

  expect(result).toBeDefined();
});

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R55", "Unit", "Precondition", "calculateScore throws when evaluation result is invalid"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    expect(() => {
      controller.calculateScore(TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT);
    }).toThrow();
  });

  it(buildRequirementTitle("R55", "Unit", "Precondition", "calculateScore does not throw when evaluation result is valid"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    expect(() => {
      controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    }).not.toThrow();
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R55", "Unit", "Invariant", "calculated score remains within permitted range"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    const score = controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R55", "Unit", "Postcondition", "calculateScore returns a global score for the attempt"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    const score = controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(score).toBeDefined();
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R56", "Unit", "Precondition", "createFeedback throws when evaluation result is invalid"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    expect(() => {
      controller.createFeedback(TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT);
    }).toThrow();
  });

  it(buildRequirementTitle("R56", "Unit", "Precondition", "createFeedback does not throw when evaluation result is valid"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    expect(() => {
      controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    }).not.toThrow();
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R56", "Unit", "Invariant", "feedback matches the evaluation result"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    const feedback = controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(feedback).toEqual({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    });
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R56", "Unit", "Postcondition", "feedback contains score and summary of the evaluation result"), () => {
    const controller = CreateCalligraphyEvaluationController({});

    const feedback = controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(feedback.score).toBeDefined();
    expect(feedback.summary).toBeDefined();
  });
})
