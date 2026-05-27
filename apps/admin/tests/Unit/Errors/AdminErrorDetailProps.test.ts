import type { AdminErrorDetailProps } from "../../../src/Features/Errors/Contracts/AdminErrorDetailProps";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAdminErrorDetailStub } from "../../Support/AdminContractStubs";
import { describe, expect, it } from "vitest";

const ERROR_IDENTIFIER = "error-report-1";
const ERROR_MESSAGE = "An unexpected error has occurred.";
const ERROR_DATE = "2026-05-27T00:00:00.000Z";
const APPLICATION_VERSION = "1.0.0";
const SENSITIVE_TEXT = "password";

describe("AdminErrorDetailProps", () => {
  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R66", "Unit", "Precondition", "renders selected reported error detail"), async () => {
    const controller = createAdminErrorDetailStub();

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.id).toBe(ERROR_IDENTIFIER);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R66", "Unit", "Invariant", "hides sensitive data in selected error detail props"), async () => {
    const controller = createAdminErrorDetailStub();

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);
    const props: AdminErrorDetailProps = {
      detail,
      isLoading: false,
      errorMessage: null,
      onBackRequested: () => undefined
    };

    expect(JSON.stringify(props.detail)).not.toContain(SENSITIVE_TEXT);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R66", "Unit", "Postcondition", "shows selected error message date version and context"), async () => {
    const controller = createAdminErrorDetailStub();

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);
    const props: AdminErrorDetailProps = {
      detail,
      isLoading: false,
      errorMessage: null,
      onBackRequested: () => undefined
    };

    expect(props.detail?.message).toBe(ERROR_MESSAGE);
    expect(props.detail?.occurredAt).toBe(ERROR_DATE);
    expect(props.detail?.applicationVersion).toBe(APPLICATION_VERSION);
  });
});
