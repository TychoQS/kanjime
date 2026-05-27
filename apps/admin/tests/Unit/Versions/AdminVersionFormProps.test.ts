import type { AdminVersionFormProps } from "../../../src/Features/Versions/Contracts/AdminVersionFormProps";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createAdminVersionFormStub } from "../../Support/AdminContractStubs";
import { describe, expect, it } from "vitest";
import type { VersionConfiguration } from "@kanjime/shared";

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

describe("AdminVersionFormProps", () => {
  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R27", "Unit", "Precondition", "receives invalid version format in form"), () => {
    const controller = createAdminVersionFormStub();
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.latestVersion).toBe(INVALID_VERSION);
  });

  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R27", "Unit", "Invariant", "does not allow saving invalid version configuration"), () => {
    const controller = createAdminVersionFormStub();
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

    expect(props.state.canSave).toBe(false);
  });

  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R27", "Unit", "Postcondition", "shows clear validation message for invalid format"), () => {
    const controller = createAdminVersionFormStub();
    const invalidConfiguration: VersionConfiguration = {
      ...VERSION_CONFIGURATION,
      latestVersion: INVALID_VERSION
    };

    const state = controller.validateVersionConfiguration(invalidConfiguration);

    expect(state.validationMessage).toBe(VALIDATION_MESSAGE);
  });
});
