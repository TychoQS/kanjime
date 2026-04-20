import { IonContent } from "@ionic/react";

import type { ImageProps } from "./Contracts/ImageProps";

/**
 * Minimal image preview view stub kept intentionally empty for RED tests.
 */
export function ImageView(_props: ImageProps): JSX.Element {
  return <IonContent data-testid="image-view" />;
}
