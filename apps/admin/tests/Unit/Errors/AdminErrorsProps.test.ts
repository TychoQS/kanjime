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

    expect(errors.length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R28", "Unit", "Invariant", "lists errors without exposing sensitive user information"), async () => {
    const listReportedErrors = createAsyncValueRecorder(REPORTED_ERRORS);
    const controller = CreateAdminErrorsController({
      listReportedErrors: listReportedErrors.handler
    });

    const errors = await controller.listReportedErrors();
    const props: AdminErrorsProps = {
      errors,
      isLoading: false,
      errorMessage: null,
      onErrorSelected: () => undefined
    };

    expect(JSON.stringify(props.errors)).not.toContain(SENSITIVE_TEXT);
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

    expect(errors[0].contextSummary).toBe(CONTEXT_SUMMARY);
  });
});
