import type { UpdateAvailabilityState, VersionCheckResult } from "@kanjime/shared";

/**
 * Contract for creating a non-blocking update notice.
 */
export interface UpdateAvailableInterface {
  /**
   * Converts a version check result into visible update notice state.
   *
   * Requirement IDs: R58.
   *
   * @pre The running version is lower than the latest available compatible version.
   * @inv An available update notice never prevents normal use of the application.
   * @post The returned state activates an informational update recommendation when an update exists.
   */
  getUpdateAvailability(result: VersionCheckResult): UpdateAvailabilityState;
}
