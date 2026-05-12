import type { ToggleClassificationModeInterface } from "../Contracts/ToggleClassificationModeInterface";
import type {
  CreateToggleClassificationModeControllerDependencies
} from "../CreateToggleClassificationModeController";
import type { ClassificationMode } from "../../../../Shared/DomainTypes";
import { InferenceError } from "../../../../Shared/AppErrors";

function isClassificationMode(mode: string): mode is ClassificationMode {
  return mode === "image" || mode === "drawing";
}

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
