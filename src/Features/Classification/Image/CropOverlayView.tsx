import type { CropProps } from "./Contracts/CropProps";

/**
 * Crop overlay rendered above an image preview.
 */
export function CropOverlayView(props: CropProps): JSX.Element | null {
  if (!props.isVisible || props.activeCrop === null) {
    return null;
  }

  return (
    <div
      data-crop-x={String(props.activeCrop.x)}
      data-crop-y={String(props.activeCrop.y)}
      data-testid="crop-overlay-view"
      style={{ inset: 0, pointerEvents: "none", position: "absolute" }}
    >
      <div
        className="crop-overlay"
        data-testid="active-crop-box"
        style={{
          height: `${(props.activeCrop.height / props.imageHeight) * 100}%`,
          left: `${(props.activeCrop.x / props.imageWidth) * 100}%`,
          top: `${(props.activeCrop.y / props.imageHeight) * 100}%`,
          width: `${(props.activeCrop.width / props.imageWidth) * 100}%`
        }}
      />
    </div>
  );
}
