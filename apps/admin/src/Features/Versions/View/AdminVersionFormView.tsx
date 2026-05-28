import { IonButton, IonInput, IonText } from "@ionic/react";

import type { AdminVersionFormProps } from "../Contracts/AdminVersionFormProps";

/**
 * Displays the editable version configuration form.
 */
export function AdminVersionFormView(props: AdminVersionFormProps): JSX.Element {
  return (
    <section className="admin-panel" aria-labelledby="admin-version-form-title">
      <h2 id="admin-version-form-title">Edit version configuration</h2>
      <div className="admin-form-grid">
        <IonInput
          label="Current version"
          labelPlacement="stacked"
          value={props.state.currentVersion}
          onIonInput={event => props.onCurrentVersionChanged(String(event.detail.value ?? ""))}
        />
        <IonInput
          label="Latest version"
          labelPlacement="stacked"
          value={props.state.latestVersion}
          onIonInput={event => props.onLatestVersionChanged(String(event.detail.value ?? ""))}
        />
        <IonInput
          label="Minimum supported version"
          labelPlacement="stacked"
          value={props.state.minimumSupportedVersion}
          onIonInput={event => props.onMinimumSupportedVersionChanged(String(event.detail.value ?? ""))}
        />
      </div>
      {props.state.validationMessage !== null ? (
        <IonText color="danger">
          <p role="alert">{props.state.validationMessage}</p>
        </IonText>
      ) : null}
      <IonButton disabled={!props.state.canSave} onClick={props.onSaveRequested}>
        Save configuration
      </IonButton>
    </section>
  );
}
