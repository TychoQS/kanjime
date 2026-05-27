import { describe, expect, it } from "vitest";

import { CreateErrorController } from "../../../src/Features/Error/CreateErrorController";
import { createErrorDependencies } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";

const SAFE_ERROR_MESSAGE = "An unexpected error has occurred. You can continue using the application.";
const UNEXPECTED_ERROR = new Error("Unexpected rendering failure");

describe("ErrorInterface", () => {
  /**
   * Requirement: R60
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R60", "Unit", "Precondition", "captures a thrown runtime error"), async () => {
    const controller = CreateErrorController(createErrorDependencies());

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);

    expect(state.isControlled).toBe(true);
  });

  /**
   * Requirement: R60
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R60", "Unit", "Invariant", "does not leave the application in an empty state"), async () => {
    const controller = CreateErrorController(createErrorDependencies());

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);

    expect(state.message.length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R60
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R60", "Unit", "Postcondition", "returns controlled error interface state"), async () => {
    const controller = CreateErrorController(createErrorDependencies());

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);

    expect(state.message).toBe(SAFE_ERROR_MESSAGE);
  });
});
