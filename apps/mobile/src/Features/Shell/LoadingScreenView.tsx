import { IonContent, IonSpinner, IonText } from "@ionic/react";

import type { LoadingScreenProps } from "./Contracts/LoadingScreenProps";

/**
 * Blocking loading screen displayed while startup work is in progress.
 */
export function LoadingScreenView(props: LoadingScreenProps): JSX.Element | null {
  if (!props.isVisible) {
    return null;
  }

  return (
    <IonContent
      className="loading-screen"
      data-testid="loading-screen-view"
      aria-busy="true"
      aria-live="polite"
      role="status"
      fullscreen
    >
      <section
        className="loading-state"
        aria-label={props.message}
        data-blocks-interaction={props.blocksInteraction ? "true" : "false"}
      >
        <IonSpinner aria-label={props.message} name="crescent" role="progressbar" />
        <IonText>
          <p>{props.message}</p>
        </IonText>
      </section>
    </IonContent>
  );
}
