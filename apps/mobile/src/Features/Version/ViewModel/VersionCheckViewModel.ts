import type { VersionCheckResult } from "@kanjime/shared";

import type { VersionCheckInterface } from "../Contracts/VersionCheckInterface";
import type { CreateVersionCheckControllerDependencies } from "../CreateVersionCheckController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the version check view model.
 */
export function createVersionCheckViewModel(
  dependencies: CreateVersionCheckControllerDependencies
): VersionCheckInterface {
  void dependencies;

  return {
    async checkCurrentVersion(_currentVersion: string | null): Promise<VersionCheckResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    async recoverWithLastKnownConfiguration(): Promise<VersionCheckResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
