import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";

/**
 * Initial OCR view placeholder.
 *
 * @post Renders the first mobile screen for the project bootstrap.
 */
export function ClassificationPage(): JSX.Element {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>OCR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-shell">
          <IonCard className="hero-card">
            <IonCardHeader>
              <IonCardSubtitle>Iteration 1</IonCardSubtitle>
              <IonCardTitle>Project bootstrap</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              The Ionic React, Capacitor and TypeScript base is ready for the
              kanji recognition workflow.
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Next implementation targets</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="stack-layout">
              <IonText>
                Canvas input, image import, ONNX inference and local database
                integration will be added on top of this shell.
              </IonText>
              <IonButton expand="block">Start OCR module</IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
}
