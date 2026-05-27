import type { ErrorObservabilityInterface } from "./Contracts/ErrorObservabilityInterface";
import { createErrorObservabilityViewModel } from "./ViewModel/ErrorObservabilityViewModel";

/**
 * External collaborators consumed by the error observability controller.
 */
export interface CreateErrorObservabilityControllerDependencies {
  readonly createReportId: () => string;
  readonly readCurrentDate: () => string;
}

/**
 * Creates the error observability controller.
 */
export function CreateErrorObservabilityController(
  dependencies: CreateErrorObservabilityControllerDependencies
): ErrorObservabilityInterface {
  return createErrorObservabilityViewModel(dependencies);
}
