import type { ImageInterface } from "./Contracts/ImageInterface";
import type { CropRegion, ImageDescriptor, ImageState } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the image controller.
 */
export interface CreateImageControllerDependencies {
  readonly onImageSelected: (image: ImageDescriptor) => Promise<void> | void;
  readonly onCropSelected: (crop: CropRegion) => Promise<void> | void;
}

/**
 * Creates the image-state controller stub used by the RED test suite.
 */
export function CreateImageController(_dependencies: CreateImageControllerDependencies): ImageInterface {
  return {
    setImage(_image: ImageDescriptor): void {},
    clearImage(): void {},
    setActiveCrop(_crop: CropRegion): void {},
    getImageState(): ImageState {
      return {
        image: null,
        crop: null
      };
    }
  };
}
