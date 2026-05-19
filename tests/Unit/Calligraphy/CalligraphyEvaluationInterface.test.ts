import { describe, expect, it, vi } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";

import {
  TEST_CALLIGRAPHY_EMPTY_ATTEMPT,
  TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  TEST_CALLIGRAPHY_FINALIZED_ATTEMPT,
  TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT
} from "../../Support/TestData";

import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";

describe("CalligraphyEvaluationInterface", () => {
  /**
   * Requirement: R54
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R54", "Unit", "Precondition", "evaluateAttempt throws when attempt has no strokes"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    const createFeedback = vi.fn();

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: evaluationRecorder.handler,
      createFeedback
    });

    await expect(controller.evaluateAttempt(TEST_CALLIGRAPHY_EMPTY_ATTEMPT), "CalligraphyEvaluationInterface evaluated an attempt that did not satisfy the precondition.").rejects.toThrow();

    expect(evaluationRecorder.calls).toEqual(
      [],
      "CalligraphyEvaluationInterface evaluated an attempt that did not satisfy the precondition."
    );
  });

  /**
   * Requirement: R54
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R54", "Unit", "Invariant", "evaluation considers all required metrics"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    const createFeedback = vi.fn();

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: evaluationRecorder.handler,
      createFeedback
    });

    const result = await controller.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(result.metrics).toEqual(expect.objectContaining({
      strokeCount: expect.any(Number),
      strokeOrder: expect.any(Number),
      approximateDirection: expect.any(Number),
      generalSimilarity: expect.any(Number)
    }), "CalligraphyEvaluationInterface evaluated an attempt that did not take into consideration all the required metrics.");

    expect(evaluationRecorder.calls).toEqual(
      [TEST_CALLIGRAPHY_FINALIZED_ATTEMPT],
      "CalligraphyEvaluationInterface did not evaluate the expected attempt."
    );
  });

  /**
   * Requirement: R54
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R54", "Unit", "Postcondition", "evaluateAttempt generates a result for the finalized attempt"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    const createFeedback = vi.fn();

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: evaluationRecorder.handler,
      createFeedback
    });

    const result = await controller.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(result, "CalligraphyEvaluationInterface did not generate a result for the finalized attempt.").toBeDefined();

    expect(evaluationRecorder.calls).toEqual(
      [TEST_CALLIGRAPHY_FINALIZED_ATTEMPT],
      "CalligraphyEvaluationInterface did not evaluate the expected attempt."
    );
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R55", "Unit", "Precondition", "calculateScore throws when evaluation result is invalid"), () => {
    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback: vi.fn()
    });

    expect(() => {
      controller.calculateScore(TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT);
    }, "CalligraphyEvaluationInterface calculated a score for an invalid evaluation result.").toThrow();
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R55", "Unit", "Precondition", "calculateScore does not throw when evaluation result is valid"), () => {
    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback: vi.fn()
    });

    expect(() => {
      controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    }, "CalligraphyEvaluationInterface didn't calculate a score for a valid evaluation result.").not.toThrow();
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R55", "Unit", "Invariant", "calculated score remains within permitted range"), () => {
    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback: vi.fn()
    });

    const score = controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    const LOWEST_SCORE = 0;
    const HIGHEST_SCORE = 100;
    expect(score, "CalligraphyEvaluationInterface calculated a score that doesn't remain within the permitted range.").toBeGreaterThanOrEqual(LOWEST_SCORE);
    expect(score, "CalligraphyEvaluationInterface calculated a score that doesn't remain within the permitted range.").toBeLessThanOrEqual(HIGHEST_SCORE);
  });

  /**
   * Requirement: R55
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R55", "Unit", "Postcondition", "calculateScore returns a global score for the attempt"), () => {
    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback: vi.fn()
    });

    const score = controller.calculateScore(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(score, "CalligraphyEvaluationInterface didn't return a global score for the attempt.").toBeDefined();
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R56", "Unit", "Precondition", "createFeedback throws when evaluation result is invalid"), () => {
    const createFeedback = vi.fn();

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback
    });

    expect(() => {
      controller.createFeedback(TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT);
    }, "CalligraphyEvaluationInterface returned a feedback for an invalid evaluation result.").toThrow();

    expect(createFeedback, "CalligraphyEvaluationInterface returned a feedback for an invalid evaluation result.").not.toHaveBeenCalled();
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R56", "Unit", "Precondition", "createFeedback does not throw when evaluation result is valid"), () => {
    const createFeedback = vi.fn(() => ({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    }));

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback
    });

    expect(() => {
      controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);
    }, "CalligraphyEvaluationInterface didn't create a feedback for a valid evaluation result.").not.toThrow();

    expect(createFeedback, "CalligraphyEvaluationInterface didn't return the expected feedback.").toHaveBeenCalledWith(TEST_CALLIGRAPHY_EVALUATION_RESULT);
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R56", "Unit", "Invariant", "feedback matches the evaluation result"), () => {
    const createFeedback = vi.fn(() => ({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    }));

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback
    });

    const feedback = controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(feedback, "CalligraphyEvaluationInterface didn't return a feedback matching the evaluation result.").toEqual({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    });

    expect(createFeedback, "CalligraphyEvaluationInterface didn't return the expected feedback.").toHaveBeenCalledWith(TEST_CALLIGRAPHY_EVALUATION_RESULT);
  });

  /**
   * Requirement: R56
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R56", "Unit", "Postcondition", "feedback contains score and summary of the evaluation result"), () => {
    const createFeedback = vi.fn(() => ({
      score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
      summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
      isOverlayVisible: true
    }));

    const controller = CreateCalligraphyEvaluationController({
      evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
      createFeedback
    });

    const feedback = controller.createFeedback(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(feedback.score, "CalligraphyEvaluationInterface didn't return a feedback score.").toBeDefined();
    expect(feedback.summary, "CalligraphyEvaluationInterface didn't return a feedback summary.").toBeDefined();

    expect(createFeedback, "CalligraphyEvaluationInterface didn't return the expected feedback.").toHaveBeenCalledWith(TEST_CALLIGRAPHY_EVALUATION_RESULT);
  });
});