import { describe, expect, it } from "vitest";

import { CreateKanjiPracticeController } from "../../../src/Features/Calligraphy/CreateKanjiPracticeController";
import type { CalligraphyAttempt } from "../../../src/Shared/DomainTypes";

const ATTEMPT_WITH_STROKE: CalligraphyAttempt = {
  targetCharacter: "水",
  categoryId: "jlpt-n5",
  isFinalized: false,
  strokes: [
    {
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      startedAt: "2026-05-14T10:00:00.000Z",
      endedAt: "2026-05-14T10:00:01.000Z"
    }
  ]
};

/**
 * R50 Post: An active practice can return to the selected category list.
 */
describe("KanjiPracticeInterface", () => {
  it("returns from active practice to the selected category list", async () => {
    const controller = CreateKanjiPracticeController({});

    await expect(controller.returnToCategory()).resolves.toBeUndefined();
  });

  /**
   * R53 Pre/Inv/Post: Evaluation requires strokes and does not mutate the captured attempt.
   */
  it("requests evaluation for the current attempt without mutating its strokes", async () => {
    const controller = CreateKanjiPracticeController({});
    const originalStrokeCount = ATTEMPT_WITH_STROKE.strokes.length;

    const result = await controller.requestEvaluation(ATTEMPT_WITH_STROKE);

    expect(ATTEMPT_WITH_STROKE.strokes).toHaveLength(originalStrokeCount);
    expect(result.targetCharacter).toBe("水");
  });
});
