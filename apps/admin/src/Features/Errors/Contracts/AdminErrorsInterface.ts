import type { AdminErrorSummary } from "@kanjime/shared";

/**
 * Contract for reading reported application errors in the administration panel.
 *
 * Requirement IDs: R65.
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
}
