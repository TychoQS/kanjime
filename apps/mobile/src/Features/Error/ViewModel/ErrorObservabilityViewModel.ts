import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";

import type { ErrorObservabilityInterface } from "../Contracts/ErrorObservabilityInterface";
import type { CreateErrorObservabilityControllerDependencies } from "../CreateErrorObservabilityController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the error observability view model.
 */
export function createErrorObservabilityViewModel(
  dependencies: CreateErrorObservabilityControllerDependencies
): ErrorObservabilityInterface {
  void dependencies;

  return {
    async createErrorReport(_error: Error, _context: ApplicationErrorContext): Promise<ApplicationErrorReport> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
