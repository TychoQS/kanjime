/**
 * Contract for controlled runtime error handling.
 *
 * Requirement IDs: R60.
 *
 * @inv Capturing an unexpected error never causes a second failure or leaves an empty screen.
 */
export interface ErrorInterface {
  /**
   * Captures an unexpected runtime error and returns a safe user-facing message.
   *
   * Requirement IDs: R60.
   *
   * @pre A component or application flow throws an unexpected runtime error.
   * @inv The capture mechanism does not throw a secondary error.
   * @post A controlled error state is available for rendering.
   */
  captureUnexpectedError(error: Error): Promise<{ readonly message: string; readonly isControlled: boolean }>;
}
