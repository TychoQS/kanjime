/**
 * Props contract for the crop overlay rendered on top of an image.
 *
 * Requirement IDs: R14.
 *
 * @pre The user has defined a valid crop within the loaded image.
 * @inv Only one crop overlay is active at any time.
 * @post The selected crop is rendered as a visible overlay over the original image.
 */
export interface CropProps {
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly activeCrop:
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | null;
  readonly isVisible: boolean;
  readonly onCropChanged: (
    crop: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null
  ) => void;
}
