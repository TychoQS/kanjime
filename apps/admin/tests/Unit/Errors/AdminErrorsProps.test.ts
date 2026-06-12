import type { AdminErrorsProps } from "../../../src/Features/Errors/Contracts/AdminErrorsProps";
import { CreateAdminErrorsController } from "../../../src/Features/Errors/CreateAdminErrorsController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { AdminErrorSummary } from "@kanjime/shared";

describe("AdminErrorsProps", () => {
  const ERROR_IDENTIFIER = "error-report-1";
  const ERROR_MESSAGE = "An unexpected error has occurred.";
  const ERROR_DATE = "2026-05-27T00:00:00.000Z";
  const APPLICATION_VERSION = "1.0.0";
  const CONTEXT_SUMMARY = "Recognition screen";
  const SENSITIVE_TEXT = "password";

  const REPORTED_ERRORS: ReadonlyArray<AdminErrorSummary> = [
    {
      id: ERROR_IDENTIFIER,
      message: ERROR_MESSAGE,
      occurredAt: ERROR_DATE,
      applicationVersion: APPLICATION_VERSION,
      status: "OPEN",
      contextSummary: CONTEXT_SUMMARY
    }
  ];

  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R28", "Unit", "Precondition", "renders error list with reported errors"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();

    expect(listReportedErrors.calls, "The reported error list was not requested.").toHaveLength(1);
    expect(errors.length, "The error list does not contain any reported error.").toBeGreaterThan(0);
  });

  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R28", "Unit", "Postcondition", "shows enough basic information to identify each error"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();

    expect(errors.length, "The error list does not show every reported error.").toBe(REPORTED_ERRORS.length);

    for (const [index, expectedError] of REPORTED_ERRORS.entries()) {
      expect(errors[index].id, "The reported error does not show its identifier.").toBe(expectedError.id);
      expect(errors[index].message, "The reported error does not show its message.").toBe(expectedError.message);
      expect(errors[index].occurredAt, "The reported error does not show its date.").toBe(expectedError.occurredAt);
      expect(errors[index].applicationVersion, "The reported error does not show the application version.").toBe(expectedError.applicationVersion);
      expect(errors[index].contextSummary, "The reported error does not show its basic context summary.").toBe(expectedError.contextSummary);
    }
  });
});
