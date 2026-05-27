import type { AdminVersionFormState, VersionConfiguration } from "@kanjime/shared";

/**
 * Contract for editing administration version configuration.
 *
 * Requirement IDs: R64.
 * @inv Saved configuration values always keep a valid version format. Invalid version values are not persisted.
 * @post The new configuration is registered and available to the application.
 */
export interface AdminVersionFormInterface {
  /**
   * Validates an editable version form state.
   */
  validateVersionConfiguration(configuration: VersionConfiguration): AdminVersionFormState;

  /**
   * Saves a valid version configuration.
   * @pre The administrator is on the version settings screen and adds a configuration version.
   */
  saveVersionConfiguration(configuration: VersionConfiguration): Promise<VersionConfiguration>;
}
