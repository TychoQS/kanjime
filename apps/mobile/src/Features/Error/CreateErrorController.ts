import type { ErrorInterface } from "./Contracts/ErrorInterface";
import { createErrorViewModel } from "./ViewModel/ErrorViewModel";

/**
 * External collaborators consumed by the controlled error controller.
 */
export interface CreateErrorControllerDependencies {
  readonly createUserFacingMessage: () => string;
}

/**
 * Creates the controlled error controller.
 */
export function CreateErrorController(dependencies: CreateErrorControllerDependencies): ErrorInterface {
  return createErrorViewModel(dependencies);
}
