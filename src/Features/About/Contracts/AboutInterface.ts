/**
 * Contract for the About feature.
 *
 * @inv The About screen never stays empty when valid application metadata is available.
 * @inv The exposed version always matches the installed application version.
 */
export interface AboutInterface {
  /**
   * Returns the informational items rendered in the About screen.
   *
   * Requirement IDs: R1.
   *
   * @pre The user is currently viewing the About screen.
   * @post The returned collection contains the informational application data shown to the user.
   */
  getAboutInformation(): Promise<ReadonlyArray<{ label: string; value: string }>>;

  /**
   * Returns the installed application version displayed in the About screen.
   *
   * Requirement IDs: R2.
   *
   * @pre The user is currently viewing the About screen.
   * @post The returned value matches the application version installed in the system.
   */
  getApplicationVersion(): Promise<string>;
}
