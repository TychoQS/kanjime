import { IonButton, IonText } from "@ionic/react";

import type { UpdateAvailableProps } from "../Contracts/UpdateAvailableProps";

/**
 * Non-blocking update availability notice.
 */
export function UpdateAvailableView(props: UpdateAvailableProps): JSX.Element | null {
  if (!props.isVisible) {
    return null;
  }

  return (
    <section className="update-available-view" data-testid="update-available-view" aria-live="polite">
      <IonText>
        <p data-testid="update-available-message">{props.message}</p>
      </IonText>
      {props.canContinueUsingApplication ? (
        <IonButton
          fill="clear"
          data-testid="update-available-dismiss-button"
          onClick={props.onDismissRequested}
        >
          Continue
        </IonButton>
      ) : null}
    </section>
  );
}
