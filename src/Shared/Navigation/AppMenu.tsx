import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote
} from "@ionic/react";
import { informationCircleOutline, settingsOutline, scanOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";

interface AppPage {
  readonly title: string;
  readonly url: string;
  readonly icon: string;
}

const appPages: ReadonlyArray<AppPage> = [
  {
    title: "OCR",
    url: "/ocr",
    icon: scanOutline
  },
  {
    title: "About",
    url: "/about",
    icon: informationCircleOutline
  },
  {
    title: "Settings",
    url: "/settings",
    icon: settingsOutline
  }
];

export function AppMenu(): JSX.Element {
  const location = useLocation();

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonContent>
        <IonList id="main-menu-list">
          <IonListHeader>TFG-APP</IonListHeader>
          <IonNote>Offline kanji recognition workspace</IonNote>
          {appPages.map((appPage) => (
            <IonMenuToggle key={appPage.url} autoHide={false}>
              <IonItem
                className={location.pathname === appPage.url ? "selected" : undefined}
                routerLink={appPage.url}
                routerDirection="root"
                lines="none"
                detail={false}
              >
                <IonIcon aria-hidden="true" slot="start" icon={appPage.icon} />
                <IonLabel>{appPage.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
}
