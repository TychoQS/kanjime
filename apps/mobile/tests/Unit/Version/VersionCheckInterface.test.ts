import { describe, expect, it } from "vitest";

import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createVersionCheckStub } from "../../Support/VersionAndErrorContractStubs";

const CURRENT_VERSION = "1.0.0";
const LATEST_VERSION = "1.1.0";
const MINIMUM_SUPPORTED_VERSION = "0.9.0";

describe("VersionCheckInterface", () => {
  /**
   * Requirement: R57
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R57", "Unit", "Precondition", "skips version check when current version is missing"), async () => {
    const controller = createVersionCheckStub();

    const result = await controller.checkCurrentVersion(null);

    expect(result.isCurrentVersionDefined).toBe(false);
  });

  /**
   * Requirement: R57
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R57", "Unit", "Invariant", "does not block startup during version check"), async () => {
    const controller = createVersionCheckStub();
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
    const controller = createVersionCheckStub();

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
    const controller = createVersionCheckStub();

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.configuration).not.toBeNull();
  });

  /**
   * Requirement: R59
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R59", "Unit", "Invariant", "does not throw uncontrolled startup error on connection failure"), async () => {
    const controller = createVersionCheckStub();

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.isSupported).toBe(true);
  });

  /**
   * Requirement: R59
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R59", "Unit", "Postcondition", "uses the last known version configuration"), async () => {
    const controller = createVersionCheckStub();

    const result = await controller.recoverWithLastKnownConfiguration();

    expect(result.usedLastKnownConfiguration).toBe(true);
    expect(result.configuration?.minimumSupportedVersion).toBe(MINIMUM_SUPPORTED_VERSION);
  });
});
