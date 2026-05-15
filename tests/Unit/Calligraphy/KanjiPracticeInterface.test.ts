import { describe, expect, it } from "vitest";

import { CreateKanjiPracticeController } from "../../../src/Features/Calligraphy/CreateKanjiPracticeController";
import {
  TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE,
  TEST_CALLIGRAPHY_TARGET_CHARACTER
} from "../../Support/TestData";

/**
 * Requirement: R50
 * Type: Unit
 * Condition: Postcondition
 */
describe("KanjiPracticeInterface", () => {
  it("returns from active practice to the selected category list", async () => {
    const controller = CreateKanjiPracticeController({});

    await expect(controller.returnToCategory()).resolves.toBeUndefined();
  });

  /**
   * Requirement: R53
   * Type: Unit
   * Condition: Precondition, Invariant and Postcondition
   */
  it("requests evaluation for the current attempt without mutating its strokes", async () => {
    const controller = CreateKanjiPracticeController({});
    const originalStrokeCount = TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE.strokes.length;

    const result = await controller.requestEvaluation(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE);

    expect(TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE.strokes).toHaveLength(originalStrokeCount);
    expect(result.targetCharacter).toBe(TEST_CALLIGRAPHY_TARGET_CHARACTER);
  });
});
