import type { ModelLoaderInterface } from "../Contracts/ModelLoaderInterface";
import type {
  CreateModelLoaderControllerDependencies
} from "../CreateModelLoaderController";
import type { ModelConfiguration } from "../../../../Shared/DomainTypes";

const EMPTY_MODEL_CONFIGURATION: ModelConfiguration = {
  inputWidth: 0,
  inputHeight: 0,
  isLoaded: false
};

/**
 * Creates the stateful model-loader view model used by the OCR flow.
 *
 * @pre The dependencies object provides an initialization function for the model runtime.
 * @inv The runtime initialization is requested at most once for this view-model instance.
 * @post The returned controller exposes model readiness and immutable configuration snapshots.
 */
export function createModelLoaderViewModel(
  dependencies: CreateModelLoaderControllerDependencies
): ModelLoaderInterface {
  let configuration: ModelConfiguration = EMPTY_MODEL_CONFIGURATION;
  let loadPromise: Promise<void> | null = null;

  async function loadModel(): Promise<void> {
    if (configuration.isLoaded) {
      return;
    }

    if (loadPromise === null) {
      loadPromise = dependencies.initializeModelRuntime().then(nextConfiguration => {
        configuration = {
          inputWidth: nextConfiguration.inputWidth,
          inputHeight: nextConfiguration.inputHeight,
          isLoaded: nextConfiguration.isLoaded
        };
      });
    }

    await loadPromise;
  }

  function isModelReady(): boolean {
    return configuration.isLoaded;
  }

  function getModelConfiguration(): ModelConfiguration {
    return {
      inputWidth: configuration.inputWidth,
      inputHeight: configuration.inputHeight,
      isLoaded: configuration.isLoaded
    };
  }

  return {
    loadModel,
    isModelReady,
    getModelConfiguration
  };
}
