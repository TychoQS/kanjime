import { describe, expect, it } from "vitest";

import { CreateUpdateAvailableController } from "../../../src/Features/Version/CreateUpdateAvailableController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type { VersionCheckResult, VersionConfiguration } from "@kanjime/shared";

describe("UpdateAvailableInterface", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
  const UPDATE_MESSAGE = "A new version is available. You can continue using the application.";
  const VERSION_CONFIGURATION: VersionConfiguration = {
    currentVersion: CURRENT_VERSION,
    latestVersion: LATEST_VERSION,
    minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
    updatedAt: CONFIGURATION_DATE
  };

  const VERSION_CHECK_RESULT: VersionCheckResult = {
    configuration: VERSION_CONFIGURATION,
    isCurrentVersionDefined: true,
    isUpdateAvailable: true,
    isSupported: true,
    usedLastKnownConfiguration: false
  };

  /**
   * Requirement: R58
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R58", "Unit", "Precondition", "receives an older compatible running version"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);

    expect(state.currentVersion, "The update state does not preserve the running application version.").toBe(CURRENT_VERSION);
    expect(state.latestVersion, "The update state does not preserve the latest available version.").toBe(LATEST_VERSION);
    expect(state.currentVersion, "The running version should be older than the latest available version.").not.toBe(state.latestVersion);
  });

  /**
   * Requirement: R58
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R58", "Unit", "Invariant", "keeps the application usable when update exists"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);

    expect(state.canContinueUsingApplication, "The update notice blocks application usage even though the running version is still supported.").toBe(true);
  });

  /**
   * Requirement: R58
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R58", "Unit", "Postcondition", "activates an informational update notice"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);

    expect(createUpdateMessage.calls, "The update notice message was not requested.").toHaveLength(1);
    expect(state.isVisible, "The update availability notice is not visible.").toBe(true);
    expect(state.message, "The update availability notice does not show the expected informational message.").toBe(UPDATE_MESSAGE);
  });

  /**
   * Requirement: R58
   * Type: Regression
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R58", "Regression", "Postcondition", "shows update notification even if the running version is not supported"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const unsupportedResult: VersionCheckResult = {
      ...VERSION_CHECK_RESULT,
      isSupported: false
    };

    const state = controller.getUpdateAvailability(unsupportedResult);

    expect(state.isVisible, "The update availability notice should be visible even if the running version is not supported.").toBe(true);
  });
});
