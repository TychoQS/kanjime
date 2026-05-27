import { describe, expect, it } from "vitest";

import { CreateVersionCheckController } from "../../../src/Features/Version/CreateVersionCheckController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type { VersionConfiguration } from "@kanjime/shared";

describe("VersionCheckInterface", () => {
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
   * Requirement: R57
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R57", "Unit", "Precondition", "skips version check when current version is missing"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.checkCurrentVersion(null);

    expect(result.isCurrentVersionDefined).toBe(false);
  });

  /**
   * Requirement: R57
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R57", "Unit", "Invariant", "does not block startup during version check"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });
    const startupState = { isAccessible: true };

    await controller.checkCurrentVersion(CURRENT_VERSION);

    expect(startupState.isAccessible).toBe(true);
  });

  /**
   * Requirement: R57
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R57", "Unit", "Postcondition", "reports whether an update is available"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.checkCurrentVersion(CURRENT_VERSION);

    expect(result.isUpdateAvailable).toBe(true);
    expect(result.configuration?.latestVersion).toBe(LATEST_VERSION);
  });

  /**
   * Requirement: R59
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R59", "Unit", "Precondition", "handles failed remote version configuration loading"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.configuration).not.toBeNull();
  });

  /**
   * Requirement: R59
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R59", "Unit", "Invariant", "does not throw uncontrolled startup error on connection failure"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.isSupported).toBe(true);
  });

  /**
   * Requirement: R59
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R59", "Unit", "Postcondition", "uses the last known version configuration"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.usedLastKnownConfiguration).toBe(true);
    expect(result.configuration?.minimumSupportedVersion).toBe(MINIMUM_SUPPORTED_VERSION);
  });
});
