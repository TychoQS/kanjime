import { describe, expect, it } from "vitest";

import { CreateCalligraphyCanvasController } from "../../../src/Features/Calligraphy/CreateCalligraphyCanvasController";
import { TEST_SECOND_STROKE, TEST_STROKE } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("CalligraphyCanvasInterface", () => {
  /**
   * Requirement: R51
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R51", "Unit", "Invariant", "strokes preserve capture order in canvas history"), () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(TEST_STROKE);
    controller.registerStroke(TEST_SECOND_STROKE);

    expect(controller.getStrokeHistory()).toEqual(
      [TEST_STROKE, TEST_SECOND_STROKE],
      "CalligraphyCanvasInterface did not preserve stroke capture order."
    );
  });

  /**
   * Requirement: R51
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R51", "Unit", "Postcondition", "each new stroke is registered in canvas history"), () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(TEST_STROKE);
    controller.registerStroke(TEST_SECOND_STROKE);
    controller.registerStroke(TEST_STROKE);

    expect(controller.getStrokeHistory()).toHaveLength(
      3,
      "CalligraphyCanvasInterface did not register all strokes in history."
    );
  });

  /**
   * Requirement: R52
   * Type: Unit
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R52", "Unit", "Precondition", "reset attempt throws when no strokes are registered"), () => {
    const controller = CreateCalligraphyCanvasController({});

    expect(() => {
      controller.resetAttempt();
    }, "CalligraphyCanvasInterface try to reset when no strokes were registered.").toThrow();
  });

  /**
   * Requirement: R52
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R52", "Unit", "Precondition", "attempt can only be reset when strokes are registered"), () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(TEST_STROKE);

    expect(() => {
      controller.resetAttempt();
    }, "CalligraphyCanvasInterface didn't reset when strokes were registered.").not.toThrow();
  });

  /**
   * Requirement: R52
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R52", "Unit", "Invariant", "canvas remains operational after resetting attempt"), () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(TEST_STROKE);
    controller.resetAttempt();

    expect(() => {
      controller.registerStroke(TEST_SECOND_STROKE);
    }, "CalligraphyCanvasInterface didn't register strokes after resetting attempt.").not.toThrow();
  });

  /**
   * Requirement: R52
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R52", "Unit", "Postcondition", "all strokes are removed from current attempt after reset"), () => {
    const controller = CreateCalligraphyCanvasController({});

    controller.registerStroke(TEST_STROKE);
    controller.resetAttempt();

    expect(controller.getStrokeHistory()).toHaveLength(
      0,
      "CalligraphyCanvasInterface kept residual strokes after resetting attempt."
    );
  });
});
