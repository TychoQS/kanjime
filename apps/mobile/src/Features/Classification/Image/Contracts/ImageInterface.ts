/**
 * Contract for image-based classification state.
 *
 * @inv The image state contains either one valid image or null.
 * @inv Only one crop can be active at a time.
 * @inv The original loaded image remains unchanged until preprocessing starts.
 */
export interface ImageInterface {
  /**
   * Stores a new image and invalidates any previous crop.
   *
   * Requirement IDs: R21.
   *
   * @pre The classification feature is in image mode.
   * @post The image state contains the new valid image and any previously active crop becomes invalid.
   */
  setImage(
    image: {
      uri: string;
      width: number;
      height: number;
      mimeType: string;
    }
  ): void;

  /**
   * Removes the currently loaded image without triggering inference.
   *
   * Requirement IDs: R19.
   *
   * @pre A valid image is currently loaded.
   * @inv No inference is executed during this action
   * @post The image state becomes null.
   */
  clearImage(): void;

  /**
   * Replaces the current crop with a new crop bounded by the loaded image.
   *
   * Requirement IDs: R20.
   *
   * @pre A valid image is loaded and the crop lies inside the image bounds.
   * @post The new crop becomes the only active crop and is used as the next classification input while the original image stays intact.
   */
  setActiveCrop(
    crop: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): void;

  /**
   * Returns the current image and crop state.
   *
   * @post The returned state contains the active image and the single active crop, if any.
   */
  getImageState(): {
    image: {
      uri: string;
      width: number;
      height: number;
      mimeType: string;
    } | null;
    crop:
    | {
      x: number;
      y: number;
      width: number;
      height: number;
    }
    | null;
  };
}
