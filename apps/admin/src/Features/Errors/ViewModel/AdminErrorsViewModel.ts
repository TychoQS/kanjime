import type { AdminErrorFilter, AdminErrorSummary } from "@kanjime/shared";

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
        status: error.status,
        contextSummary: error.contextSummary
      }));
    },
    async filterReportedErrors(filter: AdminErrorFilter): Promise<ReadonlyArray<AdminErrorSummary>> {
      void filter;

      if (!dependencies.filterReportedErrors) {
        throw new Error("Not implemented yet");
      }

      return dependencies.filterReportedErrors(filter);
    },
    subscribeToErrors(callback: (errors: ReadonlyArray<AdminErrorSummary>) => void): () => void {
      if (dependencies.subscribeToErrors) {
        return dependencies.subscribeToErrors(callback);
      }
      return () => {};
    }
  };
}
