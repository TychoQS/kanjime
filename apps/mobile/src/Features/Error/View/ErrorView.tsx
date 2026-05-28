import { IonButton, IonText } from "@ionic/react";

import type { ErrorProps } from "../Contracts/ErrorProps";

/**
 * Controlled user-facing error interface.
 */
export function ErrorView(props: ErrorProps): JSX.Element | null {
  if (!props.isVisible) {
    return null;
  }

  return (
    <div className="controlled-error-view" data-testid="controlled-error-view" role="alert">
      <IonText>
        <p data-testid="controlled-error-message">{props.message}</p>
      </IonText>
      {props.canContinue ? (
        <IonButton data-testid="controlled-error-dismiss-button" onClick={props.onDismissRequested}>
          Continue
        </IonButton>
      ) : null}
    </div>
  );
}
