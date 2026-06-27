import type { PhotoInterface } from "./Contracts/PhotoInterface";
import type { ImageDescriptor } from "@kanjime/shared";
import { createPhotoViewModel } from "./ViewModel/PhotoViewModel";

/**
 * External collaborators consumed by the photo controller.
 */
export interface CreatePhotoControllerDependencies {
  readonly startCameraPreview: () => Promise<MediaStream>;
  readonly captureFromCamera: (video: HTMLVideoElement) => Promise<ImageDescriptor>;
  readonly stopCameraPreview: () => void;
  readonly pickFromLibrary: () => Promise<ImageDescriptor>;
}

/**
 * Creates the photo controller.
 */
export function CreatePhotoController(dependencies: CreatePhotoControllerDependencies): PhotoInterface {
  return createPhotoViewModel(dependencies);
}
