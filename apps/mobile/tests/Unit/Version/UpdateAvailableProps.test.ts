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

    expect(state.isVisible).toBe(true);
  });

  /**
   * Requirement: R24
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R24", "Unit", "Invariant", "shows non-technical non-blocking update message"), () => {
    const createUpdateMessage = createValueRecorder(UPDATE_MESSAGE);
    const controller = CreateUpdateAvailableController({
      createUpdateMessage: createUpdateMessage.handler
    });

    const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);
    const props: UpdateAvailableProps = {
      isVisible: state.isVisible,
      message: state.message,
      currentVersion: state.currentVersion,
      latestVersion: state.latestVersion,
      canContinueUsingApplication: state.canContinueUsingApplication,
      onDismissRequested: () => undefined
    };

    expect(props.message).not.toContain("remote configuration");
    expect(props.canContinueUsingApplication).toBe(true);
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

    expect(state.message).toBe(UPDATE_MESSAGE);
  });
});
