import type { AdminVersionsProps } from "../../../src/Features/Versions/Contracts/AdminVersionsProps";
import { CreateAdminVersionsController } from "../../../src/Features/Versions/CreateAdminVersionsController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAdminVersionsDependencies } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

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

describe("AdminVersionsProps", () => {
  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R26", "Unit", "Precondition", "renders versions screen with valid configuration"), async () => {
    const controller = CreateAdminVersionsController(createAdminVersionsDependencies());

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);

    expect(summary.updatedAt).toBe(CONFIGURATION_DATE);
  });

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R26", "Unit", "Invariant", "differentiates version values and configuration date"), async () => {
    const controller = CreateAdminVersionsController(createAdminVersionsDependencies());

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);
    const props: AdminVersionsProps = {
      summary,
      isLoading: false,
      errorMessage: null
    };

    expect(props.summary.currentVersion).toBe(CURRENT_VERSION);
    expect(props.summary.latestVersion).toBe(LATEST_VERSION);
    expect(props.summary.updatedAt).toBe(CONFIGURATION_DATE);
  });

  /**
   * Requirement: R26
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R26", "Unit", "Postcondition", "presents version state clearly for administrator"), async () => {
    const controller = CreateAdminVersionsController(createAdminVersionsDependencies());

    const summary = await controller.getVersionSummary(VERSION_CONFIGURATION);

    expect(summary.minimumSupportedVersion).toBe(MINIMUM_SUPPORTED_VERSION);
  });
});
