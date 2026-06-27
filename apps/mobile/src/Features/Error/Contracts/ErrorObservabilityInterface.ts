import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";

/**
 * Contract for creating structured runtime error reports.
 *
 * @inv The anonymous client identifier, when attached to the report, never contains personal user data.
 */
export interface ErrorObservabilityInterface {
  /**
   * Creates an observability report from a controlled captured error.
   *
   * Requirement IDs: R61, R71.
   *
   * @pre A controlled error and basic execution context are available, and an anonymous installation identifier can be attached when available.
   * @inv Each generated report must include the required structured traceability fields, record no more than the ten most recent user actions, and exclude any sensitive or personally identifiable user information.
   * @post The application generates a report with message, date, application version, web engine used and its version, basic execution context, and the anonymous client or installation identifier when available.
   */
  createErrorReport(error: Error, context: ApplicationErrorContext): Promise<ApplicationErrorReport>;
}
