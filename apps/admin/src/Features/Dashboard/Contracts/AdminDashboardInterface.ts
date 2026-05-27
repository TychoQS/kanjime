import type { AdminTechnicalSummary } from "@kanjime/shared";

/**
 * Contract for the administration dashboard overview.
 *
 * Requirement IDs: R62.
 *
 * @inv Version information and error information are exposed as separate technical sections.
 */
export interface AdminDashboardInterface {
  /**
   * Loads the technical summary displayed on the administration dashboard.
   *
   * Requirement IDs: R62.
   *
   * @pre The administrator opens the administration panel.
   * @inv Version and error information remain separated in the returned summary.
   * @post The returned summary describes the basic technical state of the application.
   */
  loadTechnicalSummary(): Promise<AdminTechnicalSummary>;
}
