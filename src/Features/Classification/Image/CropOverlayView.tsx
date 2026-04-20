import { IonContent } from "@ionic/react";

import type { CropProps } from "./Contracts/CropProps";

/**
 * Minimal crop overlay view stub kept intentionally empty for RED tests.
 */
export function CropOverlayView(_props: CropProps): JSX.Element {
  return <IonContent data-testid="crop-overlay-view" />;
}
