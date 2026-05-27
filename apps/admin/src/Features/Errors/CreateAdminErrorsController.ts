import type { AdminErrorSummary } from "@kanjime/shared";

import type { AdminErrorsInterface } from "./Contracts/AdminErrorsInterface";
import { createAdminErrorsViewModel } from "./ViewModel/AdminErrorsViewModel";

/**
 * External collaborators consumed by the admin errors controller.
 */
export interface CreateAdminErrorsControllerDependencies {
  readonly listReportedErrors: () => Promise<ReadonlyArray<AdminErrorSummary>>;
}

/**
 * Creates the admin errors controller.
 */
export function CreateAdminErrorsController(
  dependencies: CreateAdminErrorsControllerDependencies
): AdminErrorsInterface {
  return createAdminErrorsViewModel(dependencies);
}
