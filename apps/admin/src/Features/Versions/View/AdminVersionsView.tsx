import { IonText } from "@ionic/react";

import type { AdminVersionsProps } from "../Contracts/AdminVersionsProps";

/**
 * Displays the current application version configuration.
 */
export function AdminVersionsView(props: AdminVersionsProps): JSX.Element {
  if (props.isLoading) {
    return <p className="admin-muted">Loading version configuration.</p>;
  }

  if (props.errorMessage !== null) {
    return (
      <IonText color="danger">
        <p role="alert">{props.errorMessage}</p>
      </IonText>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-versions-title">
      <h2 id="admin-versions-title">Version configuration</h2>
      <dl className="admin-definition-list">
        <div>
          <dt>Current version</dt>
          <dd>{props.summary.currentVersion}</dd>
        </div>
        <div>
          <dt>Latest version</dt>
          <dd>{props.summary.latestVersion}</dd>
        </div>
        <div>
          <dt>Minimum supported version</dt>
          <dd>{props.summary.minimumSupportedVersion}</dd>
        </div>
        <div>
          <dt>Updated at</dt>
          <dd>{props.summary.updatedAt}</dd>
        </div>
      </dl>
    </section>
  );
}
