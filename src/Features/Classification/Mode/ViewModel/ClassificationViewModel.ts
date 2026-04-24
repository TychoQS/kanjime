import type { ClassificationInterface } from "../Contracts/ClassificationInterface";
import type { CreateClassificationControllerDependencies } from "../CreateClassificationController";
import type { ClassificationMode } from "../../../../Shared/DomainTypes";

/**
 * Checks whether a value is a supported OCR mode.
 *
 * @pre The value may originate from UI or restored state.
 * @post The returned value is true only for supported modes.
 */
function isClassificationMode(mode: string): mode is ClassificationMode {
  return mode === "image" || mode === "drawing";
}

/**
 * Creates the active classification-mode view model.
 *
 * @pre Mode-change notifications are available for the surrounding workflow.
 * @inv Exactly one mode is active.
 * @post The returned controller exposes and updates the active mode.
 */
export function createClassificationViewModel(
  dependencies: CreateClassificationControllerDependencies
): ClassificationInterface {
  let activeMode: ClassificationMode = "image";

  return {
    getActiveMode(): ClassificationMode {
      return activeMode;
    },
    activateMode(mode: ClassificationMode): void {
      if (!isClassificationMode(mode)) {
        throw new Error("Select a valid input mode.");
      }

      activeMode = mode;
      void dependencies.onModeChanged(mode);
    }
  };
}

