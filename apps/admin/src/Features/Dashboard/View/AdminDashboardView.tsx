import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonText
} from "@ionic/react";

import type { AdminDashboardProps } from "../Contracts/AdminDashboardProps";

/**
 * Displays the administration technical overview.
 */
export function AdminDashboardView(props: AdminDashboardProps): JSX.Element {
  if (props.isLoading) {
      return (
        <IonCard data-testid="admin-dashboard-loading-card">
          <IonCardContent className="admin-card-loading">
            <IonSpinner name="crescent" />
          <IonText color="medium">
            <p>Loading technical summary.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.errorMessage !== null) {
      return (
        <IonCard color="danger" data-testid="admin-dashboard-error-card">
          <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.summary === null) {
      return (
        <IonCard data-testid="admin-dashboard-empty-card">
          <IonCardContent>
          <IonText color="medium">
            <p>No technical summary is available.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <div className="admin-dashboard-grid" aria-labelledby="admin-dashboard-title" data-testid="admin-dashboard-view">
      <IonCard aria-labelledby="admin-dashboard-version-title" data-testid="admin-dashboard-version-card">
        <IonCardHeader>
          <IonCardTitle id="admin-dashboard-version-title">Version configuration</IonCardTitle>
        </IonCardHeader>
        <IonItem lines="inset" data-testid="admin-dashboard-current-version-row">
          <IonLabel>
            <p className="admin-item-label">Current version</p>
            <p className="admin-item-value" data-testid="admin-dashboard-current-version-value">{props.summary.versionConfiguration.currentVersion}</p>
          </IonLabel>
        </IonItem>
        <IonItem lines="inset" data-testid="admin-dashboard-latest-version-row">
          <IonLabel>
            <p className="admin-item-label">Latest version</p>
            <p className="admin-item-value" data-testid="admin-dashboard-latest-version-value">{props.summary.versionConfiguration.latestVersion}</p>
          </IonLabel>
        </IonItem>
        <IonItem lines="none" data-testid="admin-dashboard-minimum-version-row">
          <IonLabel>
            <p className="admin-item-label">Minimum supported version</p>
            <p className="admin-item-value" data-testid="admin-dashboard-minimum-version-value">
              {props.summary.versionConfiguration.minimumSupportedVersion}
            </p>
          </IonLabel>
        </IonItem>
      </IonCard>

      <IonCard aria-labelledby="admin-dashboard-errors-title" data-testid="admin-dashboard-errors-card">
        <IonCardHeader>
          <IonCardTitle id="admin-dashboard-errors-title">Reported errors</IonCardTitle>
        </IonCardHeader>
        <IonItem lines="inset" data-testid="admin-dashboard-total-reports-row">
          <IonLabel>
            <p className="admin-item-label">Total reports</p>
            <p className="admin-item-value" data-testid="admin-dashboard-total-reports-value">{props.summary.reportedErrorCount}</p>
          </IonLabel>
        </IonItem>
        <IonItem lines="none" data-testid="admin-dashboard-latest-report-row">
          <IonLabel>
            <p className="admin-item-label">Latest report</p>
            <p className="admin-item-value" data-testid="admin-dashboard-latest-report-value">
              {props.summary.latestReportedErrorAt ?? (
                <IonNote>No reports yet</IonNote>
              )}
            </p>
          </IonLabel>
        </IonItem>
      </IonCard>
    </div>
  );
}
