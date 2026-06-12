import { describe, expect, it } from "vitest";

import { CreateAdminErrorsController } from "../../../src/Features/Errors/CreateAdminErrorsController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { TEST_ADMIN_ERROR_SUMMARIES } from "../../Support/TestData";

describe("AdminErrorsInterface requirements", () => {
  const errorsController = CreateAdminErrorsController({
    listReportedErrors: async () => TEST_ADMIN_ERROR_SUMMARIES
  });

  /**
   * Requirement R73 - Precondition (valid):
   * error reports with at least two statuses should support filtering by a concrete status.
   */
  it(buildRequirementTitle("R73", "Unit", "Precondition", "error reports with multiple statuses support filtering"), async () => {
    await expect(
      errorsController.filterReportedErrors("OPEN"),
      "R73 valid precondition should filter a reported-error list that contains multiple statuses."
    ).resolves.toEqual([TEST_ADMIN_ERROR_SUMMARIES[0]]);
  });

  /**
   * Requirement R73 - Precondition (invalid):
   * the visual filter "all" should not be treated as a real assignable report status.
   */
  it(buildRequirementTitle("R73", "Unit", "Precondition", "the visual filter all is not a real report status"), async () => {
    const filteredErrors = await errorsController.filterReportedErrors("all");

    expect(
      filteredErrors.every(error => String(error.status) !== "all"),
      "R73 invalid precondition should keep the visual filter \"all\" outside the assignable report statuses."
    ).toBe(true);
  });

  /**
   * Requirement R73 - Invariant:
   * the filter "all" should remain a visualization-only option.
   */
  it(buildRequirementTitle("R73", "Unit", "Invariant", "the all option remains a visualization-only filter"), async () => {
    const filteredErrors = await errorsController.filterReportedErrors("all");

    expect(
      filteredErrors.map(error => error.status),
      "R73 invariant should return only real report statuses after applying the \"all\" visual filter."
    ).toEqual(["OPEN", "RESOLVED"]);
  });

  /**
   * Requirement R73 - Postcondition:
   * the visible list should match the selected status filter.
   */
  it(buildRequirementTitle("R73", "Unit", "Postcondition", "the visible list matches the selected filter"), async () => {
    const filteredErrors = await errorsController.filterReportedErrors("RESOLVED");

    expect(
      filteredErrors,
      "R73 postcondition should return only the reported errors matching the selected status filter."
    ).toEqual([TEST_ADMIN_ERROR_SUMMARIES[1]]);
  });
});
