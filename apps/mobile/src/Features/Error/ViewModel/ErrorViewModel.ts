import type { ErrorInterface } from "../Contracts/ErrorInterface";
import type { CreateErrorControllerDependencies } from "../CreateErrorController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the controlled error view model.
 */
export function createErrorViewModel(dependencies: CreateErrorControllerDependencies): ErrorInterface {
  void dependencies;

  return {
    async captureUnexpectedError(
      _error: Error
    ): Promise<{ readonly message: string; readonly isControlled: boolean }> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
