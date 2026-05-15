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
 * Requirement: R51
 * Type: Unit
 * Condition: Invariant and Postcondition
 */
describe("CalligraphyCanvasInterface", () => {
  it("preserves stroke capture order in canvas history", () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(FIRST_STROKE);
    controller.registerStroke(SECOND_STROKE);

    expect(controller.getStrokeHistory()).toEqual([FIRST_STROKE, SECOND_STROKE]);
  });

  /**
   * Requirement: R52
   * Type: Unit
   * Condition: Precondition, Invariant and Postcondition
   */
  it("resets the current writing attempt and remains operational", () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(FIRST_STROKE);
    controller.resetAttempt();
    controller.registerStroke(SECOND_STROKE);

    expect(controller.getStrokeHistory()).toEqual([SECOND_STROKE]);
  });
});
