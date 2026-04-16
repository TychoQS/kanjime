import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

function App() {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>TFG-APP</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen />
      </IonPage>
    </IonApp>
  );
}

export default App;
