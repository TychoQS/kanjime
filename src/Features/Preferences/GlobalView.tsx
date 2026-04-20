import { IonContent } from "@ionic/react";

import type { GlobalProps } from "./Contracts/GlobalProps";

/**
 * Minimal global presentation view stub kept intentionally empty for RED tests.
 */
export function GlobalView(_props: GlobalProps): JSX.Element {
  return <IonContent data-testid="global-view" />;
}
