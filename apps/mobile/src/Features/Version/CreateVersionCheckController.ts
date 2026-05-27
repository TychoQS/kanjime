import type { VersionConfiguration } from "@kanjime/shared";

import type { VersionCheckInterface } from "./Contracts/VersionCheckInterface";
import { createVersionCheckViewModel } from "./ViewModel/VersionCheckViewModel";

/**
 * External collaborators consumed by the version check controller.
 */
export interface CreateVersionCheckControllerDependencies {
  readonly loadVersionConfiguration: () => Promise<VersionConfiguration>;
  readonly loadLastKnownVersionConfiguration: () => Promise<VersionConfiguration>;
}

/**
 * Creates the version check controller.
 */
export function CreateVersionCheckController(
  dependencies: CreateVersionCheckControllerDependencies
): VersionCheckInterface {
  return createVersionCheckViewModel(dependencies);
}
