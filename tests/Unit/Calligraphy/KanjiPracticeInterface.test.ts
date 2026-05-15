import { describe, expect, it } from "vitest";

import { CreateKanjiPracticeController } from "../../../src/Features/Calligraphy/CreateKanjiPracticeController";
import {
  TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE, TEST_CALLIGRAPHY_EMPTY_ATTEMPT, TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_TARGET_CHARACTER
} from "../../Support/TestData";
import {buildRequirementTitle} from "../../Support/RequirementTest";
import {createAsyncValueRecorder} from "../../Support/DependencyFactories";

describe("KanjiPracticeInterface", () => {

  /**
   * Requirement: R50
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R50", "Unit", "Postcondition", "returns to the selected category kanji list"), async () => {
    const navigateBackToCategoryRecorder = createAsyncValueRecorder(undefined);

    const controller = CreateKanjiPracticeController({
      navigateBackToCategory: navigateBackToCategoryRecorder.handler,
      requestEvaluation: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT
    });

    await controller.returnToCategory();
    expect(navigateBackToCategoryRecorder.calls.length).toBe(1, "KanjiPracticeInterface did not return to the selected category kanji list.");
  });

  /**
   * Requirement: R53
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R53", "Unit", "Precondition", "request evaluation throws when attempt has no strokes"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    const controller = CreateKanjiPracticeController({
      navigateBackToCategory: async () => undefined,
      requestEvaluation: evaluationRecorder.handler
    });

    await expect(
        controller.requestEvaluation(TEST_CALLIGRAPHY_EMPTY_ATTEMPT)
    ).rejects.toThrow();

    expect(evaluationRecorder.calls.length).toBe(
        0,
        "KanjiPracticeInterface requested evaluation without registered strokes (invalid attempt)."
    );
  });

  /**
   * Requirement: R53
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R53", "Unit", "Precondition", "request evaluation does not throw when attempt has strokes"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    const controller = CreateKanjiPracticeController({
      navigateBackToCategory: async () => undefined,
      requestEvaluation: evaluationRecorder.handler
    });

    await expect(
        controller.requestEvaluation(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE)
    ).resolves.not.toThrow();

    expect(evaluationRecorder.calls.length).toBe(
        1,
        "KanjiPracticeInterface did not request evaluation for a valid attempt."
    );
  });

  /**
   * Requirement: R53
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R53", "Unit", "Invariant", "registered strokes are not modified during evaluation request"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    const controller = CreateKanjiPracticeController({
      navigateBackToCategory: async () => undefined,
      requestEvaluation: evaluationRecorder.handler
    });

    const originalStrokes = [...TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE.strokes];

    await controller.requestEvaluation(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE);

    expect(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE.strokes).toEqual(
        originalStrokes,
        "KanjiPracticeInterface modified strokes during evaluation request."
    );
  });

  /**
   * Requirement: R53
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R53", "Unit", "Postcondition", "requests evaluation for the current attempt"), async () => {
    const evaluationRecorder = createAsyncValueRecorder(
        TEST_CALLIGRAPHY_EVALUATION_RESULT
    );

    const controller = CreateKanjiPracticeController({
      navigateBackToCategory: async () => undefined,
      requestEvaluation: evaluationRecorder.handler
    });

    const result = await controller.requestEvaluation(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE);

    expect(evaluationRecorder.calls.length).toBe(
        1,
        "KanjiPracticeInterface did not request evaluation exactly once."
    );

    expect(evaluationRecorder.calls).toEqual(
        [TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE],
        "KanjiPracticeInterface did not request evaluation for the current attempt."
    );
    expect(result.targetCharacter).toBe(TEST_CALLIGRAPHY_TARGET_CHARACTER, "KanjiPracticeInterface did not request evaluation for the proper character");
  });
});
