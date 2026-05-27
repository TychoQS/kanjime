import type { AdminErrorsProps } from "../../../src/Features/Errors/Contracts/AdminErrorsProps";
import { CreateAdminErrorsController } from "../../../src/Features/Errors/CreateAdminErrorsController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAdminErrorsDependencies } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";

const CONTEXT_SUMMARY = "Recognition screen";
const SENSITIVE_TEXT = "password";

describe("AdminErrorsProps", () => {
  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R28", "Unit", "Precondition", "renders error list with reported errors"), async () => {
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

    const errors = await controller.listReportedErrors();

    expect(errors.length).toBeGreaterThan(0);
  });

  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R28", "Unit", "Invariant", "lists errors without exposing sensitive user information"), async () => {
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

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
    const controller = CreateAdminErrorsController(createAdminErrorsDependencies());

    const errors = await controller.listReportedErrors();

    expect(errors[0].contextSummary).toBe(CONTEXT_SUMMARY);
  });
});
