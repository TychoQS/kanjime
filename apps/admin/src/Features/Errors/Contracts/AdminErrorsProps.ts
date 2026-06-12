import type { AdminErrorDashboardProps } from "./AdminErrorDashboardProps";

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
  readonly errors: AdminErrorDashboardProps["errors"];
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly activeFilter: AdminErrorDashboardProps["activeFilter"];
  readonly availableFilters: AdminErrorDashboardProps["availableFilters"];
  readonly availableStatuses: AdminErrorDashboardProps["availableStatuses"];
  readonly onFilterSelected: AdminErrorDashboardProps["onFilterSelected"];
  readonly onErrorSelected: (errorId: string) => void;
}
