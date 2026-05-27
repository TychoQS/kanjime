import { describe, expect, it } from "vitest";

import { CreateUpdateAvailableController } from "../../../src/Features/Version/CreateUpdateAvailableController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type { VersionCheckResult } from "@kanjime/shared";

describe("UpdateAvailableInterface", () => {
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

    expect(state.currentVersion).toBe(CURRENT_VERSION);
    expect(state.latestVersion).toBe(LATEST_VERSION);
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

    expect(state.canContinueUsingApplication).toBe(true);
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

    expect(state.isVisible).toBe(true);
  });
});
