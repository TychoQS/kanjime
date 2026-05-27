import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";

/**
 * Contract for creating structured runtime error reports.
 */
export interface ErrorObservabilityInterface {
  /**
   * Creates an observability report from a controlled captured error.
   *
   * Requirement IDs: R61.
   *
   * @pre A controlled error and basic execution context are available.
   * @inv Each generated report must include the required structured traceability fields, record no more than the ten most recent user actions, and exclude any sensitive or personally identifiable user information.
   * @post The application generates a report with message, date, application version, web engine used and its version, and basic execution context indicating the last 10 user actions performed, leaving it ready to be registered or sent to the observability service.
   */
  createErrorReport(error: Error, context: ApplicationErrorContext): Promise<ApplicationErrorReport>;
}
