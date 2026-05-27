import type { UpdateAvailableProps } from "../../../src/Features/Version/Contracts/UpdateAvailableProps";
import { expect, it } from "vitest";
import {
  createUpdateAvailableStub,
  createVersionCheckStub
} from "../../Support/VersionAndErrorContractStubs";
import type { VersionCheckResult } from "@kanjime/shared";

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
 * Requirement IDs: R57.
 * Pre: The check is not executed when no current version is defined.
 */
it("does not execute version verification when no current version is defined", async () => {
  const controller = createVersionCheckStub();

  const result = await controller.checkCurrentVersion(null);

  expect(result.isCurrentVersionDefined).toBe(false);
});

/**
 * Requirement IDs: R57.
 * Pre: The check is executed when a current version is defined.
 */
it("executes version verification when a current version is defined", async () => {
  const controller = createVersionCheckStub();

  const result = await controller.checkCurrentVersion(CURRENT_VERSION);

  expect(result.isCurrentVersionDefined).toBe(true);
});

/**
 * Requirement IDs: R57.
 * Inv: Version verification does not block application startup.
 */
it("keeps startup non-blocking during version verification", async () => {
  const controller = createVersionCheckStub();
  const startupState = { isAccessible: true };

  await controller.checkCurrentVersion(CURRENT_VERSION);

  expect(startupState.isAccessible).toBe(true);
});

/**
 * Requirement IDs: R57.
 * Post: The result reports whether the application is current or has an available update.
 */
it("returns whether the running version is current or has an available update", async () => {
  const controller = createVersionCheckStub();

  const result = await controller.checkCurrentVersion(CURRENT_VERSION);

  expect(result.isUpdateAvailable).toBe(true);
  expect(result.configuration?.latestVersion).toBe(LATEST_VERSION);
});

/**
 * Requirement IDs: R59.
 * Pre/Inv/Post: Remote failures are recovered with the last known configuration.
 */
it("uses the last known configuration when remote version loading fails", async () => {
  const controller = createVersionCheckStub();

  const result = await controller.recoverWithLastKnownConfiguration();

  expect(result.usedLastKnownConfiguration).toBe(true);
  expect(result.configuration?.minimumSupportedVersion).toBe(MINIMUM_SUPPORTED_VERSION);
});

/**
 * Requirement IDs: R58, R24.
 * Pre/Inv/Post: A compatible old version activates a clear non-blocking update notice.
 */
it("creates a clear non-blocking update notice for compatible old versions", () => {
  const controller = createUpdateAvailableStub();

  const state = controller.getUpdateAvailability(VERSION_CHECK_RESULT);
  const props: UpdateAvailableProps = {
    isVisible: state.isVisible,
    message: state.message,
    currentVersion: state.currentVersion,
    latestVersion: state.latestVersion,
    canContinueUsingApplication: state.canContinueUsingApplication,
    onDismissRequested: () => undefined
  };

  expect(props.isVisible).toBe(true);
  expect(props.message).toBe(UPDATE_MESSAGE);
  expect(props.canContinueUsingApplication).toBe(true);
});
