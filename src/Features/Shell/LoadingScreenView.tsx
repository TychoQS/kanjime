import { IonContent } from "@ionic/react";

import type { LoadingScreenProps } from "./Contracts/LoadingScreenProps";

/**
 * Minimal loading-screen view stub kept intentionally empty for RED tests.
 */
export function LoadingScreenView(_props: LoadingScreenProps): JSX.Element {
  return <IonContent data-testid="loading-screen-view" />;
}
