import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from "@ionic/react";

import { useAppContext } from "../../../Shared/State/AppContext";

export function SettingsPage(): JSX.Element {
  const { language, setLanguage, themeMode, setThemeMode } = useAppContext();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-shell">
          <IonList inset>
            <IonItem>
              <IonLabel>Language</IonLabel>
              <IonSelect
                aria-label="Language"
                interface="popover"
                value={language}
                onIonChange={(event) => setLanguage(String(event.detail.value))}
              >
                <IonSelectOption value="en-US">English (US)</IonSelectOption>
                <IonSelectOption value="en-GB">English (UK)</IonSelectOption>
                <IonSelectOption value="es-ES">Spanish</IonSelectOption>
                <IonSelectOption value="ja-JP">Japanese</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>Theme</IonLabel>
            </IonItem>
            <IonItem>
              <IonSegment
                value={themeMode}
                onIonChange={(event) =>
                  setThemeMode(event.detail.value as "system" | "light" | "dark")
                }
              >
                <IonSegmentButton value="system">
                  <IonLabel>System</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="light">
                  <IonLabel>Light</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="dark">
                  <IonLabel>Dark</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}
