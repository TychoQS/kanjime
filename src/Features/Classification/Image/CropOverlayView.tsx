import { IonContent } from "@ionic/react";

import type { CropProps } from "./Contracts/CropProps";

/**
 * Crop overlay rendered above an image preview.
 */
export function CropOverlayView(props: CropProps): JSX.Element | null {
  if (!props.isVisible || props.activeCrop === null) {
    return null;
  }

  const left = `${(props.activeCrop.x / props.imageWidth) * 100}%`;
  const top = `${(props.activeCrop.y / props.imageHeight) * 100}%`;
  const width = `${(props.activeCrop.width / props.imageWidth) * 100}%`;
  const height = `${(props.activeCrop.height / props.imageHeight) * 100}%`;

  return (
    <IonContent
      data-crop-x={String(props.activeCrop.x)}
      data-crop-y={String(props.activeCrop.y)}
      data-testid="crop-overlay-view"
    >
      <div
        data-testid="active-crop-box"
        role="presentation"
        style={{
          borderColor: "var(--ion-color-primary)",
          borderStyle: "solid",
          borderWidth: "2px",
          height,
          left,
          position: "absolute",
          top,
          width
        }}
      />
    </IonContent>
  );
}
