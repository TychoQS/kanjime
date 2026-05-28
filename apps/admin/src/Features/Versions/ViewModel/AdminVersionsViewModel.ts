import type { AdminVersionSummary, VersionConfiguration } from "@kanjime/shared";

import type { AdminVersionsInterface } from "../Contracts/AdminVersionsInterface";
import type { CreateAdminVersionsControllerDependencies } from "../CreateAdminVersionsController";

/**
 * Creates the admin versions view model.
 */
export function createAdminVersionsViewModel(
  dependencies: CreateAdminVersionsControllerDependencies
): AdminVersionsInterface {
  void dependencies;

  return {
    async getVersionSummary(configuration: VersionConfiguration): Promise<AdminVersionSummary> {
      return {
        currentVersion: configuration.currentVersion,
        latestVersion: configuration.latestVersion,
        minimumSupportedVersion: configuration.minimumSupportedVersion,
        updatedAt: configuration.updatedAt
      };
    }
  };
}
