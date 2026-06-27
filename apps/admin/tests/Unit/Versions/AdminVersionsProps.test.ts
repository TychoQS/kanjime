import type { AdminVersionsProps } from "../../../src/Features/Versions/Contracts/AdminVersionsProps";
import { CreateAdminVersionsController } from "../../../src/Features/Versions/CreateAdminVersionsController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

describe("AdminVersionsProps", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";

  const VERSION_CONFIGURATION: VersionConfiguration = {
    currentVersion: CURRENT_VERSION,
    latestVersion: LATEST_VERSION,
    minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
    updatedAt: CONFIGURATION_DATE
  };

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R26", "Unit", "Precondition", "renders versions screen with valid configuration"), async () => {
    const readCurrentDate = createValueRecorder(CONFIGURATION_DATE);
    const controller = CreateAdminVersionsController({
      readCurrentDate: readCurrentDate.handler
    });

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);

    expect(summary, "The versions screen summary was not created from the valid version configuration.").toBeDefined();
    expect(summary.updatedAt, "The versions screen does not receive the configuration update date.").toBe(CONFIGURATION_DATE);
  });

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R26", "Unit", "Postcondition", "presents version state clearly for administrator"), async () => {
    const readCurrentDate = createValueRecorder(CONFIGURATION_DATE);
    const controller = CreateAdminVersionsController({
      readCurrentDate: readCurrentDate.handler
    });

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);

    expect(summary.currentVersion, "The versions screen does not show the current version.").toBe(CURRENT_VERSION);
    expect(summary.latestVersion, "The versions screen does not show the latest available version.").toBe(LATEST_VERSION);
    expect(summary.minimumSupportedVersion, "The versions screen does not show the minimum supported version.").toBe(MINIMUM_SUPPORTED_VERSION);
    expect(summary.updatedAt, "The versions screen does not show the configuration update date.").toBe(CONFIGURATION_DATE);
  });
});
