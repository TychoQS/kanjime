import type { AdminVersionsInterface } from "./Contracts/AdminVersionsInterface";
import { createAdminVersionsViewModel } from "./ViewModel/AdminVersionsViewModel";

/**
 * External collaborators consumed by the admin versions controller.
 */
export interface CreateAdminVersionsControllerDependencies {
  readonly readCurrentDate: () => string;
}

/**
 * Creates the admin versions controller.
 */
export function CreateAdminVersionsController(
  dependencies: CreateAdminVersionsControllerDependencies
): AdminVersionsInterface {
  return createAdminVersionsViewModel(dependencies);
}
