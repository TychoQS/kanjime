import type { ModelLoaderInterface } from "./Contracts/ModelLoaderInterface";
import type { ModelConfiguration } from "../../../Shared/DomainTypes";
import { createModelLoaderViewModel } from "./ViewModel/ModelLoaderViewModel";

/**
 * External collaborators consumed by the model-loader controller.
 */
export interface CreateModelLoaderControllerDependencies {
  readonly initializeModelRuntime: () => Promise<ModelConfiguration>;
}

/**
 * Creates the model-loader controller.
 */
export function CreateModelLoaderController(
  dependencies: CreateModelLoaderControllerDependencies
): ModelLoaderInterface {
  return createModelLoaderViewModel(dependencies);
}
