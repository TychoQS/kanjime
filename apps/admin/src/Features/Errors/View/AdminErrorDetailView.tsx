import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonText
} from "@ionic/react";

import type { AdminErrorDetailProps } from "../Contracts/AdminErrorDetailProps";

/**
 * Displays the selected reported error detail.
 */
export function AdminErrorDetailView(props: AdminErrorDetailProps): JSX.Element {
  if (props.isLoading) {
    return (
      <IonCard data-testid="admin-error-detail-loading-card">
        <IonCardContent className="admin-card-loading">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p>Loading error detail.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.errorMessage !== null) {
    return (
      <IonCard color="danger" data-testid="admin-error-detail-error-card">
        <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
          <IonButton data-testid="admin-error-detail-back-button" fill="outline" onClick={props.onBackRequested}>
            Back to errors
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.detail === null) {
    return (
      <IonCard data-testid="admin-error-detail-empty-card">
        <IonCardContent>
          <IonText color="medium">
            <p>Select a reported error to inspect its detail.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard aria-labelledby="admin-error-detail-title" data-testid="admin-error-detail-view">
      <IonCardHeader className="admin-card-header">
        <IonCardTitle id="admin-error-detail-title">Error detail</IonCardTitle>
        <IonButton data-testid="admin-error-detail-back-button" fill="outline" size="small" onClick={props.onBackRequested}>
          Back to errors
        </IonButton>
      </IonCardHeader>

      <IonItem lines="inset" data-testid="admin-error-detail-identifier-row">
        <IonLabel>
          <p className="admin-item-label">Identifier</p>
          <p className="admin-item-value admin-mono" data-testid="admin-error-detail-identifier-value">{props.detail.id}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-error-detail-message-row">
        <IonLabel>
          <p className="admin-item-label">Message</p>
          <p className="admin-item-value" data-testid="admin-error-detail-message-value">{props.detail.message}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-error-detail-occurred-at-row">
        <IonLabel>
          <p className="admin-item-label">Occurred at</p>
          <p className="admin-item-value" data-testid="admin-error-detail-occurred-at-value">{props.detail.occurredAt}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-error-detail-application-version-row">
        <IonLabel>
          <p className="admin-item-label">Application version</p>
          <p className="admin-item-value" data-testid="admin-error-detail-application-version-value">{props.detail.applicationVersion}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-error-detail-web-engine-row">
        <IonLabel>
          <p className="admin-item-label">Web engine</p>
          <p className="admin-item-value" data-testid="admin-error-detail-web-engine-value">{props.detail.context.webEngine}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-error-detail-web-engine-version-row">
        <IonLabel>
          <p className="admin-item-label">Web engine version</p>
          <p className="admin-item-value" data-testid="admin-error-detail-web-engine-version-value">{props.detail.context.webEngineVersion}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="none" data-testid="admin-error-detail-last-actions-row">
        <IonLabel>
          <p className="admin-item-label">Recent actions</p>
        </IonLabel>
      </IonItem>

      {props.detail.context.lastActions.length === 0 ? (
        <IonItem lines="none" data-testid="admin-error-detail-empty-actions">
          <IonNote slot="start">No actions recorded before this error.</IonNote>
        </IonItem>
      ) : (
        <IonList className="admin-action-list" data-testid="admin-error-detail-actions-list">
          {props.detail.context.lastActions.map((action, index) => (
            <IonItem
              data-testid={`admin-error-detail-action-${index}`}
              key={`${action.occurredAt}-${index}`}
              lines={index < props.detail!.context.lastActions.length - 1 ? "inset" : "none"}
            >
              <IonLabel>
                <p className="admin-item-value admin-mono" data-testid={`admin-error-detail-action-type-${index}`}>{action.type}</p>
                <IonNote data-testid={`admin-error-detail-action-occurred-at-${index}`}>{action.occurredAt}</IonNote>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}
    </IonCard>
  );
}
