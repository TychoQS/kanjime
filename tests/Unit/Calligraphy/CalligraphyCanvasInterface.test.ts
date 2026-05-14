import { describe, expect, it } from "vitest";

import { CreateCalligraphyCanvasController } from "../../../src/Features/Calligraphy/CreateCalligraphyCanvasController";
import type { Stroke } from "../../../src/Shared/DomainTypes";

const FIRST_STROKE: Stroke = {
  points: [{ x: 1, y: 1 }],
  startedAt: "2026-05-14T10:00:00.000Z",
  endedAt: "2026-05-14T10:00:01.000Z"
};

const SECOND_STROKE: Stroke = {
  points: [{ x: 2, y: 2 }],
  startedAt: "2026-05-14T10:00:02.000Z",
  endedAt: "2026-05-14T10:00:03.000Z"
};

/**
 * R51 Inv/Post: Captured strokes are stored in the order drawn by the user.
 */
describe("CalligraphyCanvasInterface", () => {
  it("preserves stroke capture order in canvas history", () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(FIRST_STROKE);
    controller.registerStroke(SECOND_STROKE);

    expect(controller.getStrokeHistory()).toEqual([FIRST_STROKE, SECOND_STROKE]);
  });

  /**
   * R52 Pre/Inv/Post: Reset requires strokes, clears them, and keeps the canvas operational.
   */
  it("resets the current writing attempt and remains operational", () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(FIRST_STROKE);
    controller.resetAttempt();
    controller.registerStroke(SECOND_STROKE);

    expect(controller.getStrokeHistory()).toEqual([SECOND_STROKE]);
  });
});
