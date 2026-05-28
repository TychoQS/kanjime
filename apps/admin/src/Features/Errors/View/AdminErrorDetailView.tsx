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
      <IonCard>
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
      <IonCard color="danger">
        <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
          <IonButton fill="outline" onClick={props.onBackRequested}>
            Back to errors
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.detail === null) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="medium">
            <p>Select a reported error to inspect its detail.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard aria-labelledby="admin-error-detail-title">
      <IonCardHeader className="admin-card-header">
        <IonCardTitle id="admin-error-detail-title">Error detail</IonCardTitle>
        <IonButton fill="outline" size="small" onClick={props.onBackRequested}>
          Back to errors
        </IonButton>
      </IonCardHeader>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Identifier</p>
          <p className="admin-item-value admin-mono">{props.detail.id}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Message</p>
          <p className="admin-item-value">{props.detail.message}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Occurred at</p>
          <p className="admin-item-value">{props.detail.occurredAt}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Application version</p>
          <p className="admin-item-value">{props.detail.applicationVersion}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Web engine</p>
          <p className="admin-item-value">{props.detail.context.webEngine}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="inset">
        <IonLabel>
          <p className="admin-item-label">Web engine version</p>
          <p className="admin-item-value">{props.detail.context.webEngineVersion}</p>
        </IonLabel>
      </IonItem>

      <IonItem lines="none">
        <IonLabel>
          <p className="admin-item-label">Recent actions</p>
        </IonLabel>
      </IonItem>

      {props.detail.context.lastActions.length === 0 ? (
        <IonItem lines="none">
          <IonNote slot="start">No actions recorded before this error.</IonNote>
        </IonItem>
      ) : (
        <IonList className="admin-action-list">
          {props.detail.context.lastActions.map((action, index) => (
            <IonItem
              key={`${action.occurredAt}-${index}`}
              lines={index < props.detail!.context.lastActions.length - 1 ? "inset" : "none"}
            >
              <IonLabel>
                <p className="admin-item-value admin-mono">{action.type}</p>
                <IonNote>{action.occurredAt}</IonNote>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}
    </IonCard>
  );
}

