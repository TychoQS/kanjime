import type { CalligraphyAttempt, CalligraphyVisualComparison } from "@kanjime/shared";

import { cleanup, render, screen } from "@testing-library/react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import { evaluateCalligraphyAttempt } from "../../../src/Features/Calligraphy/Services/CalligraphyEvaluationService";
import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import { initializeOpenCv } from "../../../src/Shared/OpenCvService";

import {
  TEST_CALLIGRAPHY_EMPTY_ATTEMPT,
  TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
  TEST_CALLIGRAPHY_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_EVALUATION_RESULT_WITHOUT_VISUALS,
  TEST_CALLIGRAPHY_EVALUATION_SCORE,
  TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  TEST_CALLIGRAPHY_FALLBACK_SIMILARITY,
  TEST_CALLIGRAPHY_FINALIZED_ATTEMPT,
  TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT,
  TEST_CALLIGRAPHY_REFERENCE_VISUAL,
  TEST_CALLIGRAPHY_SIFT_SIMILARITY,
  TEST_CALLIGRAPHY_VISUAL_COMPARISON
} from "../../Support/TestData";

import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncArgumentRecorder } from "../../Support/DependencyFactories";

const TEST_ALIGNED_ATTEMPT_IMAGE_URI = "data:image/svg+xml;base64,PHN2Zy8+";
const TEST_MATCHED_KEYPOINTS = [
  [{ x: 10, y: 10 }, { x: 12, y: 11 }],
  [{ x: 30, y: 18 }, { x: 31, y: 19 }],
  [{ x: 50, y: 24 }, { x: 52, y: 25 }],
  [{ x: 70, y: 18 }, { x: 71, y: 20 }]
] as const;
const TEST_REFERENCE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 109 109\"><path d=\"M10 10 C 30 20 50 20 90 10\"/></svg>";
const TEST_OPENCV_CALLIGRAPHY_ATTEMPT: CalligraphyAttempt = {
  targetCharacter: "水",
  categoryId: "jlpt-n5",
  isFinalized: true,
  strokes: [{
    startedAt: "attempt-r70-worker",
    endedAt: "attempt-r70-worker-end",
    points: [
      { x: 10, y: 10 },
      { x: 30, y: 18 },
      { x: 50, y: 24 },
      { x: 70, y: 18 },
      { x: 90, y: 10 }
    ]
  }]
};

function createOpenCvBackedEvaluationController() {
  return CreateCalligraphyEvaluationController({
    evaluateAttempt: attempt => evaluateCalligraphyAttempt({
      loadReferenceStrokeOrder: async () => TEST_REFERENCE_SVG
    }, attempt),
    createFeedback: () => TEST_CALLIGRAPHY_EVALUATION_FEEDBACK
  });
}
function clearGlobalOpenCv(): void {
  Reflect.deleteProperty(globalThis, "cv");
}

describe("CalligraphyEvaluationInterface", () => {

  afterEach(() => {
    cleanup();
    clearGlobalOpenCv();
    vi.restoreAllMocks();
  });

  const evaluationController = CreateCalligraphyEvaluationController({
    evaluateAttempt: async () => TEST_CALLIGRAPHY_EVALUATION_RESULT,
    createFeedback: () => TEST_CALLIGRAPHY_EVALUATION_FEEDBACK
  });

  const fallbackEvaluationController = CreateCalligraphyEvaluationController({
    evaluateAttempt: async () => ({
      ...TEST_CALLIGRAPHY_EVALUATION_RESULT,
      similarityEvaluation: TEST_CALLIGRAPHY_FALLBACK_SIMILARITY
    }),
    createFeedback: () => TEST_CALLIGRAPHY_EVALUATION_FEEDBACK
  });

  /**
   * Requirement: R54
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R54", "Unit", "Precondition", "evaluateAttempt throws when attempt has no strokes"), async () => {
    const evaluationRecorder = createAsyncArgumentRecorder<typeof TEST_CALLIGRAPHY_EMPTY_ATTEMPT, typeof TEST_CALLIGRAPHY_EVALUATION_RESULT>(TEST_CALLIGRAPHY_EVALUATION_RESULT);
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
    const evaluationRecorder = createAsyncArgumentRecorder<typeof TEST_CALLIGRAPHY_FINALIZED_ATTEMPT, typeof TEST_CALLIGRAPHY_EVALUATION_RESULT>(TEST_CALLIGRAPHY_EVALUATION_RESULT);
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
    const evaluationRecorder = createAsyncArgumentRecorder<typeof TEST_CALLIGRAPHY_FINALIZED_ATTEMPT, typeof TEST_CALLIGRAPHY_EVALUATION_RESULT>(TEST_CALLIGRAPHY_EVALUATION_RESULT);
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
 * calculating SIFT similarity should not modify the independent metric values
 * already present in the evaluation result.
 */
  it(buildRequirementTitle("R68", "Unit", "Invariant", "SIFT similarity preserves the other evaluation metrics"), async () => {
    const result = await evaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

    expect(
      result.metrics,
      "R68 invariant should preserve stroke-count, stroke-order, and approximate-direction metrics after SIFT similarity is calculated."
    ).toEqual({
      strokeCount: TEST_CALLIGRAPHY_EVALUATION_RESULT.metrics.strokeCount,
      strokeOrder: TEST_CALLIGRAPHY_EVALUATION_RESULT.metrics.strokeOrder,
      approximateDirection: TEST_CALLIGRAPHY_EVALUATION_RESULT.metrics.approximateDirection,
      generalSimilarity: TEST_CALLIGRAPHY_EVALUATION_RESULT.metrics.generalSimilarity
    });
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
      fallbackEvaluationController.calculateGeneralSimilarity(
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
      fallbackEvaluationController.calculateGeneralSimilarity(
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
      fallbackEvaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT),
      "R69 invariant should keep the evaluation in a controlled state instead of surfacing an uncontrolled exception."
    ).resolves.not.toThrow();
  });

  /**
   * Requirement R69 - Postcondition:
   * the fallback strategy should return a controlled similarity score.
   */
  it(buildRequirementTitle("R69", "Unit", "Postcondition", "the fallback strategy returns a controlled similarity score"), async () => {
    const result = await fallbackEvaluationController.evaluateAttempt(TEST_CALLIGRAPHY_FINALIZED_ATTEMPT);

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
      () => evaluationController.createVisualComparison(TEST_CALLIGRAPHY_EVALUATION_RESULT_WITHOUT_VISUALS),
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

  /**
   * Requirement R70 - Postcondition:
   * homography should read the OpenCV runtime from globalThis.cv.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "homography reads global OpenCV runtime directly"), async () => {
    const cvGetter = vi.fn(() => ({ Mat: class {} }));

    Object.defineProperty(globalThis, "cv", {
      configurable: true,
      get: cvGetter
    });

    await createOpenCvBackedEvaluationController().evaluateAttempt(TEST_OPENCV_CALLIGRAPHY_ATTEMPT);

    expect(
      cvGetter,
      "R70 regression postcondition should read globalThis.cv during calligraphy homography evaluation."
    ).toHaveBeenCalled();
  });

  /**
   * Requirement R70 - Postcondition:
   * OpenCV initialization should resolve immediately when the global runtime already exists.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "OpenCV initialization resolves immediately when global runtime exists"), async () => {
    const scriptCountBeforeInitialization = document.head.querySelectorAll("script[src='/opencv/opencv.js']").length;

    Object.defineProperty(globalThis, "cv", {
      configurable: true,
      value: { Mat: class {} }
    });

    await expect(
      initializeOpenCv(),
      "R70 regression postcondition should resolve initializeOpenCv immediately when globalThis.cv is already ready."
    ).resolves.toBeUndefined();

    expect(
      document.head.querySelectorAll("script[src='/opencv/opencv.js']").length,
      "R70 regression postcondition should not inject a script when OpenCV is already available globally."
    ).toBe(scriptCountBeforeInitialization);
  });

  /**
   * Requirement R70 - Postcondition:
   * the view should render aligned attempt imagery and keypoint overlays when comparison data is available.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "view renders aligned attempt image and matched keypoint overlay"), () => {
    const visualComparison: CalligraphyVisualComparison = {
      ...TEST_CALLIGRAPHY_VISUAL_COMPARISON,
      alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI,
      matchedKeypoints: TEST_MATCHED_KEYPOINTS
    };

    render(CalligraphyEvaluationView({
      comparison: visualComparison,
      feedback: {
          ...TEST_CALLIGRAPHY_EVALUATION_FEEDBACK,
          visualComparison
        },
      onDismissRequested: vi.fn()
    }));

    expect(
      screen.getByTestId("calligraphy-aligned-attempt-visual").getAttribute("src"),
      "R70 regression postcondition should render the aligned attempt image when it is available."
    ).toBe(TEST_ALIGNED_ATTEMPT_IMAGE_URI);
    expect(
      screen.getAllByTestId("calligraphy-keypoint"),
      "R70 regression postcondition should render one reference overlay point for each matched keypoint."
    ).toHaveLength(TEST_MATCHED_KEYPOINTS.length);
  });

  /**
   * Requirement R70 - Postcondition:
   * homography should be skipped without throwing when OpenCV is unavailable.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "homography skips without throwing when global OpenCV is unavailable"), async () => {
    clearGlobalOpenCv();
    const evaluation = createOpenCvBackedEvaluationController().evaluateAttempt(TEST_OPENCV_CALLIGRAPHY_ATTEMPT);

    await expect(
      evaluation,
      "R70 regression postcondition should not throw when globalThis.cv is unavailable."
    ).resolves.not.toThrow();

    const result = await evaluation;

    expect(
      result.visualComparison?.isHomographyApplied,
      "R70 regression postcondition should return isHomographyApplied false when globalThis.cv is unavailable."
    ).toBe(false);
  });
});
