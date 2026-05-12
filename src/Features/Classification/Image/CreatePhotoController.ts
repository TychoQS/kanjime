import type { PhotoInterface } from "./Contracts/PhotoInterface";
import type { ImageDescriptor } from "../../../Shared/DomainTypes";
import { createPhotoViewModel } from "./ViewModel/PhotoViewModel";

/**
 * External collaborators consumed by the photo controller.
 */
export interface CreatePhotoControllerDependencies {
  readonly captureFromCamera: () => Promise<ImageDescriptor>;
  readonly pickFromLibrary: () => Promise<ImageDescriptor>;
}

/**
 * Creates the photo controller.
 */
export function CreatePhotoController(dependencies: CreatePhotoControllerDependencies): PhotoInterface {
  return createPhotoViewModel(dependencies);
}
