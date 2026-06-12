import type { AdminErrorFilter, AdminErrorStatus, AdminErrorSummary } from "@kanjime/shared";

/**
 * Props contract for the administration reported error list.
 *
 * Requirement IDs: R28, R31.
 *
 * @pre Reported application errors are available.
 * @inv The list shows basic error information without sensitive user information, and the "all" option is displayed only as a visual filter and never as a report status.
 * @post The administrator can identify each error by message, date, version, context, and real report status while distinguishing those statuses from the "all" filter.
 */
export interface AdminErrorsProps {
  readonly errors: ReadonlyArray<AdminErrorSummary>;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly activeFilter: AdminErrorFilter;
  readonly availableFilters: ReadonlyArray<AdminErrorFilter>;
  readonly availableStatuses: ReadonlyArray<AdminErrorStatus>;
  readonly onFilterSelected: (filter: AdminErrorFilter) => void;
  readonly onErrorSelected: (errorId: string) => void;
}
