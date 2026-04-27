import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import type { ReactNode } from "react";

interface MobilePageProps {
  readonly title: string;
  readonly contentId?: string;
  readonly children: ReactNode;
  readonly endControls?: ReactNode;
  readonly testId: string;
}

/**
 * Shared mobile page shell with a fixed header and non-scrolling page content.
 *
 * @pre Children render their own internal scroll containers when needed.
 * @post The full Ionic page remains stable while content areas manage overflow.
 */
export function MobilePage(props: MobilePageProps): JSX.Element {
  return (
    <IonPage id={props.contentId}>
      <IonHeader translucent={false}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton data-testid="menu-button" aria-label="Open menu" />
          </IonButtons>
          <IonTitle>{props.title}</IonTitle>
          {props.endControls ? <IonButtons slot="end">{props.endControls}</IonButtons> : null}
        </IonToolbar>
      </IonHeader>
      <IonContent data-testid={props.testId} scrollY={false}>
        {props.children}
      </IonContent>
    </IonPage>
  );
}
