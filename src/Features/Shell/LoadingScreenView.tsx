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
      data-testid="loading-screen-view"
      aria-busy="true"
      aria-live="polite"
      role="status"
      fullscreen
      style={{
        "--background": "var(--ion-background-color)",
        "--color": "var(--ion-text-color)"
      }}
    >
      <section
        aria-label={props.message}
        data-blocks-interaction={props.blocksInteraction ? "true" : "false"}
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "var(--ion-padding)",
          justifyContent: "center",
          minHeight: "100%",
          pointerEvents: props.blocksInteraction ? "all" : "auto",
          textAlign: "center"
        }}
      >
        <IonSpinner aria-label={props.message} name="crescent" role="progressbar" />
        <IonText>
          <p>{props.message}</p>
        </IonText>
      </section>
    </IonContent>
  );
}
