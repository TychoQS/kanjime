import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminErrorsController } from "../../../src/Features/Errors/CreateAdminErrorsController";
import { createAdminErrorsDependencies } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";

const ERROR_IDENTIFIER = "error-report-1";
const ERROR_MESSAGE = "An unexpected error has occurred.";
const ERROR_DATE = "2026-05-27T00:00:00.000Z";
const APPLICATION_VERSION = "1.0.0";
const SENSITIVE_TEXT = "password";

describe("AdminErrorsInterface", () => {
  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R65", "Unit", "Precondition", "receives reported application errors"), async () => {
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

    const errors = await controller.listReportedErrors();

    expect(errors.length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R65", "Unit", "Invariant", "omits sensitive user information from error list"), async () => {
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

    const errors = await controller.listReportedErrors();

    expect(JSON.stringify(errors)).not.toContain(SENSITIVE_TEXT);
  });

  /**
   * Requirement: R65
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R65", "Unit", "Postcondition", "shows reported errors with basic analysis information"), async () => {
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

    const errors = await controller.listReportedErrors();

    expect(errors[0].id).toBe(ERROR_IDENTIFIER);
    expect(errors[0].message).toBe(ERROR_MESSAGE);
    expect(errors[0].occurredAt).toBe(ERROR_DATE);
    expect(errors[0].applicationVersion).toBe(APPLICATION_VERSION);
  });
});
