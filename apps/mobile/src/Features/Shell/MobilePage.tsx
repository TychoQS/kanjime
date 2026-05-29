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
import { translate } from "../../Shared/I18n";

interface MobilePageProps {
  readonly title: string;
  readonly contentId?: string;
  readonly children: ReactNode;
  readonly endControls?: ReactNode;
  readonly testId: string;
}


export function MobilePage(props: MobilePageProps): JSX.Element {
  const language = typeof document !== "undefined" && document.documentElement.lang
    ? document.documentElement.lang
    : "en-US";

  return (
    <IonPage id={props.contentId}>
      <IonHeader translucent={false}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton data-testid="menu-button" aria-label={translate(language, "openMenu")} />
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
