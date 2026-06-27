import type { CropProps } from "./Contracts/CropProps";

/**
 * Crop overlay rendered above an image preview.
 */
export function CropOverlayView(props: CropProps): JSX.Element | null {
  if (!props.isVisible || props.activeCrop === null) {
    return null;
  }

  const cropX = (props.activeCrop.x / props.imageWidth) * 100;
  const cropY = (props.activeCrop.y / props.imageHeight) * 100;
  const cropWidth = (props.activeCrop.width / props.imageWidth) * 100;
  const cropHeight = (props.activeCrop.height / props.imageHeight) * 100;
  const cropRight = cropX + cropWidth;
  const cropBottom = cropY + cropHeight;

  return (
    <svg
      aria-hidden="true"
      className="crop-overlay-layer"
      data-crop-x={String(props.activeCrop.x)}
      data-crop-y={String(props.activeCrop.y)}
      data-testid="crop-overlay-view"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        className="crop-overlay-scrim"
        d={`M0 0H100V100H0Z M${cropX} ${cropY}H${cropRight}V${cropBottom}H${cropX}Z`}
        fillRule="evenodd"
      />
      <rect
        className="crop-overlay"
        data-testid="active-crop-box"
        height={cropHeight}
        width={cropWidth}
        x={cropX}
        y={cropY}
      />
    </svg>
  );
}
