import { CreateAdminDashboardController } from "../../../src/Features/Dashboard/CreateAdminDashboardController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { describe, expect, it } from "vitest";
import type { AdminTechnicalSummary, VersionConfiguration } from "@kanjime/shared";

describe("AdminDashboardInterface", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
  const REPORTED_ERROR_COUNT = 3;
  const VERSION_CONFIGURATION: VersionConfiguration = {
    currentVersion: CURRENT_VERSION,
    latestVersion: LATEST_VERSION,
    minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
    updatedAt: CONFIGURATION_DATE
  };

  const TECHNICAL_SUMMARY: AdminTechnicalSummary = {
    versionConfiguration: VERSION_CONFIGURATION,
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

    expect(loadTechnicalSummary.calls, "The dashboard did not request the technical summary exactly once.").toHaveLength(1);
    expect(summary, "The dashboard did not load a technical summary when opened.").toBeDefined();
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

    expect(summary.versionConfiguration, "The dashboard does not keep version information in a separated section.").toEqual(TECHNICAL_SUMMARY.versionConfiguration);
    expect(summary.reportedErrorCount, "The dashboard does not expose the reported error count in the error section.").toBe(REPORTED_ERROR_COUNT);
    expect(summary.latestReportedErrorAt, "The dashboard does not expose the latest reported error date in the error section.").toBe(CONFIGURATION_DATE);
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

    expect(summary.latestReportedErrorAt, "The dashboard technical summary does not include the latest reported error date.").not.toBeUndefined();
    expect(summary, "The dashboard does not expose the complete basic technical application summary.").toEqual(TECHNICAL_SUMMARY);
  });
});
