import type { AdminVersionSummary, VersionConfiguration } from "@kanjime/shared";

import type { AdminVersionsInterface } from "../Contracts/AdminVersionsInterface";
import type { CreateAdminVersionsControllerDependencies } from "../CreateAdminVersionsController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the admin versions view model.
 */
export function createAdminVersionsViewModel(
  dependencies: CreateAdminVersionsControllerDependencies
): AdminVersionsInterface {
  void dependencies;

  return {
    async getVersionSummary(_configuration: VersionConfiguration): Promise<AdminVersionSummary> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
