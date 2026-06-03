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
      <IonCard data-testid="admin-errors-loading-card">
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
      <IonCard color="danger" data-testid="admin-errors-error-card">
        <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
      <IonCard aria-labelledby="admin-errors-title" data-testid="admin-errors-view">
      <IonCardHeader>
        <IonCardTitle id="admin-errors-title">Reported errors</IonCardTitle>
      </IonCardHeader>
      {props.errors.length === 0 ? (
        <IonCardContent data-testid="admin-errors-empty-state">
          <IonText color="medium">
            <p>No reported errors are available.</p>
          </IonText>
        </IonCardContent>
      ) : (
        <IonList className="admin-list" data-testid="admin-errors-list">
          {props.errors.map(error => (
            <IonItem key={error.id} button data-testid={`admin-error-row-${error.id}`} onClick={() => props.onErrorSelected(error.id)}>
              <IonLabel>
                <h3 data-testid={`admin-error-message-${error.id}`}>{error.message}</h3>
                <p data-testid={`admin-error-occurred-at-${error.id}`}>{error.occurredAt}</p>
                <p data-testid={`admin-error-application-version-${error.id}`}>{error.applicationVersion}</p>
                <p data-testid={`admin-error-context-summary-${error.id}`}>{error.contextSummary}</p>
              </IonLabel>
              <IonButton data-testid={`admin-error-open-button-${error.id}`} fill="clear" slot="end" onClick={() => props.onErrorSelected(error.id)}>
                Open
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      )}
    </IonCard>
  );
}
