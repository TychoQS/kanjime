import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";

/**
 * Contract for creating structured runtime error reports.
 *
 * Requirement IDs: R61.
 *
 * @inv Generated reports contain structured traceability fields and omit sensitive user information.
 */
export interface ErrorObservabilityInterface {
  /**
   * Creates an observability report from a controlled captured error.
   *
   * Requirement IDs: R61.
   *
   * @pre A controlled error and basic execution context are available.
   * @inv The report contains the required traceability fields and the last ten user actions at most.
   * @post The report is ready to be registered or sent to the observability service.
   */
  createErrorReport(error: Error, context: ApplicationErrorContext): Promise<ApplicationErrorReport>;
}
