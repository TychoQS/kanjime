import type { ErrorInterface } from "../Contracts/ErrorInterface";
import type { CreateErrorControllerDependencies } from "../CreateErrorController";

/**
 * Creates the controlled error view model.
 */
export function createErrorViewModel(dependencies: CreateErrorControllerDependencies): ErrorInterface {
  return {
    async captureUnexpectedError(): Promise<{ readonly message: string; readonly isControlled: boolean }> {
      return {
        message: dependencies.createUserFacingMessage(),
        isControlled: true
      };
    }
  };
}
