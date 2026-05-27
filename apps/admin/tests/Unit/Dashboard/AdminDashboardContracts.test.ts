import { createAdminDashboardStub } from "../../Support/AdminContractStubs";
import { expect, it } from "vitest";

const CURRENT_VERSION = "1.0.0";
const REPORTED_ERROR_COUNT = 3;

/**
 * Requirement IDs: R62.
 * Pre/Inv/Post: The dashboard separates version and error information in a technical summary.
 */
it("loads a technical dashboard summary with separated version and error information", async () => {
  const controller = createAdminDashboardStub();

  const summary = await controller.loadTechnicalSummary();

  expect(summary.versionConfiguration.currentVersion).toBe(CURRENT_VERSION);
  expect(summary.reportedErrorCount).toBe(REPORTED_ERROR_COUNT);
});
