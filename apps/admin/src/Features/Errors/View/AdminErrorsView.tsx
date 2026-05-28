import { IonButton, IonItem, IonLabel, IonList, IonText } from "@ionic/react";

import type { AdminErrorsProps } from "../Contracts/AdminErrorsProps";

/**
 * Displays reported application errors for administration review.
 */
export function AdminErrorsView(props: AdminErrorsProps): JSX.Element {
  if (props.isLoading) {
    return <p className="admin-muted">Loading reported errors.</p>;
  }

  if (props.errorMessage !== null) {
    return (
      <IonText color="danger">
        <p role="alert">{props.errorMessage}</p>
      </IonText>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-errors-title">
      <h2 id="admin-errors-title">Reported errors</h2>
      {props.errors.length === 0 ? (
        <p className="admin-muted">No reported errors are available.</p>
      ) : (
        <IonList className="admin-list">
          {props.errors.map(error => (
            <IonItem key={error.id} button onClick={() => props.onErrorSelected(error.id)}>
              <IonLabel>
                <h3>{error.message}</h3>
                <p>{error.occurredAt}</p>
                <p>{error.applicationVersion}</p>
                <p>{error.contextSummary}</p>
              </IonLabel>
              <IonButton fill="clear" slot="end" onClick={() => props.onErrorSelected(error.id)}>
                Open
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      )}
    </section>
  );
}
