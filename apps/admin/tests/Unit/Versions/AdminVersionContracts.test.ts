import type { AdminVersionFormProps } from "../../../src/Features/Versions/Contracts/AdminVersionFormProps";
import type { AdminVersionsProps } from "../../../src/Features/Versions/Contracts/AdminVersionsProps";
import { expect, it } from "vitest";
import {
  createAdminVersionFormStub,
  createAdminVersionsStub
} from "../../Support/AdminContractStubs";
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

/**
 * Requirement IDs: R63, R26.
 * Pre/Inv/Post: The admin version screen shows the configured versions without mutating them.
 */
it("shows version configuration in clearly labeled administration fields", async () => {
  const controller = createAdminVersionsStub();

  const sourceConfiguration = { ...VERSION_CONFIGURATION };
  const summary = await controller.getVersionSummary(sourceConfiguration);
  const props: AdminVersionsProps = {
    summary,
    isLoading: false,
    errorMessage: null
  };

  expect(sourceConfiguration).toEqual(VERSION_CONFIGURATION);
  expect(props.summary.currentVersion).toBe(CURRENT_VERSION);
  expect(props.summary.latestVersion).toBe(LATEST_VERSION);
  expect(props.summary.minimumSupportedVersion).toBe(MINIMUM_SUPPORTED_VERSION);
  expect(props.summary.updatedAt).toBe(CONFIGURATION_DATE);
});

/**
 * Requirement IDs: R64, R27.
 * Pre/Inv/Post: Invalid versions are rejected with a clear validation message.
 */
it("rejects invalid version form values with a clear validation message", () => {
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
  expect(props.state.validationMessage).toBe(VALIDATION_MESSAGE);
});

/**
 * Requirement IDs: R64.
 * Post: A valid configuration is saved and returned for application use.
 */
it("saves valid version configuration for application use", async () => {
  const controller = createAdminVersionFormStub();

  const savedConfiguration = await controller.saveVersionConfiguration(VERSION_CONFIGURATION);

  expect(savedConfiguration).toEqual(VERSION_CONFIGURATION);
});
