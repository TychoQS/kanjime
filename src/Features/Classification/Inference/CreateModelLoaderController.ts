import type { ModelLoaderInterface } from "./Contracts/ModelLoaderInterface";
import type { ModelConfiguration } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the model-loader controller.
 */
export interface CreateModelLoaderControllerDependencies {
  readonly initializeModelRuntime: () => Promise<ModelConfiguration>;
}

/**
 * Creates the model-loader controller stub used by the RED test suite.
 */
export function CreateModelLoaderController(
  _dependencies: CreateModelLoaderControllerDependencies
): ModelLoaderInterface {
  return {
    async loadModel(): Promise<void> {},
    isModelReady(): boolean {
      return false;
    },
    getModelConfiguration(): ModelConfiguration {
      return {
        inputWidth: 0,
        inputHeight: 0,
        isLoaded: false
      };
    }
  };
}
