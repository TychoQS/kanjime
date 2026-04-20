import type { ClassificationInterface } from "./Contracts/ClassificationInterface";
import type { ClassificationMode } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the classification-mode controller.
 */
export interface CreateClassificationControllerDependencies {
  readonly onModeChanged: (mode: ClassificationMode) => Promise<void> | void;
}

/**
 * Creates the classification-mode controller stub used by the RED test suite.
 */
export function CreateClassificationController(
  _dependencies: CreateClassificationControllerDependencies
): ClassificationInterface {
  return {
    getActiveMode(): ClassificationMode {
      return "image";
    },
    activateMode(_mode: ClassificationMode): void {}
  };
}
