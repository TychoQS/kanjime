import { IonText } from "@ionic/react";

import type { AdminDashboardProps } from "../Contracts/AdminDashboardProps";

/**
 * Displays the administration technical overview.
 */
export function AdminDashboardView(props: AdminDashboardProps): JSX.Element {
  if (props.isLoading) {
    return <p className="admin-muted">Loading technical summary.</p>;
  }

  if (props.errorMessage !== null) {
    return (
      <IonText color="danger">
        <p role="alert">{props.errorMessage}</p>
      </IonText>
    );
  }

  if (props.summary === null) {
    return <p className="admin-muted">No technical summary is available.</p>;
  }

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <h2 id="admin-dashboard-title">Technical overview</h2>
      <div className="admin-dashboard-grid">
        <section className="admin-panel" aria-labelledby="admin-dashboard-version-title">
          <h3 id="admin-dashboard-version-title">Version configuration</h3>
          <dl className="admin-definition-list">
            <div>
              <dt>Current version</dt>
              <dd>{props.summary.versionConfiguration.currentVersion}</dd>
            </div>
            <div>
              <dt>Latest version</dt>
              <dd>{props.summary.versionConfiguration.latestVersion}</dd>
            </div>
            <div>
              <dt>Minimum supported version</dt>
              <dd>{props.summary.versionConfiguration.minimumSupportedVersion}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-panel" aria-labelledby="admin-dashboard-errors-title">
          <h3 id="admin-dashboard-errors-title">Reported errors</h3>
          <dl className="admin-definition-list">
            <div>
              <dt>Total reports</dt>
              <dd>{props.summary.reportedErrorCount}</dd>
            </div>
            <div>
              <dt>Latest report</dt>
              <dd>{props.summary.latestReportedErrorAt ?? "No reports"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}
