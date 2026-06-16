import type { AdminErrorFilter, AdminErrorStatus, AdminErrorSummary } from "@kanjime/shared";

import type { AdminErrorsInterface } from "../Contracts/AdminErrorsInterface";
import type { CreateAdminErrorsControllerDependencies } from "../CreateAdminErrorsController";

const ALL_ERRORS_FILTER: AdminErrorFilter = "all";
const FILTER_ERROR_MESSAGE = "The selected filter is not allowed.";
const ADMIN_ERROR_STATUSES = new Set<AdminErrorStatus>([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "DISCARDED"
]);

/**
 * Creates the admin errors view model.
 */
export function createAdminErrorsViewModel(
  dependencies: CreateAdminErrorsControllerDependencies
): AdminErrorsInterface {
  return {
    async listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>> {
      const errors = await dependencies.listReportedErrors();

      return errors.map(normalizeErrorSummary);
    },
    async filterReportedErrors(filter: AdminErrorFilter): Promise<ReadonlyArray<AdminErrorSummary>> {
      if (!isAdminErrorFilter(filter)) {
        throw new Error(FILTER_ERROR_MESSAGE);
      }

      if (dependencies.filterReportedErrors) {
        return (await dependencies.filterReportedErrors(filter)).map(normalizeErrorSummary);
      }

      const errors = await dependencies.listReportedErrors();
      const summaries = errors.map(normalizeErrorSummary);
      return filter === ALL_ERRORS_FILTER ? summaries : summaries.filter(error => error.status === filter);
    },
    subscribeToErrors(callback: (errors: ReadonlyArray<AdminErrorSummary>) => void): () => void {
      if (dependencies.subscribeToErrors) {
        return dependencies.subscribeToErrors(errors => {
          callback(errors.map(normalizeErrorSummary));
        });
      }
      return () => {};
    }
  };
}

function normalizeErrorSummary(error: AdminErrorSummary): AdminErrorSummary {
  return {
    id: error.id,
    message: error.message,
    occurredAt: error.occurredAt,
    applicationVersion: error.applicationVersion,
    status: error.status,
    contextSummary: error.contextSummary
  };
}

function isAdminErrorFilter(value: AdminErrorFilter): value is AdminErrorFilter {
  return value === ALL_ERRORS_FILTER || ADMIN_ERROR_STATUSES.has(value as AdminErrorStatus);
}
