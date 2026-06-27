import type { AdminErrorDetail, AdminErrorStatus } from "@kanjime/shared";

/**
 * Contract for reading and updating one reported error detail in the administration panel.
 *
 * Requirement IDs: R66, R72.
 */
export interface AdminErrorDetailInterface {
  /**
   * Returns the basic detail for a selected reported error.
   *
   * Requirement IDs: R66.
   *
   * @pre The administrator is listed in the error log, and there is at least one reported error.
   * @inv The returned detail matches the selected error.
  * @post The administrator can see the message, date, application version, and basic context for the error.
   */
  getErrorDetail(errorId: string): Promise<AdminErrorDetail>;

  /**
   * Updates the selected reported-error status.
   *
   * Requirement IDs: R72.
   *
   * @pre The administrator is on the detail screen of an existing reported error.
   * @inv The selected status belongs to the allowed set OPEN, IN_PROGRESS, RESOLVED, CLOSED, or DISCARDED.
   * @post The reported error is updated with the status selected by the administrator.
   */
  updateErrorStatus(errorId: string, status: AdminErrorStatus): Promise<AdminErrorDetail>;
}
