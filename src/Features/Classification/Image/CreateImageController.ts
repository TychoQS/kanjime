import type { ImageInterface } from "./Contracts/ImageInterface";
import type { CropRegion, ImageDescriptor, ImageState } from "../../../Shared/DomainTypes";
import { createImageViewModel } from "./ViewModel/ImageViewModel";

/**
 * External collaborators consumed by the image controller.
 */
export interface CreateImageControllerDependencies {
  readonly onImageSelected: (image: ImageDescriptor) => Promise<void> | void;
  readonly onCropSelected: (crop: CropRegion) => Promise<void> | void;
}

/**
 * Creates the image-state controller.
 */
export function CreateImageController(dependencies: CreateImageControllerDependencies): ImageInterface {
  return createImageViewModel(dependencies);
}
