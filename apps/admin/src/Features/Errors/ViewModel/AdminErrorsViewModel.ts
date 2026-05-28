import type { AdminErrorSummary } from "@kanjime/shared";

import type { AdminErrorsInterface } from "../Contracts/AdminErrorsInterface";
import type { CreateAdminErrorsControllerDependencies } from "../CreateAdminErrorsController";

/**
 * Creates the admin errors view model.
 */
export function createAdminErrorsViewModel(
  dependencies: CreateAdminErrorsControllerDependencies
): AdminErrorsInterface {
  void dependencies;

  return {
    async listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>> {
      const errors = await dependencies.listReportedErrors();

      return errors.map(error => ({
        id: error.id,
        message: error.message,
        occurredAt: error.occurredAt,
        applicationVersion: error.applicationVersion,
        contextSummary: error.contextSummary
      }));
    }
  };
}
