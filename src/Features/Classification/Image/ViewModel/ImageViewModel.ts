import type { ImageInterface } from "../Contracts/ImageInterface";
import type { CreateImageControllerDependencies } from "../CreateImageController";
import type { CropRegion, ImageDescriptor, ImageState } from "../../../../Shared/DomainTypes";
import { ImageError } from "../../../../Shared/AppErrors";

let registeredImageClear: (() => void) | null = null;

export function clearRegisteredImageState(): void {
  registeredImageClear?.();
}

function assertValidImage(image: ImageDescriptor): void {
  if (
    image.uri.trim().length === 0 ||
    image.mimeType.trim().length === 0 ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    throw new ImageError("The selected image could not be used.");
  }
}

function assertValidCrop(crop: CropRegion, image: ImageDescriptor): void {
  const cropRight = crop.x + crop.width;
  const cropBottom = crop.y + crop.height;

  if (
    crop.x < 0 ||
    crop.y < 0 ||
    crop.width <= 0 ||
    crop.height <= 0 ||
    cropRight > image.width ||
    cropBottom > image.height
  ) {
    throw new ImageError("ImageInterface accepted a crop outside the image bounds.");
  }
}

/**
 * Creates the image state view model.
 *
 * @pre Image and crop callbacks are available for the classification workflow.
 * @inv At most one image and one crop are active at a time.
 * @post The returned controller preserves immutable snapshots of image state.
 */
export function createImageViewModel(dependencies: CreateImageControllerDependencies): ImageInterface {
  let state: ImageState = {
    image: null,
    crop: null
  };
  registeredImageClear = () => {
    state = {
      image: null,
      crop: null
    };
  };

  return {
    setImage(image: ImageDescriptor): void {
      assertValidImage(image);
      state = {
        image: { ...image },
        crop: null
      };
      void dependencies.onImageSelected({ ...image });
    },
    clearImage(): void {
      state = {
        image: null,
        crop: null
      };
    },
    setActiveCrop(crop: CropRegion): void {
      if (state.image === null) {
        throw new ImageError("Select an image before choosing an area.");
      }

      assertValidCrop(crop, state.image);
      state = {
        image: { ...state.image },
        crop: { ...crop }
      };
      void dependencies.onCropSelected({ ...crop });
    },
    getImageState(): ImageState {
      return {
        image: state.image ? { ...state.image } : null,
        crop: state.crop ? { ...state.crop } : null
      };
    }
  };
}
