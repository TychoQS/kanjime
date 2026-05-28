import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText
} from "@ionic/react";

import type { AdminErrorsProps } from "../Contracts/AdminErrorsProps";

/**
 * Displays reported application errors for administration review.
 */
export function AdminErrorsView(props: AdminErrorsProps): JSX.Element {
  if (props.isLoading) {
    return (
      <IonCard>
        <IonCardContent className="admin-card-loading">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p>Loading reported errors.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.errorMessage !== null) {
    return (
      <IonCard color="danger">
        <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard aria-labelledby="admin-errors-title">
      <IonCardHeader>
        <IonCardTitle id="admin-errors-title">Reported errors</IonCardTitle>
      </IonCardHeader>
      {props.errors.length === 0 ? (
        <IonCardContent>
          <IonText color="medium">
            <p>No reported errors are available.</p>
          </IonText>
        </IonCardContent>
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
    </IonCard>
  );
}

