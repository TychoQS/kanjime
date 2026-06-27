import type { VersionCheckResult } from "@kanjime/shared";

/**
 * Contract for startup version verification.
 */
export interface VersionCheckInterface {
  /**
   * Checks whether the running version is current and supported.
   *
   * Requirement IDs: R57.
   *
   * @pre A startup flow is running and a current application version is defined.
   * @inv Version verification never blocks normal application startup.
   * @post The returned result identifies whether the running version is current or an update is available.
   */
  checkCurrentVersion(currentVersion: string | null): Promise<VersionCheckResult>;

  /**
   * Returns the last known version result when the remote version source cannot be reached.
   *
   * Requirement IDs: R59.
   *
   * @pre The application attempts to check the version and the remote request fails or there is no connection.
   * @inv The connection failure must not cause an unhandled error during startup.
   * @post The application uses the last known configuration.
   */
  recoverWithLastKnownConfiguration(): Promise<VersionCheckResult>;
}
