import {
  IonPage,
  IonRouterOutlet,
  IonSplitPane
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import { AboutPage } from "../../Features/About/View/AboutPage";
import { ClassificationPage } from "../../Features/Classification/View/ClassificationPage";
import { SettingsPage } from "../../Features/Settings/View/SettingsPage";
import { AppMenu } from "./AppMenu";

export function AppRouter(): JSX.Element {
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main-content">
        <AppMenu />
        <IonPage id="main-content">
          <IonRouterOutlet>
            <Route exact path="/ocr">
              <ClassificationPage />
            </Route>
            <Route exact path="/about">
              <AboutPage />
            </Route>
            <Route exact path="/settings">
              <SettingsPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/ocr" />
            </Route>
          </IonRouterOutlet>
        </IonPage>
      </IonSplitPane>
    </IonReactRouter>
  );
}
