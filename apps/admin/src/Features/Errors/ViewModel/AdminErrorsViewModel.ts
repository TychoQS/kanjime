import type { AdminErrorSummary } from "@kanjime/shared";

import type { AdminErrorsInterface } from "../Contracts/AdminErrorsInterface";
import type { CreateAdminErrorsControllerDependencies } from "../CreateAdminErrorsController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the admin errors view model.
 */
export function createAdminErrorsViewModel(
  dependencies: CreateAdminErrorsControllerDependencies
): AdminErrorsInterface {
  void dependencies;

  return {
    async listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
