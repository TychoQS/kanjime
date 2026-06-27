import type { AdminVersionSummary, VersionConfiguration } from "@kanjime/shared";

/**
 * Contract for reading administration version configuration.
 */
export interface AdminVersionsInterface {
  /**
   * Returns the version configuration summary visible to the administrator.
   *
   * Requirement IDs: R63.
   *
   * @pre A version configuration is available.
   * @inv Reading the configuration never mutates the existing version values.
   * @post The administrator can read the current, latest, and minimum supported versions.
   */
  getVersionSummary(configuration: VersionConfiguration): Promise<AdminVersionSummary>;
}
