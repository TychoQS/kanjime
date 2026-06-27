import type { AdminTechnicalSummary } from "@kanjime/shared";

import type { AdminDashboardInterface } from "./Contracts/AdminDashboardInterface";
import { createAdminDashboardViewModel } from "./ViewModel/AdminDashboardViewModel";

/**
 * External collaborators consumed by the admin dashboard controller.
 */
export interface CreateAdminDashboardControllerDependencies {
  readonly loadTechnicalSummary: () => Promise<AdminTechnicalSummary>;
  readonly subscribeToSummary?: (callback: (summary: AdminTechnicalSummary) => void) => () => void;
}

/**
 * Creates the admin dashboard controller.
 */
export function CreateAdminDashboardController(
  dependencies: CreateAdminDashboardControllerDependencies
): AdminDashboardInterface {
  return createAdminDashboardViewModel(dependencies);
}
