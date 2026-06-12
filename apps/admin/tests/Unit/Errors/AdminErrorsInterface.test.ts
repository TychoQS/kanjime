import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminErrorsController } from "../../../src/Features/Errors/CreateAdminErrorsController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { AdminErrorSummary } from "@kanjime/shared";

describe("AdminErrorsInterface", () => {
  const ERROR_IDENTIFIER = "error-report-1";
  const ERROR_MESSAGE = "An unexpected error has occurred.";
  const ERROR_DATE = "2026-05-27T00:00:00.000Z";
  const APPLICATION_VERSION = "1.0.0";

  const REPORTED_ERRORS: ReadonlyArray<AdminErrorSummary> = [
    {
      id: ERROR_IDENTIFIER,
      message: ERROR_MESSAGE,
      occurredAt: ERROR_DATE,
      applicationVersion: APPLICATION_VERSION,
      status: "OPEN",
      contextSummary: "Recognition screen"
    }
  ];

  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R65", "Unit", "Precondition", "receives reported application errors"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();

    expect(errors.length, "The reported list is empty").toBeGreaterThan(0);
    expect(listReportedErrors.calls, "The reported error list was not requested.").toHaveLength(1);
  });

  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R65", "Unit", "Postcondition", "shows reported errors with basic analysis information"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();

    expect(errors.length, "The reported error list does not show every reported error.").toBe(REPORTED_ERRORS.length);
    for (const [index, expectedError] of REPORTED_ERRORS.entries()) {
      expect(errors[index].id, "The reported error does not show its identifier.").toBe(expectedError.id);
      expect(errors[index].message, "The reported error does not show its message.").toBe(expectedError.message);
      expect(errors[index].occurredAt, "The reported error does not show its date.").toBe(expectedError.occurredAt);
      expect(errors[index].applicationVersion, "The reported error does not show the application version.").toBe(expectedError.applicationVersion);
      expect(errors[index].contextSummary, "The reported error does not show its basic context summary.").toBe(expectedError.contextSummary);
    }
  });

  /**
   * Requirement: R65
   * Type: Regression
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R65", "Regression", "Postcondition", "Ensures observability of error reports in admin app"), async () => {
    let subscriberCallback: ((errors: ReadonlyArray<AdminErrorSummary>) => void) | null = null;
    const subscribeToErrors = (callback: (errors: ReadonlyArray<AdminErrorSummary>) => void) => {
      subscriberCallback = callback;
      return () => {
        subscriberCallback = null;
      };
    };

    const controller = CreateAdminErrorsController({
      listReportedErrors: async () => REPORTED_ERRORS,
      subscribeToErrors
    });

    let notifiedErrors: ReadonlyArray<AdminErrorSummary> = [];
    const unsubscribe = controller.subscribeToErrors!(errors => {
      notifiedErrors = errors;
    });

    expect(subscriberCallback).not.toBeNull();

    const updatedErrors = [
      ...REPORTED_ERRORS,
      {
        id: "error-report-2",
        message: "Another error",
        occurredAt: ERROR_DATE,
        applicationVersion: APPLICATION_VERSION,
        status: "RESOLVED" as const,
        contextSummary: "Calligraphy screen"
      }
    ];

    subscriberCallback!(updatedErrors);

    expect(notifiedErrors).toEqual(updatedErrors);

    unsubscribe();
    expect(subscriberCallback).toBeNull();
  });
});
