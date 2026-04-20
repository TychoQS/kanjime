import { IonContent } from "@ionic/react";

import type { NavigationProps } from "./Contracts/NavigationProps";

/**
 * Minimal navigation view stub kept intentionally empty for RED tests.
 */
export function NavigationView(_props: NavigationProps): JSX.Element {
  return <IonContent data-testid="navigation-view" />;
}
