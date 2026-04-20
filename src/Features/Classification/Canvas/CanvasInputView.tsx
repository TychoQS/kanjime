import { IonContent } from "@ionic/react";

import type { CanvasInputProps } from "./Contracts/CanvasInputProps";

/**
 * Minimal canvas view stub kept intentionally empty for RED tests.
 */
export function CanvasInputView(_props: CanvasInputProps): JSX.Element {
  return <IonContent data-testid="canvas-input-view" />;
}
