import { describe, expect, it } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_CALLIGRAPHY_EMPTY_ATTEMPT,
  TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
  TEST_CALLIGRAPHY_EVALUATION_METRICS,
  TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_FALLBACK_SIMILARITY,
  TEST_CALLIGRAPHY_FINALIZED_ATTEMPT,
  TEST_CALLIGRAPHY_REFERENCE_VISUAL,
  TEST_CALLIGRAPHY_SIFT_SIMILARITY,
  TEST_CALLIGRAPHY_VISUAL_COMPARISON
} from "../../Support/TestData";

describe("CalligraphyEvaluationInterface requirements", () => {
  const evaluationController = CreateCalligraphyEvaluationController({
    evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
    createFeedback: () => TEST_CALLIGRAPHY_EVALUATION_FEEDBACK
  });

  /**
   * Requirement R68 - Precondition (valid):
   * a finalized attempt with a renderable reference should produce a SIFT similarity evaluation.
   */
  it(buildRequirementTitle("R68", "Unit", "Precondition", "finalized attempts with a reference can run SIFT similarity"), async () => {
    await expect(
      evaluationController.calculateGeneralSimilarity(
        TEST_CALLIGRAPHY_FINALIZED_ATTEMPT,
        TEST_CALLIGRAPHY_REFERENCE_VISUAL
      ),
      "R68 valid precondition should accept a finalized attempt and a renderable reference."
    ).resolves.toEqual(TEST_CALLIGRAPHY_SIFT_SIMILARITY);
  });

  /**
   * Requirement R68 - Precondition (invalid):
   * a non-finalized attempt should be rejected before running SIFT similarity.
   */
  it(buildRequirementTitle("R68", "Unit", "Precondition", "non-finalized attempts are rejected before SIFT similarity"), async () => {
    await expect(
      evaluationController.calculateGeneralSimilarity(
        TEST_CALLIGRAPHY_EMPTY_ATTEMPT,
        TEST_CALLIGRAPHY_REFERENCE_VISUAL
      ),
      "R68 invalid precondition should reject attempts that are not finalized."
    ).rejects.toThrow("finalized");
  });

  /**
   * Requirement R68 - Invariant:
   * calculating general similarity should preserve the independent metric values.
   */
  it(buildRequirementTitle("R68", "Unit", "Invariant", "SIFT similarity preserves the other evaluation metrics"), async () => {
    const result = await evaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(
      result.metrics,
      "R68 invariant should preserve stroke-count, stroke-order, and approximate-direction metrics."
    ).toEqual(TEST_CALLIGRAPHY_EVALUATION_METRICS);
  });

  /**
   * Requirement R68 - Postcondition:
   * the evaluation should expose a SIFT-based general similarity score.
   */
  it(buildRequirementTitle("R68", "Unit", "Postcondition", "the evaluation exposes a SIFT-based general similarity score"), async () => {
    const result = await evaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(
      result.similarityEvaluation,
      "R68 postcondition should expose the generated SIFT similarity evaluation."
    ).toEqual(TEST_CALLIGRAPHY_SIFT_SIMILARITY);
  });

  /**
   * Requirement R69 - Precondition (valid):
   * insufficient SIFT keypoints should activate the controlled fallback strategy.
   */
  it(buildRequirementTitle("R69", "Unit", "Precondition", "insufficient keypoints activate the fallback strategy"), async () => {
    await expect(
      evaluationController.calculateGeneralSimilarity(
        TEST_CALLIGRAPHY_FINALIZED_ATTEMPT,
        TEST_CALLIGRAPHY_REFERENCE_VISUAL
      ),
      "R69 valid precondition should switch to a fallback strategy when SIFT keypoints are insufficient."
    ).resolves.toEqual(TEST_CALLIGRAPHY_FALLBACK_SIMILARITY);
  });

  /**
   * Requirement R69 - Precondition (invalid):
   * the fallback scenario should reject attempts without a finalized drawing.
   */
  it(buildRequirementTitle("R69", "Unit", "Precondition", "fallback similarity rejects attempts without a finalized drawing"), async () => {
    await expect(
      evaluationController.calculateGeneralSimilarity(
        TEST_CALLIGRAPHY_EMPTY_ATTEMPT,
        TEST_CALLIGRAPHY_REFERENCE_VISUAL
      ),
      "R69 invalid precondition should reject fallback evaluation when the attempt is not finalized."
    ).rejects.toThrow("finalized");
  });

  /**
   * Requirement R69 - Invariant:
   * insufficient keypoints should not interrupt the evaluation with an uncontrolled exception.
   */
  it(buildRequirementTitle("R69", "Unit", "Invariant", "insufficient keypoints do not interrupt the evaluation"), async () => {
    await expect(
      evaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT),
      "R69 invariant should keep the evaluation in a controlled state instead of surfacing an uncontrolled exception."
    ).resolves.toEqual(expect.objectContaining({
      similarityEvaluation: TEST_CALLIGRAPHY_FALLBACK_SIMILARITY
    }));
  });

  /**
   * Requirement R69 - Postcondition:
   * the fallback strategy should return a controlled similarity score.
   */
  it(buildRequirementTitle("R69", "Unit", "Postcondition", "the fallback strategy returns a controlled similarity score"), async () => {
    const result = await evaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(
      result.similarityEvaluation?.fallbackReason,
      "R69 postcondition should expose the fallback reason when the similarity score comes from the controlled strategy."
    ).toBe("insufficient_keypoints");
  });

  /**
   * Requirement R70 - Precondition (valid):
   * a calculated evaluation should allow creation of a visual comparison.
   */
  it(buildRequirementTitle("R70", "Unit", "Precondition", "calculated evaluations can build a visual comparison"), () => {
    expect(
      evaluationController.createVisualComparison(TEST_CALLIGRAPHY_EVALUATION_RESULT),
      "R70 valid precondition should create a visual comparison from a calculated evaluation."
    ).toEqual(TEST_CALLIGRAPHY_VISUAL_COMPARISON);
  });

  /**
   * Requirement R70 - Precondition (invalid):
   * a comparison should be rejected when no visual comparison data exists for the evaluation.
   */
  it(buildRequirementTitle("R70", "Unit", "Precondition", "evaluations without comparison data are rejected"), () => {
    expect(
      () => evaluationController.createVisualComparison(TEST_CALLIGRAPHY_EVALUATION_RESULT),
      "R70 invalid precondition should reject evaluations without reference and attempt visuals."
    ).toThrow("visual comparison");
  });

  /**
   * Requirement R70 - Invariant:
   * the visual comparison should refer to the same target character and attempt.
   */
  it(buildRequirementTitle("R70", "Unit", "Invariant", "the visual comparison refers to the same evaluated target character"), () => {
    const comparison = evaluationController.createVisualComparison(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(
      comparison.targetCharacter,
      "R70 invariant should keep the same target character in the visual comparison."
    ).toBe(TEST_CALLIGRAPHY_EVALUATION_RESULT.targetCharacter);
  });

  /**
   * Requirement R70 - Postcondition:
   * the visual comparison should expose differentiated visuals and homography information.
   */
  it(buildRequirementTitle("R70", "Unit", "Postcondition", "the visual comparison exposes differentiated visuals and homography data"), () => {
    const comparison = evaluationController.createVisualComparison(TEST_CALLIGRAPHY_EVALUATION_RESULT);

    expect(
      comparison,
      "R70 postcondition should expose differentiated reference and attempt visuals together with homography metadata."
    ).toEqual(TEST_CALLIGRAPHY_VISUAL_COMPARISON);
  });
});
