import type { AdminVersionSummary } from "@kanjime/shared";

/**
 * Props contract for the administration version summary view.
 *
 * Requirement IDs: R26.
 *
 * @pre User is in the in the version screen of the admin panel.
 * @inv Current version, latest version, and configuration update date are clearly differentiated.
 * @post The administrator can understand the version state without interpreting complex technical data.
 */
export interface AdminVersionsProps {
  readonly summary: AdminVersionSummary;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}
