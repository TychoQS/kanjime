import type { AdminVersionFormState, VersionConfiguration } from "@kanjime/shared";

import type { AdminVersionFormInterface } from "../Contracts/AdminVersionFormInterface";
import type { CreateAdminVersionFormControllerDependencies } from "../CreateAdminVersionFormController";

const VERSION_FORMAT = /^\d+\.\d+\.\d+$/;
const INVALID_VERSION_MESSAGE = "Enter a valid semantic version.";

/**
 * Creates the admin version form view model.
 */
export function createAdminVersionFormViewModel(
  dependencies: CreateAdminVersionFormControllerDependencies
): AdminVersionFormInterface {
  void dependencies;

  return {
    validateVersionConfiguration(configuration: VersionConfiguration): AdminVersionFormState {
      const isValid =
        VERSION_FORMAT.test(configuration.currentVersion) &&
        VERSION_FORMAT.test(configuration.latestVersion) &&
        VERSION_FORMAT.test(configuration.minimumSupportedVersion);

      return {
        currentVersion: configuration.currentVersion,
        latestVersion: configuration.latestVersion,
        minimumSupportedVersion: configuration.minimumSupportedVersion,
        validationMessage: isValid ? null : INVALID_VERSION_MESSAGE,
        canSave: isValid
      };
    },
    async saveVersionConfiguration(configuration: VersionConfiguration): Promise<VersionConfiguration> {
      const state = this.validateVersionConfiguration(configuration);

      if (!state.canSave) {
        throw new Error(INVALID_VERSION_MESSAGE);
      }

      return dependencies.saveVersionConfiguration(configuration);
    }
  };
}
