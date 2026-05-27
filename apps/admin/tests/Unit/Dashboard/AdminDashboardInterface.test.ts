import { CreateAdminDashboardController } from "../../../src/Features/Dashboard/CreateAdminDashboardController";
import { createAdminDashboardDependencies } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { describe, expect, it } from "vitest";

const CURRENT_VERSION = "1.0.0";
const REPORTED_ERROR_COUNT = 3;

describe("AdminDashboardInterface", () => {
  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R62", "Unit", "Precondition", "loads dashboard when administrator opens panel"), async () => {
    const controller = CreateAdminDashboardController(createAdminDashboardDependencies());

    const summary = await controller.loadTechnicalSummary();

    expect(summary).toBeDefined();
  });

  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R62", "Unit", "Invariant", "separates version and error dashboard sections"), async () => {
    const controller = CreateAdminDashboardController(createAdminDashboardDependencies());

    const summary = await controller.loadTechnicalSummary();

    expect(summary.versionConfiguration.currentVersion).toBe(CURRENT_VERSION);
    expect(summary.reportedErrorCount).toBe(REPORTED_ERROR_COUNT);
  });

  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R62", "Unit", "Postcondition", "shows basic technical application summary"), async () => {
    const controller = CreateAdminDashboardController(createAdminDashboardDependencies());

    const summary = await controller.loadTechnicalSummary();

    expect(summary.latestReportedErrorAt).not.toBeUndefined();
  });
});
