import type { CalligraphyAttempt, CalligraphyVisualComparison } from "@kanjime/shared";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateCalligraphyEvaluationController } from "../../../src/Features/Calligraphy/CreateCalligraphyEvaluationController";
import { evaluateCalligraphyAttempt } from "../../../src/Features/Calligraphy/Services/CalligraphyEvaluationService";
import { CalligraphyEvaluationView } from "../../../src/Features/Calligraphy/View/CalligraphyEvaluationView";
import {
  applyOpenCvHomography,
  configureOpenCvWorkerFactory,
  initializeOpenCvWorker,
  type OpenCvHomographyResult,
  resetOpenCvWorkerClient,
  type OpenCvWorkerRequest,
  type OpenCvWorkerResponse
} from "../../../src/Shared/OpenCvHomographyWorkerClient";

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

const openCvMainThreadImport = vi.hoisted(() => vi.fn());

vi.mock("@techstark/opencv-js", () => {
  openCvMainThreadImport();
  return {};
});

const TEST_ALIGNED_ATTEMPT_IMAGE_URI = "data:image/svg+xml;base64,PHN2Zy8+";
const TEST_MATCHED_KEYPOINTS = [
  [{ x: 10, y: 10 }, { x: 12, y: 11 }],
  [{ x: 30, y: 18 }, { x: 31, y: 19 }],
  [{ x: 50, y: 24 }, { x: 52, y: 25 }],
  [{ x: 70, y: 18 }, { x: 71, y: 20 }]
] as const;
const TEST_REFERENCE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 109 109\"><path d=\"M10 10 C 30 20 50 20 90 10\"/></svg>";
const TEST_WORKER_CALLIGRAPHY_ATTEMPT: CalligraphyAttempt = {
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

class FakeOpenCvWorker {
  readonly messages: OpenCvWorkerRequest[] = [];
  readonly transferCounts: number[] = [];
  private readonly listeners: Array<(event: MessageEvent<OpenCvWorkerResponse>) => void> = [];

  constructor(private readonly homographyResult: OpenCvHomographyResult) {}

  postMessage(message: OpenCvWorkerRequest, transfer: Transferable[] = []): void {
    this.messages.push(message);
    this.transferCounts.push(transfer.length);

    if (message.type === "initialize") {
      this.emit({
        id: message.id,
        type: "initialized"
      });
      return;
    }

    this.emit({
      id: message.id,
      type: "homographyResult",
      result: this.homographyResult
    });
  }

  addEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void {
    if (type === "message") {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void {
    if (type !== "message") {
      return;
    }

    const listenerIndex = this.listeners.indexOf(listener);

    if (listenerIndex >= 0) {
      this.listeners.splice(listenerIndex, 1);
    }
  }

  terminate(): void {
    this.listeners.splice(0, this.listeners.length);
  }

  private emit(message: OpenCvWorkerResponse): void {
    this.listeners.forEach(listener => listener({
      data: message
    } as MessageEvent<OpenCvWorkerResponse>));
  }
}

function configureFakeOpenCvWorker(result: OpenCvHomographyResult): FakeOpenCvWorker[] {
  const workerInstances: FakeOpenCvWorker[] = [];

  configureOpenCvWorkerFactory(() => {
    const worker = new FakeOpenCvWorker(result);
    workerInstances.push(worker);
    return worker;
  });
  initializeOpenCvWorker();

  return workerInstances;
}

function createWorkerBackedEvaluationController() {
  return CreateCalligraphyEvaluationController({
    evaluateAttempt: attempt => evaluateCalligraphyAttempt({
      loadReferenceStrokeOrder: async () => TEST_REFERENCE_SVG
    }, attempt),
    createFeedback: () => TEST_CALLIGRAPHY_EVALUATION_FEEDBACK
  });
}

describe("CalligraphyEvaluationInterface", () => {

  afterEach(() => {
    cleanup();
    resetOpenCvWorkerClient();
    openCvMainThreadImport.mockClear();
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
   * OpenCV homography should run through a single worker instance without importing OpenCV on the main thread.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "OpenCV homography runs through one worker without main-thread initialization"), async () => {
    const workerInstances = configureFakeOpenCvWorker({
      isHomographyApplied: true,
      matchedKeypoints: TEST_MATCHED_KEYPOINTS,
      alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI
    });
    const controller = createWorkerBackedEvaluationController();

    const firstResult = await controller.evaluateAttempt(TEST_WORKER_CALLIGRAPHY_ATTEMPT);
    const secondResult = await controller.evaluateAttempt(TEST_WORKER_CALLIGRAPHY_ATTEMPT);
    const workerMessages = workerInstances[0].messages;
    const homographyMessages = workerMessages.filter(message => message.type === "applyHomography");
    const homographyTransferCounts = workerInstances[0].transferCounts.filter((_, index) => workerMessages[index].type === "applyHomography");

    expect(
      openCvMainThreadImport,
      "R70 regression postcondition should not initialize OpenCV on the main thread."
    ).not.toHaveBeenCalled();
    expect(
      workerMessages[0]?.type,
      "R70 regression postcondition should initialize OpenCV through the worker startup message."
    ).toBe("initialize");
    expect(
      workerInstances,
      "R70 regression postcondition should instantiate a single OpenCV worker across consecutive evaluations."
    ).toHaveLength(1);
    expect(
      homographyMessages,
      "R70 regression postcondition should send each homography evaluation to the OpenCV worker."
    ).toHaveLength(2);
    expect(
      homographyTransferCounts,
      "R70 regression postcondition should transfer the reference and attempt images to the worker for each evaluation."
    ).toEqual([2, 2]);
    expect(
      firstResult.visualComparison?.isHomographyApplied,
      "R70 regression postcondition should consume the worker homography result for the first evaluation."
    ).toBe(true);
    expect(
      secondResult.visualComparison?.isHomographyApplied,
      "R70 regression postcondition should consume the worker homography result for the second evaluation."
    ).toBe(true);
  });

  /**
   * Requirement R70 - Postcondition:
   * the worker should return matched keypoints and an aligned attempt data URI when enough correspondences exist.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "the worker returns matched keypoints and aligned attempt data URI"), async () => {
    configureFakeOpenCvWorker({
      isHomographyApplied: true,
      matchedKeypoints: TEST_MATCHED_KEYPOINTS,
      alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI
    });

    const result = await applyOpenCvHomography({
      referenceImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      attemptImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      referencePoints: TEST_MATCHED_KEYPOINTS.map(([referencePoint]) => referencePoint),
      attemptPoints: TEST_MATCHED_KEYPOINTS.map(([, attemptPoint]) => attemptPoint),
      visualSize: 109
    });

    expect(
      result.matchedKeypoints,
      "R70 regression postcondition should return matched keypoints as reference and attempt coordinate pairs."
    ).toEqual(TEST_MATCHED_KEYPOINTS);
    expect(
      result.alignedAttemptImageUri,
      "R70 regression postcondition should return the aligned attempt as a valid data URI."
    ).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  /**
   * Requirement R70 - Postcondition:
   * the visual comparison should expose worker homography metadata when homography is applied.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "visual comparison exposes keypoints and aligned attempt when homography applies"), async () => {
    configureFakeOpenCvWorker({
      isHomographyApplied: true,
      matchedKeypoints: TEST_MATCHED_KEYPOINTS,
      alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI
    });

    const result = await createWorkerBackedEvaluationController().evaluateAttempt(TEST_WORKER_CALLIGRAPHY_ATTEMPT);

    expect(
      result.visualComparison?.matchedKeypoints,
      "R70 regression postcondition should expose matched keypoints in CalligraphyVisualComparison when homography applies."
    ).toEqual(TEST_MATCHED_KEYPOINTS);
    expect(
      result.visualComparison?.alignedAttemptImageUri,
      "R70 regression postcondition should expose the aligned attempt image URI in CalligraphyVisualComparison when homography applies."
    ).toBe(TEST_ALIGNED_ATTEMPT_IMAGE_URI);
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
   * insufficient matches should omit optional homography fields without interrupting evaluation.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "insufficient matches omit aligned image and keypoints without throwing"), async () => {
    configureFakeOpenCvWorker({
      isHomographyApplied: true,
      matchedKeypoints: TEST_MATCHED_KEYPOINTS.slice(0, 3),
      alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI
    });
    const evaluation = createWorkerBackedEvaluationController().evaluateAttempt(TEST_WORKER_CALLIGRAPHY_ATTEMPT);

    await expect(
      evaluation,
      "R70 regression postcondition should not throw when the worker reports fewer than four homography matches."
    ).resolves.not.toThrow();

    const result = await evaluation;

    expect(
      result.visualComparison?.matchedKeypoints,
      "R70 regression postcondition should omit matched keypoints when fewer than four matches are available."
    ).toBeUndefined();
    expect(
      result.visualComparison?.alignedAttemptImageUri,
      "R70 regression postcondition should omit the aligned image when fewer than four matches are available."
    ).toBeUndefined();
  });

  /**
   * Requirement R70 - Postcondition:
   * homography should not be requested from the worker before OpenCV initialization resolves.
   */
  it(buildRequirementTitle("R70", "Regression", "Postcondition", "homography is not applied before OpenCV worker initialization resolves"), async () => {
    class DelayedOpenCvWorker {
      readonly messages: OpenCvWorkerRequest[] = [];
      private readonly listeners: Array<(event: MessageEvent<OpenCvWorkerResponse>) => void> = [];

      postMessage(message: OpenCvWorkerRequest): void {
        this.messages.push(message);

        if (message.type === "applyHomography") {
          this.emit({
            id: message.id,
            type: "homographyResult",
            result: {
              isHomographyApplied: true,
              matchedKeypoints: TEST_MATCHED_KEYPOINTS,
              alignedAttemptImageUri: TEST_ALIGNED_ATTEMPT_IMAGE_URI
            }
          });
        }
      }

      addEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void {
        if (type === "message") {
          this.listeners.push(listener);
        }
      }

      removeEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void {
        if (type !== "message") {
          return;
        }

        const listenerIndex = this.listeners.indexOf(listener);

        if (listenerIndex >= 0) {
          this.listeners.splice(listenerIndex, 1);
        }
      }

      terminate(): void {
        this.listeners.splice(0, this.listeners.length);
      }

      resolveInitialization(): void {
        const initializeMessage = this.messages.find(message => message.type === "initialize");

        if (initializeMessage !== undefined) {
          this.emit({
            id: initializeMessage.id,
            type: "initialized"
          });
        }
      }

      private emit(message: OpenCvWorkerResponse): void {
        this.listeners.forEach(listener => listener({
          data: message
        } as MessageEvent<OpenCvWorkerResponse>));
      }
    }

    const worker = new DelayedOpenCvWorker();
    let hasInitializationResolved = false;

    configureOpenCvWorkerFactory(() => worker);

    const initialization = initializeOpenCvWorker().then(() => {
      hasInitializationResolved = true;
    });
    const earlyHomography = await applyOpenCvHomography({
      referenceImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      attemptImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      referencePoints: TEST_MATCHED_KEYPOINTS.map(([referencePoint]) => referencePoint),
      attemptPoints: TEST_MATCHED_KEYPOINTS.map(([, attemptPoint]) => attemptPoint),
      visualSize: 109
    });

    expect(
      hasInitializationResolved,
      "R70 regression postcondition should keep initialization pending until the worker emits initialized."
    ).toBe(false);
    expect(
      earlyHomography.isHomographyApplied,
      "R70 regression postcondition should skip homography while OpenCV worker initialization is pending."
    ).toBe(false);
    expect(
      worker.messages.filter(message => message.type === "applyHomography"),
      "R70 regression postcondition should not send applyHomography before initializeOpenCvWorker resolves."
    ).toHaveLength(0);

    worker.resolveInitialization();
    await initialization;
    await applyOpenCvHomography({
      referenceImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      attemptImage: new TextEncoder().encode(TEST_REFERENCE_SVG).buffer,
      referencePoints: TEST_MATCHED_KEYPOINTS.map(([referencePoint]) => referencePoint),
      attemptPoints: TEST_MATCHED_KEYPOINTS.map(([, attemptPoint]) => attemptPoint),
      visualSize: 109
    });

    expect(
      hasInitializationResolved,
      "R70 regression postcondition should resolve initializeOpenCvWorker after the initialized worker message."
    ).toBe(true);
    expect(
      worker.messages.filter(message => message.type === "applyHomography"),
      "R70 regression postcondition should send applyHomography only after initializeOpenCvWorker resolves."
    ).toHaveLength(1);
  });
});
