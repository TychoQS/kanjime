import type { VersionCheckResult, VersionConfiguration } from "@kanjime/shared";

import type { VersionCheckInterface } from "../Contracts/VersionCheckInterface";
import type { CreateVersionCheckControllerDependencies } from "../CreateVersionCheckController";

/**
 * Creates the version check view model.
 */
export function createVersionCheckViewModel(
  dependencies: CreateVersionCheckControllerDependencies
): VersionCheckInterface {
  const recoverWithLastKnownConfiguration = async (): Promise<VersionCheckResult> => {
    try {
      const configuration = await dependencies.loadLastKnownVersionConfiguration();
      return createVersionResult(configuration, isDefinedVersion(configuration.currentVersion), true);
    } catch {
      return createVersionResult(null, false, true);
    }
  };

  return {
    async checkCurrentVersion(currentVersion: string | null): Promise<VersionCheckResult> {
      if (!isDefinedVersion(currentVersion)) {
        return createVersionResult(null, false, false);
      }

      try {
        const configuration = await dependencies.loadVersionConfiguration();
        await dependencies.saveVersionConfiguration?.(configuration);
        return createVersionResult(configuration, true, false);
      } catch {
        return recoverWithLastKnownConfiguration();
      }
    },
    recoverWithLastKnownConfiguration
  };
}

function createVersionResult(
  configuration: VersionConfiguration | null,
  isCurrentVersionDefined: boolean,
  usedLastKnownConfiguration: boolean
): VersionCheckResult {
  if (configuration === null || !isCurrentVersionDefined) {
    return {
      configuration,
      isCurrentVersionDefined,
      isUpdateAvailable: false,
      isSupported: true,
      usedLastKnownConfiguration
    };
  }

  return {
    configuration,
    isCurrentVersionDefined,
    isUpdateAvailable: compareVersions(configuration.currentVersion, configuration.latestVersion) < 0,
    isSupported: compareVersions(configuration.currentVersion, configuration.minimumSupportedVersion) >= 0,
    usedLastKnownConfiguration
  };
}

function isDefinedVersion(version: string | null): version is string {
  return typeof version === "string" && version.trim().length > 0;
}

function compareVersions(left: string, right: string): number {
  const leftSegments = left.split(".");
  const rightSegments = right.split(".");
  const segmentCount = Math.max(leftSegments.length, rightSegments.length);

  for (let index = 0; index < segmentCount; index += 1) {
    const leftSegment = leftSegments[index] ?? "0";
    const rightSegment = rightSegments[index] ?? "0";
    const leftNumber = Number(leftSegment);
    const rightNumber = Number(rightSegment);

    if (Number.isInteger(leftNumber) && Number.isInteger(rightNumber)) {
      if (leftNumber !== rightNumber) {
        return leftNumber > rightNumber ? 1 : -1;
      }
    } else if (leftSegment !== rightSegment) {
      return leftSegment > rightSegment ? 1 : -1;
    }
  }

  return 0;
}
