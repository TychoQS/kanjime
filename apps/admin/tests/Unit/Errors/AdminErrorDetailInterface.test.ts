import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminErrorDetailController } from "../../../src/Features/Errors/CreateAdminErrorDetailController";
import { createAdminErrorDetailDependencies } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";

const ERROR_IDENTIFIER = "error-report-1";
const ERROR_MESSAGE = "An unexpected error has occurred.";
const ERROR_DATE = "2026-05-27T00:00:00.000Z";
const APPLICATION_VERSION = "1.0.0";
const SENSITIVE_TEXT = "password";

describe("AdminErrorDetailInterface", () => {
  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R66", "Unit", "Precondition", "selects an existing reported error"), async () => {
    const controller = CreateAdminErrorDetailController(createAdminErrorDetailDependencies());

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.id).toBe(ERROR_IDENTIFIER);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R66", "Unit", "Invariant", "matches selected error and hides sensitive data"), async () => {
    const controller = CreateAdminErrorDetailController(createAdminErrorDetailDependencies());

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.id).toBe(ERROR_IDENTIFIER);
    expect(JSON.stringify(detail)).not.toContain(SENSITIVE_TEXT);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R66", "Unit", "Postcondition", "shows selected error detail with basic context"), async () => {
    const controller = CreateAdminErrorDetailController(createAdminErrorDetailDependencies());

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.message).toBe(ERROR_MESSAGE);
    expect(detail.occurredAt).toBe(ERROR_DATE);
    expect(detail.applicationVersion).toBe(APPLICATION_VERSION);
  });
});
