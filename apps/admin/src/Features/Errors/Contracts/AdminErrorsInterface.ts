import type { AdminErrorSummary } from "@kanjime/shared";

/**
 * Contract for reading reported application errors in the administration panel.
 *
 * Requirement IDs: R65.
 *
 * @inv Reported error summaries never expose sensitive user information.
 */
export interface AdminErrorsInterface {
  /**
   * Returns the list of reported errors visible to the administrator.
   *
   * Requirement IDs: R65.
   *
   * @pre Error reports have been registered by the application.
   * @inv The returned list omits sensitive user information.
   * @post The administrator can see reported errors with basic analysis information.
   */
  listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>>;
}
