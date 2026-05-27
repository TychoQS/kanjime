import type { AdminErrorDetail } from "@kanjime/shared";

/**
 * Props contract for the administration reported error detail.
 *
 * Requirement IDs: R66.
 *
 * @pre The administrator has selected an existing reported error.
 * @inv The detail belongs to the selected error and does not expose sensitive user information.
 * @post The administrator sees the message, date, application version, and basic execution context.
 */
export interface AdminErrorDetailProps {
  readonly detail: AdminErrorDetail | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly onBackRequested: () => void;
}
