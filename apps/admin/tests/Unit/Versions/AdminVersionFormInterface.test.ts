import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminVersionFormController } from "../../../src/Features/Versions/CreateAdminVersionFormController";
import { createAsyncArgumentRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

describe("AdminVersionFormInterface", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const INVALID_VERSION = "invalid-version";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";

  const VERSION_CONFIGURATION: VersionConfiguration = {
    currentVersion: CURRENT_VERSION,
    latestVersion: LATEST_VERSION,
    minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
    updatedAt: CONFIGURATION_DATE
  };

  /**
   * Requirement: R64
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R64", "Unit", "Precondition", "accepts valid version configuration from form"), async () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });

    const savedConfiguration = await controller.saveVersionConfiguration(VERSION_CONFIGURATION);

    expect(savedConfiguration.currentVersion).toBe(CURRENT_VERSION);
  });

  /**
   * Requirement: R64
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R64", "Unit", "Invariant", "rejects invalid version format before saving"), () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.canSave).toBe(false);
  });

  /**
   * Requirement: R64
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R64", "Unit", "Postcondition", "saves valid version configuration for application use"), async () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });

    const savedConfiguration = await controller.saveVersionConfiguration(VERSION_CONFIGURATION);

    expect(savedConfiguration).toEqual(VERSION_CONFIGURATION);
  });
});
