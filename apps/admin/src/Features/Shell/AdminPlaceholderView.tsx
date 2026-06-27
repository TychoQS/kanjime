import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

/**
 * Non-functional placeholder for the future administration panel.
 */
export function AdminPlaceholderView(): JSX.Element {
  return (
    <IonPage data-testid="admin-placeholder-screen">
      <IonHeader>
        <IonToolbar>
          <IonTitle>KanjiMe Admin</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <main className="admin-placeholder" aria-labelledby="admin-placeholder-title">
          <section className="admin-placeholder-panel">
            <p className="admin-placeholder-kicker">Administration</p>
            <h1 id="admin-placeholder-title">Administration panel not implemented yet.</h1>
            <p>
              This workspace is ready for future version configuration and error observability tasks.
            </p>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
}
