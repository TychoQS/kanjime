import type { ToggleClassificationModeInterface } from "./Contracts/ToggleClassificationModeInterface";
import type { ClassificationMode } from "../../../Shared/DomainTypes";
import { createToggleClassificationModeViewModel } from "./ViewModel/ToggleClassificationModeViewModel";

/**
 * External collaborators consumed by the mode-toggle controller.
 */
export interface CreateToggleClassificationModeControllerDependencies {
  readonly clearCurrentModeState: (mode: ClassificationMode) => Promise<void> | void;
}

/**
 * Creates the mode-toggle controller.
 */
export function CreateToggleClassificationModeController(
  dependencies: CreateToggleClassificationModeControllerDependencies
): ToggleClassificationModeInterface {
  return createToggleClassificationModeViewModel(dependencies);
}
