import type { AdminTechnicalSummary } from "@kanjime/shared";

import type { AdminDashboardInterface } from "../Contracts/AdminDashboardInterface";
import type { CreateAdminDashboardControllerDependencies } from "../CreateAdminDashboardController";

/**
 * Creates the admin dashboard view model.
 */
export function createAdminDashboardViewModel(
  dependencies: CreateAdminDashboardControllerDependencies
): AdminDashboardInterface {
  void dependencies;

  return {
    async loadTechnicalSummary(): Promise<AdminTechnicalSummary> {
      const summary = await dependencies.loadTechnicalSummary();

      return {
        versionConfiguration: {
          currentVersion: summary.versionConfiguration.currentVersion,
          latestVersion: summary.versionConfiguration.latestVersion,
          minimumSupportedVersion: summary.versionConfiguration.minimumSupportedVersion,
          updatedAt: summary.versionConfiguration.updatedAt
        },
        reportedErrorCount: summary.reportedErrorCount,
        latestReportedErrorAt: summary.latestReportedErrorAt
      };
    }
  };
}
