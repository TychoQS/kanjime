import type { AdminTechnicalSummary } from "@kanjime/shared";

import type { AdminDashboardInterface } from "../Contracts/AdminDashboardInterface";
import type { CreateAdminDashboardControllerDependencies } from "../CreateAdminDashboardController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the admin dashboard view model.
 */
export function createAdminDashboardViewModel(
  dependencies: CreateAdminDashboardControllerDependencies
): AdminDashboardInterface {
  void dependencies;

  return {
    async loadTechnicalSummary(): Promise<AdminTechnicalSummary> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
