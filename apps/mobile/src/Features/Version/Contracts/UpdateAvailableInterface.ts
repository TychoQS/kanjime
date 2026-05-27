import type { UpdateAvailabilityState, VersionCheckResult } from "@kanjime/shared";

/**
 * Contract for creating a non-blocking update notice.
 *
 * Requirement IDs: R58.
 *
 * @inv An available update notice never prevents normal use of the application.
 */
export interface UpdateAvailableInterface {
  /**
   * Converts a version check result into visible update notice state.
   *
   * Requirement IDs: R58.
   *
   * @pre The running version is lower than the latest available compatible version.
   * @inv A compatible but old version does not block the application.
   * @post The returned state activates an informational update recommendation when an update exists.
   */
  getUpdateAvailability(result: VersionCheckResult): UpdateAvailabilityState;
}
