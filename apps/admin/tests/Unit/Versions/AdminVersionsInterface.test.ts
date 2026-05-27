import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminVersionsController } from "../../../src/Features/Versions/CreateAdminVersionsController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

describe("AdminVersionsInterface", () => {
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
   * Requirement: R63
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R63", "Unit", "Precondition", "receives available version configuration"), async () => {
    const readCurrentDate = createValueRecorder(CONFIGURATION_DATE);
    const controller = CreateAdminVersionsController({
      readCurrentDate: readCurrentDate.handler
    });

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);
    expect(summary).toBeDefined();
  });

  /**
   * Requirement: R63
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R63", "Unit", "Invariant", "does not mutate version configuration while reading"), async () => {
    const readCurrentDate = createValueRecorder(CONFIGURATION_DATE);
    const controller = CreateAdminVersionsController({
      readCurrentDate: readCurrentDate.handler
    });
    const sourceConfiguration = { ...VERSION_CONFIGURATION };
    await controller.getVersionSummary(sourceConfiguration);
    expect(sourceConfiguration, "The version summary reading mutated the source version configuration.").toEqual(VERSION_CONFIGURATION);
  });

  /**
   * Requirement: R63
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R63", "Unit", "Postcondition", "shows current latest and minimum supported versions"), async () => {
    const readCurrentDate = createValueRecorder(CONFIGURATION_DATE);
    const controller = CreateAdminVersionsController({
      readCurrentDate: readCurrentDate.handler
    });

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);

    expect(summary.currentVersion, "The version summary does not show the current version.").toBe(CURRENT_VERSION);
    expect(summary.latestVersion, "The version summary does not show the latest available version.").toBe(LATEST_VERSION);
    expect(summary.minimumSupportedVersion, "The version summary does not show the minimum supported version.").toBe(MINIMUM_SUPPORTED_VERSION);
    expect(summary.updatedAt, "The version summary does not show the configuration update date.").toBe(CONFIGURATION_DATE);
  });
});
