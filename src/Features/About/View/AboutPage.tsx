import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/react";

export function AboutPage(): JSX.Element {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-shell">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Application information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              Initial information for the future About screen.
            </IonCardContent>
          </IonCard>
          <IonList inset>
            <IonItem>
              <IonLabel>
                <strong>Name</strong>
                <p>TFG-APP</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <strong>Version</strong>
                <p>0.1.0</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <strong>Authorship</strong>
                <p>Project authorship will be shown here.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}
