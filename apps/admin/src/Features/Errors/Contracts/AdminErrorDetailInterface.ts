import type { AdminErrorDetail } from "@kanjime/shared";

/**
 * Contract for reading one reported error detail in the administration panel.
 *
 * Requirement IDs: R66.
 *
 * @inv The returned detail belongs to the selected error and omits sensitive user information.
 */
export interface AdminErrorDetailInterface {
  /**
   * Returns the basic detail for a selected reported error.
   *
   * Requirement IDs: R66.
   *
   * @pre The administrator selects an existing error from the reported error list.
   * @inv The returned detail matches the selected error and does not expose sensitive information.
   * @post The administrator can see the message, date, application version, and basic context for the error.
   */
  getErrorDetail(errorId: string): Promise<AdminErrorDetail>;
}
