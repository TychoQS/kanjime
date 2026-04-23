import { IonContent } from "@ionic/react";

import type { GlobalProps } from "./Contracts/GlobalProps";

/**
 * Minimal global presentation view stub kept intentionally empty for RED tests.
 */
export function GlobalView(props: GlobalProps): JSX.Element {
  return (
    <IonContent data-testid="global-view" lang={props.language} data-theme={props.theme}>
      {props.children}
    </IonContent>
  );
}
