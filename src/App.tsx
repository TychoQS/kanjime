import {
  IonApp,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonSelect,
  IonSelectOption,
  IonSplitPane,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";

import { ApplicationProvider } from "./ApplicationContext";
import { createApplicationComposition } from "./CompositionRoot";
import { AboutScreen } from "./Features/About/AboutScreen";
import { ClassificationScreen } from "./Features/Classification/ClassificationScreen";
import { HistoryScreen } from "./Features/History/HistoryScreen";
import { KanjiEntryScreen } from "./Features/Kanji/KanjiEntryScreen";
import { LoadingScreenView } from "./Features/Shell/LoadingScreenView";
import { SearchScreen } from "./Features/Search/SearchScreen";
import type { ApplicationTheme, NavigationPage } from "./Shared/DomainTypes";
import { createTranslator, I18nProvider, useI18n } from "./Shared/I18n/I18nContext";
import { resolveSupportedLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "./Shared/I18n/Translations";

const ROUTES: ReadonlyArray<{ path: string; page: NavigationPage; labelKey: "ocr" | "search" | "history" | "about" }> = [
  { path: "/classification", page: "classification", labelKey: "ocr" },
  { path: "/search", page: "search", labelKey: "search" },
  { path: "/history", page: "history", labelKey: "history" },
  { path: "/about", page: "about", labelKey: "about" }
];
const IonReactRouterWithChildren = IonReactRouter as React.ComponentType<
  React.PropsWithChildren<React.ComponentProps<typeof IonReactRouter>>
>;

/**
 * Root application component.
 */
function App(): JSX.Element {
  const composition = useMemo(() => createApplicationComposition(), []);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguageState] = useState<SupportedLanguage>("en-US");
  const [theme, setThemeState] = useState<ApplicationTheme>("system");
  const languageRef = useRef<SupportedLanguage>(language);
  const themeRef = useRef<ApplicationTheme>(theme);
  const t = useMemo(() => createTranslator(language), [language]);
  const preferenceController = useMemo(() => composition.createUserPreferenceController(
    nextLanguage => {
      const supportedLanguage = resolveSupportedLanguage(nextLanguage);
      languageRef.current = supportedLanguage;
      setLanguageState(supportedLanguage);
      void composition.userDataRepository.savePreferences(supportedLanguage, themeRef.current);
    },
    nextTheme => {
      themeRef.current = nextTheme;
      setThemeState(nextTheme);
      void composition.userDataRepository.savePreferences(languageRef.current, nextTheme);
    }
  ), [composition]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    let isActive = true;

    async function initialize(): Promise<void> {
      await composition.userDataRepository.initialize();
      const preferences = await composition.userDataRepository.loadPreferences();
      const supportedLanguage = resolveSupportedLanguage(preferences.language);

      if (isActive) {
        languageRef.current = supportedLanguage;
        themeRef.current = preferences.theme;
        setLanguageState(supportedLanguage);
        setThemeState(preferences.theme);
      }

      await composition.modelLoaderController.loadModel();

      if (isActive) {
        setIsReady(true);
      }
    }

    void initialize().catch(() => {
      if (isActive) {
        setIsReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [composition]);

  const i18nValue = useMemo(() => ({
    language,
    theme,
    setLanguage: (nextLanguage: SupportedLanguage): void => preferenceController.setLanguage(nextLanguage),
    setTheme: (nextTheme: ApplicationTheme): void => preferenceController.setTheme(nextTheme),
    t
  }), [language, preferenceController, t, theme]);

  return (
    <ApplicationProvider value={composition}>
      <I18nProvider value={i18nValue}>
        <IonApp data-theme={theme} data-testid="app-root">
          {!isReady ? (
            <LoadingScreenView
              isVisible
              blocksInteraction
              message={t("loadingModel")}
            />
          ) : (
            <IonReactRouterWithChildren>
              <ApplicationShell />
            </IonReactRouterWithChildren>
          )}
        </IonApp>
      </I18nProvider>
    </ApplicationProvider>
  );
}

function ApplicationShell(): JSX.Element {
  const { language, setLanguage, setTheme, t, theme } = useI18nShell();
  const location = useLocation();
  const history = useHistory();
  const currentPage = getCurrentPage(location.pathname);

  async function navigateFromMenu(path: string): Promise<void> {
    history.push(path);
    const menu = document.querySelector("ion-menu") as HTMLIonMenuElement | null;
    await menu?.close();
  }

  return (
    <IonSplitPane contentId="main-content" data-testid="shell-navigation">
      <IonMenu contentId="main-content" menuId="main-menu" type="overlay" data-testid="sidebar-menu">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t("navigation")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList data-testid="sidebar-navigation-list">
            {ROUTES.map(route => (
              <IonItem
                key={route.page}
                button
                data-testid={`sidebar-link-${route.page}`}
                routerDirection="root"
                onClick={() => void navigateFromMenu(route.path)}
                detail={false}
                color={currentPage === route.page ? "primary" : undefined}
              >
                <IonLabel>{t(route.labelKey)}</IonLabel>
              </IonItem>
            ))}
          </IonList>
          <IonList data-testid="sidebar-preferences">
            <IonItem>
              <IonLabel>{t("language")}</IonLabel>
              <IonSelect
                data-testid="language-select"
                value={language}
                interface="popover"
                onIonChange={event => {
                  const value = String(event.detail.value);
                  setLanguage(resolveSupportedLanguage(value));
                }}
              >
                {SUPPORTED_LANGUAGES.map(candidate => (
                  <IonSelectOption key={candidate} value={candidate}>
                    {candidate}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>{t("theme")}</IonLabel>
              <IonSelect
                data-testid="theme-select"
                value={theme}
                interface="popover"
                onIonChange={event => {
                  const value = String(event.detail.value);

                  if (value === "light" || value === "dark" || value === "system") {
                    setTheme(value);
                  }
                }}
              >
                <IonSelectOption value="system">{t("system")}</IonSelectOption>
                <IonSelectOption value="light">{t("light")}</IonSelectOption>
                <IonSelectOption value="dark">{t("dark")}</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonRouterOutlet id="main-content" data-testid="main-router-outlet">
        <Route exact path="/">
          <Redirect to="/classification" />
        </Route>
        <Route exact path="/classification">
          <RoutedPage title={t("ocr")}>
            <ClassificationScreen />
          </RoutedPage>
        </Route>
        <Route exact path="/search">
          <RoutedPage title={t("search")}>
            <SearchScreen />
          </RoutedPage>
        </Route>
        <Route exact path="/history">
          <RoutedPage title={t("history")}>
            <HistoryScreen />
          </RoutedPage>
        </Route>
        <Route exact path="/about">
          <RoutedPage title={t("about")}>
            <AboutScreen />
          </RoutedPage>
        </Route>
        <Route exact path="/kanji/:character">
          <RoutedPage title={t("kanjiDetail")}>
            <KanjiEntryScreen />
          </RoutedPage>
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
}

function RoutedPage(props: { readonly title: string; readonly children: React.ReactNode }): JSX.Element {
  const { t } = useI18nShell();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton data-testid="open-menu-button" aria-label={t("openMenu")} menu="main-menu" />
          </IonButtons>
          <IonTitle>{props.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      {props.children}
    </IonPage>
  );
}

function getCurrentPage(pathname: string): NavigationPage {
  if (pathname.startsWith("/search")) {
    return "search";
  }

  if (pathname.startsWith("/history")) {
    return "history";
  }

  if (pathname.startsWith("/about")) {
    return "about";
  }

  if (pathname.startsWith("/kanji")) {
    return "kanjiEntry";
  }

  return "classification";
}

function useI18nShell() {
  return useI18n();
}

export default App;
