import type { AdminVersionFormProps } from "../../../src/Features/Versions/Contracts/AdminVersionFormProps";
import { CreateAdminVersionFormController } from "../../../src/Features/Versions/CreateAdminVersionFormController";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAsyncArgumentRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

describe("AdminVersionFormProps", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const INVALID_VERSION = "invalid-version";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
  const VALIDATION_MESSAGE = "Enter a valid semantic version.";

  const VERSION_CONFIGURATION: VersionConfiguration = {
    currentVersion: CURRENT_VERSION,
    latestVersion: LATEST_VERSION,
    minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
    updatedAt: CONFIGURATION_DATE
  };

  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R27", "Unit", "Precondition", "receives invalid version format in form"), () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.latestVersion, "The form did not receive the invalid version value.").toBe(INVALID_VERSION);
  });

  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R27", "Unit", "Invariant", "does not allow saving invalid version configuration"), () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);
    const props: AdminVersionFormProps = {
      state,
      onCurrentVersionChanged: () => undefined,
      onLatestVersionChanged: () => undefined,
      onMinimumSupportedVersionChanged: () => undefined,
      onSaveRequested: () => undefined
    };

    expect(props.state.canSave, "The form allows saving an invalid version configuration.").toBe(false);
  });

  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R27", "Unit", "Postcondition", "shows clear validation message for invalid format"), () => {
    const saveVersionConfiguration = createAsyncArgumentRecorder(VERSION_CONFIGURATION);
    const controller = CreateAdminVersionFormController({
      saveVersionConfiguration: saveVersionConfiguration.handler
    });
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.validationMessage, "The form does not show a clear validation message for the invalid version format.").toBe(VALIDATION_MESSAGE);
  });
});
