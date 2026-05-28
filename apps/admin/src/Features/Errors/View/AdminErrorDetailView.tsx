import { IonButton, IonText } from "@ionic/react";

import type { AdminErrorDetailProps } from "../Contracts/AdminErrorDetailProps";

/**
 * Displays the selected reported error detail.
 */
export function AdminErrorDetailView(props: AdminErrorDetailProps): JSX.Element {
  if (props.isLoading) {
    return <p className="admin-muted">Loading error detail.</p>;
  }

  if (props.errorMessage !== null) {
    return (
      <section className="admin-panel">
        <IonText color="danger">
          <p role="alert">{props.errorMessage}</p>
        </IonText>
        <IonButton onClick={props.onBackRequested}>Back to errors</IonButton>
      </section>
    );
  }

  if (props.detail === null) {
    return (
      <section className="admin-panel">
        <p className="admin-muted">Select a reported error to inspect its detail.</p>
      </section>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-error-detail-title">
      <div className="admin-section-heading">
        <h2 id="admin-error-detail-title">Error detail</h2>
        <IonButton fill="outline" onClick={props.onBackRequested}>
          Back to errors
        </IonButton>
      </div>
      <dl className="admin-definition-list">
        <div>
          <dt>Identifier</dt>
          <dd>{props.detail.id}</dd>
        </div>
        <div>
          <dt>Message</dt>
          <dd>{props.detail.message}</dd>
        </div>
        <div>
          <dt>Occurred at</dt>
          <dd>{props.detail.occurredAt}</dd>
        </div>
        <div>
          <dt>Application version</dt>
          <dd>{props.detail.applicationVersion}</dd>
        </div>
        <div>
          <dt>Web engine</dt>
          <dd>{props.detail.context.webEngine}</dd>
        </div>
        <div>
          <dt>Web engine version</dt>
          <dd>{props.detail.context.webEngineVersion}</dd>
        </div>
        <div>
          <dt>Recent actions</dt>
          <dd>{props.detail.context.lastActions.length}</dd>
        </div>
      </dl>
    </section>
  );
}
