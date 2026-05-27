import type { VersionCheckResult } from "@kanjime/shared";

/**
 * Contract for startup version verification.
 *
 * Requirement IDs: R57, R59.
 *
 * @inv Version verification never blocks normal application startup.
 * @inv Remote connection failures are handled without uncontrolled startup errors.
 */
export interface VersionCheckInterface {
  /**
   * Checks whether the running version is current and supported.
   *
   * Requirement IDs: R57.
   *
   * @pre A startup flow is running and a current application version is defined.
   * @post The returned result identifies whether the running version is current or an update is available.
   */
  checkCurrentVersion(currentVersion: string | null): Promise<VersionCheckResult>;

  /**
   * Returns the last known version result when the remote version source cannot be reached.
   *
   * Requirement IDs: R59.
   *
   * @pre Version verification has been attempted and the remote configuration failed to load.
   * @inv The fallback does not throw an uncontrolled startup error.
   * @post The returned result uses the latest known configuration available to the application.
   */
  recoverWithLastKnownConfiguration(): Promise<VersionCheckResult>;
}
