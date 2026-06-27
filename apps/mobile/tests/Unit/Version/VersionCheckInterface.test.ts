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

    expect(loadVersionConfiguration.calls, "The remote version configuration should not be loaded when the current version is missing.").toHaveLength(0);
    expect(result.isCurrentVersionDefined, "The version check did not detect that the current version is missing.").toBe(false);
  });

  /**
   * Requirement: R57
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R57", "Unit", "Precondition", "runs version check when current version is defined"), async () => {
    const loadVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const loadLastKnownVersionConfiguration = createAsyncValueRecorder(VERSION_CONFIGURATION);
    const controller = CreateVersionCheckController({
      loadVersionConfiguration: loadVersionConfiguration.handler,
      loadLastKnownVersionConfiguration: loadLastKnownVersionConfiguration.handler
    });

    const result = await controller.checkCurrentVersion(CURRENT_VERSION);

    expect(loadVersionConfiguration.calls, "The remote version configuration was not loaded when the current version was defined.").toHaveLength(1);
    expect(result.isCurrentVersionDefined, "The version check did not detect the defined current version.").toBe(true);
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

    expect(result.isUpdateAvailable, "The version check did not report the available update.").toBe(true);
    expect(result.configuration?.currentVersion, "The version check result does not include the current version.").toBe(CURRENT_VERSION);
    expect(result.configuration?.latestVersion, "The version check result does not include the latest available version.").toBe(LATEST_VERSION);
    expect(result.configuration?.minimumSupportedVersion, "The version check result does not include the minimum supported version.").toBe(MINIMUM_SUPPORTED_VERSION);
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

    expect(loadLastKnownVersionConfiguration.calls, "The last known version configuration was not requested after the remote version configuration failed.").toHaveLength(1);
    expect(result.configuration, "The recovery did not provide any last known version configuration.").not.toBeNull();
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

    expect(result.usedLastKnownConfiguration, "The recovery path did not use the last known version configuration.").toBe(true);
    expect(result.isSupported, "The connection failure left the application in an unsupported startup state.").toBe(true);
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

    expect(result.usedLastKnownConfiguration, "The version check did not mark that the last known configuration was used.").toBe(true);
    expect(result.configuration, "The last known version configuration was not used as the recovery result.").toEqual(VERSION_CONFIGURATION);
  });
});
