import type { AdminVersionFormState, VersionConfiguration } from "@kanjime/shared";

import type { AdminVersionFormInterface } from "../Contracts/AdminVersionFormInterface";
import type { CreateAdminVersionFormControllerDependencies } from "../CreateAdminVersionFormController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the admin version form view model.
 */
export function createAdminVersionFormViewModel(
  dependencies: CreateAdminVersionFormControllerDependencies
): AdminVersionFormInterface {
  void dependencies;

  return {
    validateVersionConfiguration(_configuration: VersionConfiguration): AdminVersionFormState {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    async saveVersionConfiguration(_configuration: VersionConfiguration): Promise<VersionConfiguration> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
