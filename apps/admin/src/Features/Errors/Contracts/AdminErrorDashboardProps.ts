import type { AdminErrorFilter, AdminErrorStatus, AdminErrorSummary } from "@kanjime/shared";

/**
 * Props contract for administration error-report dashboard screen.
 *
 * Requirement IDs: R31.
 *
 * @pre The administrator is on the error-report screen and reported errors exist.
 * @inv The "all" option is displayed only as a visualization filter and never as an assignable report status.
 * @post The administrator can distinguish the real report statuses from the "all" visualization filter.
 */
export interface AdminErrorDashboardProps {
  readonly errors: ReadonlyArray<AdminErrorSummary>;
  readonly activeFilter: AdminErrorFilter;
  readonly availableFilters: ReadonlyArray<AdminErrorFilter>;
  readonly availableStatuses: ReadonlyArray<AdminErrorStatus>;
  readonly onFilterSelected: (filter: AdminErrorFilter) => void;
}
