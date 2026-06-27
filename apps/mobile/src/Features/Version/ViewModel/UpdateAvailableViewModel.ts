import type { UpdateAvailabilityState, VersionCheckResult } from "@kanjime/shared";

import type { UpdateAvailableInterface } from "../Contracts/UpdateAvailableInterface";
import type { CreateUpdateAvailableControllerDependencies } from "../CreateUpdateAvailableController";

/**
 * Creates the update availability view model.
 */
export function createUpdateAvailableViewModel(
  dependencies: CreateUpdateAvailableControllerDependencies
): UpdateAvailableInterface {
  return {
    getUpdateAvailability(result: VersionCheckResult): UpdateAvailabilityState {
      const currentVersion = result.configuration?.currentVersion ?? "";
      const latestVersion = result.configuration?.latestVersion ?? "";
      const isVisible = result.isCurrentVersionDefined && result.isUpdateAvailable;

      return {
        isVisible,
        currentVersion,
        latestVersion,
        message: isVisible ? dependencies.createUpdateMessage(currentVersion, latestVersion) : "",
        canContinueUsingApplication: true
      };
    }
  };
}
