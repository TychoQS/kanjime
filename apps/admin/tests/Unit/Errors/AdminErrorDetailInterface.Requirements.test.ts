import { describe, expect, it } from "vitest";

import { CreateAdminErrorDetailController } from "../../../src/Features/Errors/CreateAdminErrorDetailController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { TEST_ADMIN_ERROR_DETAIL } from "../../Support/TestData";

describe("AdminErrorDetailInterface requirements", () => {
  const detailController = CreateAdminErrorDetailController({
    getErrorDetail: async () => TEST_ADMIN_ERROR_DETAIL
  });

  /**
   * Requirement R72 - Precondition (valid):
   * an existing error detail should accept one of the allowed administration statuses.
   */
  it(buildRequirementTitle("R72", "Unit", "Precondition", "existing error details accept allowed statuses"), async () => {
    await expect(
      detailController.updateErrorStatus(TEST_ADMIN_ERROR_DETAIL.id, "IN_PROGRESS"),
      "R72 valid precondition should accept an allowed status for an existing error detail."
    ).resolves.toEqual(expect.objectContaining({
      status: "IN_PROGRESS"
    }));
  });

  /**
   * Requirement R72 - Precondition (invalid):
   * a non-assignable status should be rejected by the detail contract.
   */
  it(buildRequirementTitle("R72", "Unit", "Precondition", "non-assignable statuses are rejected"), async () => {
    await expect(
      detailController.updateErrorStatus(TEST_ADMIN_ERROR_DETAIL.id, "all" as unknown as "OPEN"),
      "R72 invalid precondition should reject values that are not real assignable statuses."
    ).rejects.toThrow("allowed");
  });

  /**
   * Requirement R72 - Invariant:
   * the selected status should always belong to the allowed administration set.
   */
  it(buildRequirementTitle("R72", "Unit", "Invariant", "updated statuses stay inside the allowed administration set"), async () => {
    const updatedDetail = await detailController.updateErrorStatus(TEST_ADMIN_ERROR_DETAIL.id, "RESOLVED");

    expect(
      ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "DISCARDED"].includes(updatedDetail.status ?? ""),
      "R72 invariant should keep updated error statuses inside the allowed administration set."
    ).toBe(true);
  });

  /**
   * Requirement R72 - Postcondition:
   * the selected error detail should expose the new status after the update.
   */
  it(buildRequirementTitle("R72", "Unit", "Postcondition", "the selected error detail exposes the new status"), async () => {
    const updatedDetail = await detailController.updateErrorStatus(TEST_ADMIN_ERROR_DETAIL.id, "CLOSED");

    expect(
      updatedDetail.status,
      "R72 postcondition should expose the new administrator-selected status on the returned error detail."
    ).toBe("CLOSED");
  });
});
