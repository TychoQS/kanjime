import type { AdminErrorFilter, AdminErrorSummary } from "@kanjime/shared";

/**
 * Contract for reading and filtering reported application errors in the administration panel.
 *
 * Requirement IDs: R65, R73.
 */
export interface AdminErrorsInterface {
  /**
   * Returns the list of reported errors visible to the administrator.
   *
   * Requirement IDs: R65.
   *
   * @pre Error reports have been registered by the application.
   * @post The administrator can see reported errors with basic analysis for information.
   */
  listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>>;

  /**
   * Returns the list of reported errors matching the selected visual filter.
   *
   * Requirement IDs: R73.
   *
   * @pre At least two reported errors exist with different statuses.
   * @inv The "all" option is treated only as a visual filter and never as an assignable report status.
   * @post The administration screen exposes only the errors matching the selected status or all errors when the "all" filter is selected.
   */
  filterReportedErrors(filter: AdminErrorFilter): Promise<ReadonlyArray<AdminErrorSummary>>;

  /**
   * Subscribes to real-time updates of reported application errors.
   *
   * @pre The administrator accesses the error reporting screen.
   * @post The callback is notified when new error reports arrive in the system.
   */
  subscribeToErrors(callback: (errors: ReadonlyArray<AdminErrorSummary>) => void): () => void;
}
