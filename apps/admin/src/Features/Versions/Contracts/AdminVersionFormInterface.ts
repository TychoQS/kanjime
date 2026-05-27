import type { AdminVersionFormState, VersionConfiguration } from "@kanjime/shared";

/**
 * Contract for editing administration version configuration.
 *
 * Requirement IDs: R64.
 *
 * @inv Saved configuration values always keep a valid version format.
 */
export interface AdminVersionFormInterface {
  /**
   * Validates an editable version form state.
   *
   * Requirement IDs: R64.
   *
   * @pre The administrator enters a version configuration in the form.
   * @inv Invalid version values are rejected before saving.
   * @post The returned state identifies whether the configuration can be saved.
   */
  validateVersionConfiguration(configuration: VersionConfiguration): AdminVersionFormState;

  /**
   * Saves a valid version configuration.
   *
   * Requirement IDs: R64.
   *
   * @pre The administrator submits a valid version configuration.
   * @inv Invalid version values are not persisted.
   * @post The new configuration is registered and available to the application.
   */
  saveVersionConfiguration(configuration: VersionConfiguration): Promise<VersionConfiguration>;
}
