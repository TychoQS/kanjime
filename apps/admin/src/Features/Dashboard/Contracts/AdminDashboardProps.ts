import type { AdminTechnicalSummary } from "@kanjime/shared";

/**
 * Props contract for the administration technical dashboard.
 *
 * Requirement IDs: R62.
 *
 * @pre The administrator opens the administration panel.
 * @inv Version information and reported error information are shown as separate sections.
 * @post The administrator can inspect the basic technical state of the application.
 */
export interface AdminDashboardProps {
  readonly summary: AdminTechnicalSummary | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}
