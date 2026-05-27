import type { ErrorProps } from "../../../src/Features/Error/Contracts/ErrorProps";
import { describe, expect, it } from "vitest";

import { CreateErrorController } from "../../../src/Features/Error/CreateErrorController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("ErrorProps", () => {
  const SAFE_ERROR_MESSAGE = "An unexpected error has occurred. You can continue using the application.";
  const UNEXPECTED_ERROR = new Error("Unexpected rendering failure");

  /**
   * Requirement: R25
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R25", "Unit", "Precondition", "renders controlled error interface after unexpected failure"), async () => {
    const createUserFacingMessage = createValueRecorder(SAFE_ERROR_MESSAGE);
    const controller = CreateErrorController({
      createUserFacingMessage: createUserFacingMessage.handler
    });

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);

    expect(state.isControlled).toBe(true);
  });

  /**
   * Requirement: R25
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R25", "Unit", "Invariant", "does not show stack traces or internal details"), async () => {
    const createUserFacingMessage = createValueRecorder(SAFE_ERROR_MESSAGE);
    const controller = CreateErrorController({
      createUserFacingMessage: createUserFacingMessage.handler
    });

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);
    const props: ErrorProps = {
      isVisible: state.isControlled,
      message: state.message,
      canContinue: true,
      onDismissRequested: () => undefined
    };

    expect(props.message).not.toContain("Error:");
    expect(props.message).not.toContain("stack");
  });

  /**
   * Requirement: R25
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R25", "Unit", "Postcondition", "shows a clear non-technical error message"), async () => {
    const createUserFacingMessage = createValueRecorder(SAFE_ERROR_MESSAGE);
    const controller = CreateErrorController({
      createUserFacingMessage: createUserFacingMessage.handler
    });

    const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);

    expect(state.message).toBe(SAFE_ERROR_MESSAGE);
  });
});
