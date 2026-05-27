import type { UpdateAvailableInterface } from "./Contracts/UpdateAvailableInterface";
import { createUpdateAvailableViewModel } from "./ViewModel/UpdateAvailableViewModel";

/**
 * External collaborators consumed by the update availability controller.
 */
export interface CreateUpdateAvailableControllerDependencies {
  readonly createUpdateMessage: (currentVersion: string, latestVersion: string) => string;
}

/**
 * Creates the update availability controller.
 */
export function CreateUpdateAvailableController(
  dependencies: CreateUpdateAvailableControllerDependencies
): UpdateAvailableInterface {
  return createUpdateAvailableViewModel(dependencies);
}
