import type { AdminErrorSummary } from "@kanjime/shared";

/**
 * Props contract for the administration reported error list.
 *
 * Requirement IDs: R28.
 *
 * @pre Reported application errors are available.
 * @inv The list shows basic error information without sensitive user information.
 * @post The administrator can identify each error by message, date, version, and context.
 */
export interface AdminErrorsProps {
  readonly errors: ReadonlyArray<AdminErrorSummary>;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly onErrorSelected: (errorId: string) => void;
}
