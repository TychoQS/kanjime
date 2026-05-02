import type { ToggleClassificationModeInterface } from "../Contracts/ToggleClassificationModeInterface";
import type {
  CreateToggleClassificationModeControllerDependencies
} from "../CreateToggleClassificationModeController";
import type { ClassificationMode } from "../../../../Shared/DomainTypes";
import { InferenceError } from "../../../../Shared/AppErrors";

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
 * Creates the mode-toggle view model.
 *
 * @pre The previous mode state can be cleared through the dependency.
 * @inv User preferences are not modified during mode switches.
 * @post The returned controller clears the mode that is being deactivated.
 */
export function createToggleClassificationModeViewModel(
  dependencies: CreateToggleClassificationModeControllerDependencies
): ToggleClassificationModeInterface {
  let currentMode: ClassificationMode = "image";

  return {
    switchMode(mode: ClassificationMode): void {
      if (!isClassificationMode(mode)) {
        throw new InferenceError("ToggleClassificationModeInterface accepted an invalid mode.");
      }

      const previousMode = currentMode === mode ? (mode === "image" ? "drawing" : "image") : currentMode;
      currentMode = mode;
      void dependencies.clearCurrentModeState(previousMode);
    }
  };
}
