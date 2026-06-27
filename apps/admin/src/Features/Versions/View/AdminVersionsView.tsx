import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText
} from "@ionic/react";
import { useState } from "react";

import type { AdminVersionFormProps } from "../Contracts/AdminVersionFormProps";
import type { AdminVersionsProps } from "../Contracts/AdminVersionsProps";

interface AdminVersionsPanelProps extends AdminVersionsProps, AdminVersionFormProps {}

/**
 * Displays the current version configuration and provides inline editing.
 * The form is hidden by default and activated by the Edit button.
 */
export function AdminVersionsView(props: AdminVersionsPanelProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  if (props.isLoading) {
    return (
      <IonCard data-testid="admin-versions-loading-card">
        <IonCardContent className="admin-card-loading">
          <IonSpinner name="crescent" />
          <IonText color="medium">
            <p>Loading version configuration.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (props.errorMessage !== null) {
    return (
      <IonCard color="danger" data-testid="admin-versions-error-card">
        <IonCardContent>
          <IonText>
            <p role="alert">{props.errorMessage}</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard aria-labelledby="admin-versions-title" data-testid="admin-versions-view">
      <IonCardHeader className="admin-card-header">
        <IonCardTitle id="admin-versions-title">Version configuration</IonCardTitle>
        {!isEditing ? (
          <IonButton
            fill="outline"
            size="small"
            data-testid="admin-versions-edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </IonButton>
        ) : (
          <IonButton
            fill="clear"
            size="small"
            color="medium"
            data-testid="admin-versions-cancel-button"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </IonButton>
        )}
      </IonCardHeader>

      <IonItem lines="inset" data-testid="admin-version-current-row">
        <IonLabel>
          <p className="admin-item-label">Current version</p>
          {isEditing ? (
            <IonInput
              value={props.state.currentVersion}
              placeholder="e.g. 1.0.0"
              onIonInput={event => props.onCurrentVersionChanged(String(event.detail.value ?? ""))}
              data-testid="admin-version-current-input"
            />
          ) : (
            <IonBadge color="primary" className="admin-version-badge" data-testid="admin-version-current-value">
              {props.summary.currentVersion || "—"}
            </IonBadge>
          )}
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-version-latest-row">
        <IonLabel>
          <p className="admin-item-label">Latest version</p>
          {isEditing ? (
            <IonInput
              value={props.state.latestVersion}
              placeholder="e.g. 1.1.0"
              onIonInput={event => props.onLatestVersionChanged(String(event.detail.value ?? ""))}
              data-testid="admin-version-latest-input"
            />
          ) : (
            <IonBadge color="secondary" className="admin-version-badge" data-testid="admin-version-latest-value">
              {props.summary.latestVersion || "—"}
            </IonBadge>
          )}
        </IonLabel>
      </IonItem>

      <IonItem lines="inset" data-testid="admin-version-minimum-row">
        <IonLabel>
          <p className="admin-item-label">Minimum supported version</p>
          {isEditing ? (
            <IonInput
              value={props.state.minimumSupportedVersion}
              placeholder="e.g. 0.9.0"
              onIonInput={event =>
                props.onMinimumSupportedVersionChanged(String(event.detail.value ?? ""))
              }
              data-testid="admin-version-minimum-input"
            />
          ) : (
            <IonBadge color="medium" className="admin-version-badge" data-testid="admin-version-minimum-value">
              {props.summary.minimumSupportedVersion || "—"}
            </IonBadge>
          )}
        </IonLabel>
      </IonItem>

      <IonItem lines="none" data-testid="admin-version-updated-at-row">
        <IonLabel>
          <p className="admin-item-label">Updated at</p>
          <p className="admin-item-value" data-testid="admin-version-updated-at-value">{props.summary.updatedAt || "—"}</p>
        </IonLabel>
      </IonItem>

      {isEditing ? (
        <IonCardContent>
          {props.state.validationMessage !== null ? (
            <IonText color="danger">
              <p role="alert" className="admin-validation-message" data-testid="admin-version-validation-message">
                {props.state.validationMessage}
              </p>
            </IonText>
          ) : null}
          <IonButton
            expand="block"
            disabled={!props.state.canSave}
            data-testid="admin-version-save-button"
            onClick={() => {
              props.onSaveRequested();
              setIsEditing(false);
            }}
          >
            Save configuration
          </IonButton>
        </IonCardContent>
      ) : null}
    </IonCard>
  );
}
