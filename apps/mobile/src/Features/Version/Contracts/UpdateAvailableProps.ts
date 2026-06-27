/**
 * Props contract for the user-facing update availability notice.
 *
 * Requirement IDs: R24.
 *
 * @pre A newer application version exists than the version currently used by the user.
 * @inv The message does not use internal technical terms and does not block normal application use.
 * @post The user sees a clear update message and can continue using the application.
 */
export interface UpdateAvailableProps {
  readonly isVisible: boolean;
  readonly message: string;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly canContinueUsingApplication: boolean;
  readonly onDismissRequested: () => void;
}
