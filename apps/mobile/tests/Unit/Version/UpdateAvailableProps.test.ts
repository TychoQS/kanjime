import type { UpdateAvailableProps } from "../../../src/Features/Version/Contracts/UpdateAvailableProps";
import { describe, expect, it } from "vitest";

import { CreateUpdateAvailableController } from "../../../src/Features/Version/CreateUpdateAvailableController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type { VersionCheckResult } from "@kanjime/shared";

describe("UpdateAvailableProps", () => {
  const CURRENT_VERSION = "1.0.0";
  const LATEST_VERSION = "1.1.0";
  const MINIMUM_SUPPORTED_VERSION = "0.9.0";
  const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
  const UPDATE_MESSAGE = "A new version is available. You can continue using the application.";

  const VERSION_CHECK_RESULT: VersionCheckResult = {
    configuration: {
      currentVersion: CURRENT_VERSION,
      latestVersion: LATEST_VERSION,
      minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
      updatedAt: CONFIGURATION_DATE
    },
    isCurrentVersionDefined: true,
    isUpdateAvailable: true,
    isSupported: true,
    usedLastKnownConfiguration: false
  };

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R24", "Unit", "Precondition", "renders update notice when newer version exists"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);

    expect(VERSION_CHECK_RESULT.isUpdateAvailable, "The test scenario does not define an available update.").toBe(true);
    expect(VERSION_CHECK_RESULT.configuration?.currentVersion, "The running version is not present in the update scenario.").toBe(CURRENT_VERSION);
    expect(VERSION_CHECK_RESULT.configuration?.latestVersion, "The latest available version is not present in the update scenario.").toBe(LATEST_VERSION);
    expect(VERSION_CHECK_RESULT.configuration?.currentVersion, "The running version should be older than the latest available version.").not.toBe(VERSION_CHECK_RESULT.configuration?.latestVersion);
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R24", "Unit", "Postcondition", "communicates update availability clearly"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);
    expect(state.isVisible, "The update notice is not visible when an update is available.").toBe(true);
    expect(state.message, "The update notice does not communicate the expected update message.").toBe(UPDATE_MESSAGE);
    expect(state.canContinueUsingApplication, "The update notice does not allow the user to continue using the application.").toBe(true);
  });
});
