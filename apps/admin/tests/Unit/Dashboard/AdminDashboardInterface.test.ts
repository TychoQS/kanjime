import { CreateAdminDashboardController } from "../../../src/Features/Dashboard/CreateAdminDashboardController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { describe, expect, it } from "vitest";
import type { AdminTechnicalSummary } from "@kanjime/shared";

describe("AdminDashboardInterface", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
  const REPORTED_ERROR_COUNT = 3;

  const TECHNICAL_SUMMARY: AdminTechnicalSummary = {
    versionConfiguration: {
      currentVersion: CURRENT_VERSION,
      latestVersion: LATEST_VERSION,
      minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
      updatedAt: CONFIGURATION_DATE
    },
    reportedErrorCount: REPORTED_ERROR_COUNT,
    latestReportedErrorAt: CONFIGURATION_DATE
  };

  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R62", "Unit", "Precondition", "loads dashboard when administrator opens panel"), async () => {
    const loadTechnicalSummary = createAsyncValueRecorder(TECHNICAL_SUMMARY);
    const controller = CreateAdminDashboardController({
      loadTechnicalSummary: loadTechnicalSummary.handler
    });

    const summary = await controller.loadTechnicalSummary();

    expect(loadTechnicalSummary.calls).toHaveLength(1);
    expect(summary).toBeDefined();
  });

  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R62", "Unit", "Invariant", "separates version and error dashboard sections"), async () => {
    const loadTechnicalSummary = createAsyncValueRecorder(TECHNICAL_SUMMARY);
    const controller = CreateAdminDashboardController({
      loadTechnicalSummary: loadTechnicalSummary.handler
    });

    const summary = await controller.loadTechnicalSummary();

    expect(summary.versionConfiguration).toEqual(TECHNICAL_SUMMARY.versionConfiguration);
    expect(summary.reportedErrorCount).toBe(REPORTED_ERROR_COUNT);
    expect(summary.latestReportedErrorAt).toBe(CONFIGURATION_DATE);
  });

  /**
   * Requirement: R62
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R62", "Unit", "Postcondition", "shows basic technical application summary"), async () => {
    const loadTechnicalSummary = createAsyncValueRecorder(TECHNICAL_SUMMARY);
    const controller = CreateAdminDashboardController({
      loadTechnicalSummary: loadTechnicalSummary.handler
    });

    const summary = await controller.loadTechnicalSummary();

    expect(summary.latestReportedErrorAt).not.toBeUndefined();
    expect(summary).toEqual(TECHNICAL_SUMMARY);
  });
});
