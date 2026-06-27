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
   * Condition: Precondition - valid
   */
  it(buildRequirementTitle("R64", "Unit", "Precondition", "accepts valid version configuration from form"), async () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });

    const savedConfiguration = await controller.saveVersionConfiguration(VERSION_CONFIGURATION);
    expect(savedConfiguration, "The form did not accept the valid version configuration.").toEqual(VERSION_CONFIGURATION);
  });

  /**
   * Requirement: R64
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R64", "Unit", "Precondition", "rejects invalid version configuration from form"), async () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    await expect(controller.saveVersionConfiguration(invalidConfiguration), "The form allowed saving an invalid version configuration.").rejects.toThrow();
  });

  /**
   * Requirement: R64
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R64", "Unit", "Invariant", "rejects versions that do not follow the required format"), () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.latestVersion, "The form did not keep the invalid version value for validation.").toBe(INVALID_VERSION);
    expect(state.canSave, "The form allows saving a version that does not follow the required version format.").toBe(false);
    expect(state.validationMessage, "The form does not show a validation message for an invalid version format.").not.toBeNull();
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
    expect(saveVersionConfiguration.calls, "The valid version configuration was not requested to be saved.").toEqual([VERSION_CONFIGURATION]);
    expect(savedConfiguration, "The valid version configuration was not saved correctly.").toEqual(VERSION_CONFIGURATION);
  });
});
