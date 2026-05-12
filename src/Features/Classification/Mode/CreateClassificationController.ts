import type { ClassificationInterface } from "./Contracts/ClassificationInterface";
import type { ClassificationMode } from "../../../Shared/DomainTypes";
import { createClassificationViewModel } from "./ViewModel/ClassificationViewModel";

/**
 * External collaborators consumed by the classification-mode controller.
 */
export interface CreateClassificationControllerDependencies {
  readonly onModeChanged: (mode: ClassificationMode) => Promise<void> | void;
}

/**
 * Creates the classification-mode controller.
 */
export function CreateClassificationController(
  dependencies: CreateClassificationControllerDependencies
): ClassificationInterface {
  return createClassificationViewModel(dependencies);
}
