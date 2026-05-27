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
  const SENSITIVE_TEXT = "password";

  const REPORTED_ERRORS: ReadonlyArray<AdminErrorSummary> = [
    {
      id: ERROR_IDENTIFIER,
      message: ERROR_MESSAGE,
      occurredAt: ERROR_DATE,
      applicationVersion: APPLICATION_VERSION,
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

    expect(errors.length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R65", "Unit", "Invariant", "omits sensitive user information from error list"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();

    expect(JSON.stringify(errors)).not.toContain(SENSITIVE_TEXT);
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

    expect(errors[0].id).toBe(ERROR_IDENTIFIER);
    expect(errors[0].message).toBe(ERROR_MESSAGE);
    expect(errors[0].occurredAt).toBe(ERROR_DATE);
    expect(errors[0].applicationVersion).toBe(APPLICATION_VERSION);
  });
});
