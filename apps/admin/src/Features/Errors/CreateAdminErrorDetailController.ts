import type { AdminErrorDetail } from "@kanjime/shared";

import type { AdminErrorDetailInterface } from "./Contracts/AdminErrorDetailInterface";
import { createAdminErrorDetailViewModel } from "./ViewModel/AdminErrorDetailViewModel";

/**
 * External collaborators consumed by the admin error detail controller.
 */
export interface CreateAdminErrorDetailControllerDependencies {
  readonly getErrorDetail: (errorId: string) => Promise<AdminErrorDetail>;
}

/**
 * Creates the admin error detail controller.
 */
export function CreateAdminErrorDetailController(
  dependencies: CreateAdminErrorDetailControllerDependencies
): AdminErrorDetailInterface {
  return createAdminErrorDetailViewModel(dependencies);
}
