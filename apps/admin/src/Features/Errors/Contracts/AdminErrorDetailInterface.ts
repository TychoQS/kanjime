import type { AdminErrorDetail } from "@kanjime/shared";

/**
 * Contract for reading one reported error detail in the administration panel.
 *
 * Requirement IDs: R66.
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
}
