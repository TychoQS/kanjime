import type { UpdateAvailabilityState, VersionCheckResult } from "@kanjime/shared";

import type { UpdateAvailableInterface } from "../Contracts/UpdateAvailableInterface";
import type { CreateUpdateAvailableControllerDependencies } from "../CreateUpdateAvailableController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the update availability view model.
 */
export function createUpdateAvailableViewModel(
  dependencies: CreateUpdateAvailableControllerDependencies
): UpdateAvailableInterface {
  void dependencies;

  return {
    getUpdateAvailability(_result: VersionCheckResult): UpdateAvailabilityState {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
