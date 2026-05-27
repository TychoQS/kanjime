import type { VersionConfiguration } from "@kanjime/shared";

import type { AdminVersionFormInterface } from "./Contracts/AdminVersionFormInterface";
import { createAdminVersionFormViewModel } from "./ViewModel/AdminVersionFormViewModel";

/**
 * External collaborators consumed by the admin version form controller.
 */
export interface CreateAdminVersionFormControllerDependencies {
  readonly saveVersionConfiguration: (configuration: VersionConfiguration) => Promise<VersionConfiguration>;
}

/**
 * Creates the admin version form controller.
 */
export function CreateAdminVersionFormController(
  dependencies: CreateAdminVersionFormControllerDependencies
): AdminVersionFormInterface {
  return createAdminVersionFormViewModel(dependencies);
}
