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
   * @pre The administrator access the administration panel.
   * @post The returned summary describes technical state of the application.
   */
  loadTechnicalSummary(): Promise<AdminTechnicalSummary>;

  /**
   * Subscribes to real-time updates of technical summary information.
   *
   * @pre The administrator accesses the administration dashboard.
   * @post The callback is notified when technical metrics or errors are updated.
   */
  subscribeToSummary(callback: (summary: AdminTechnicalSummary) => void): () => void;
}
