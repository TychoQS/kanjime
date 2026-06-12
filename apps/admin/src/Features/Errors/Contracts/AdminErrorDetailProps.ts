import type { AdminErrorDetail, AdminErrorStatus } from "@kanjime/shared";

/**
 * Props contract for the administration reported error detail.
 *
 * Requirement IDs: R66, R32.
 *
 * @pre The administrator has selected an existing reported error.
 * @inv The detail belongs to the selected error, does not expose sensitive user information, and keeps the "all" option outside the selectable status list.
 * @post The administrator sees the message, date, application version, basic execution context, and the real status options differentiated from list-only filters.
 */
export interface AdminErrorDetailProps {
  readonly detail: AdminErrorDetail | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly availableStatuses: ReadonlyArray<AdminErrorStatus>;
  readonly onStatusSelected: (status: AdminErrorStatus) => void;
  readonly onBackRequested: () => void;
}
