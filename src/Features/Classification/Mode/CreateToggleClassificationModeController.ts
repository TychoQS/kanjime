import type { ToggleClassificationModeInterface } from "./Contracts/ToggleClassificationModeInterface";
import type { ClassificationMode } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the mode-toggle controller.
 */
export interface CreateToggleClassificationModeControllerDependencies {
  readonly clearCurrentModeState: (mode: ClassificationMode) => Promise<void> | void;
}

/**
 * Creates the mode-toggle controller stub used by the RED test suite.
 */
export function CreateToggleClassificationModeController(
  _dependencies: CreateToggleClassificationModeControllerDependencies
): ToggleClassificationModeInterface {
  return {
    switchMode(_mode: ClassificationMode): void {}
  };
}
