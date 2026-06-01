import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  IonRouterOutlet
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { moon, phonePortrait, sunny } from "ionicons/icons";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";

import { AboutScreen } from "./Features/About/AboutScreen";
import {
  CalligraphyScreen,
  CalligraphyCategoryScreen,
  CalligraphyPracticeScreen
} from "./Features/Calligraphy/CalligraphyScreen";
import { ClassificationScreen } from "./Features/Classification/ClassificationScreen";
import { HistoryScreen } from "./Features/History/HistoryScreen";
import { KanjiDetailScreen } from "./Features/Kanji/KanjiDetailScreen";
import { AppViewModelProvider, useAppViewModelContext } from "./Shared/AppViewModelContext";
import { ErrorBoundary } from "./Features/Error/View/ErrorBoundary";
import { SearchScreen } from "./Features/Search/SearchScreen";
import { LoadingScreenView } from "./Features/Shell/LoadingScreenView";
import { NavigationView } from "./Features/Shell/NavigationView";
import { UpdateAvailableView } from "./Features/Version/View/UpdateAvailableView";
import { createCompositionRoot } from "./CompositionRoot";
import type { ApplicationTheme, UpdateAvailabilityState } from "@kanjime/shared";
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, normalizeLocale, translate, type TranslationKey } from "./Shared/I18n";

/**
 * Application root with Ionic routing, sidebar navigation, preferences, and startup loading.
 */
function App(): JSX.Element {
  const root = useMemo(() => createCompositionRoot(), []);

  return (
    <IonReactRouter>
      <AppViewModelProvider root={root}>
        <ErrorBoundary captureUnexpectedError={error => root.captureUnexpectedError(error)}>
          <AppRoot />
        </ErrorBoundary>
      </AppViewModelProvider>
    </IonReactRouter>
  );
}

function AppRoot(): JSX.Element {
  const { preferences } = useAppViewModelContext();

  useLayoutEffect(() => {
    document.documentElement.lang = preferences.preferences.language;
    document.documentElement.dataset.theme = resolveEffectiveTheme(preferences.preferences.theme);
  }, [preferences.preferences]);

  if (!preferences.isReady) {
    return (
      <IonApp data-theme={resolveEffectiveTheme(preferences.preferences.theme)}>
        <LoadingScreenView
          blocksInteraction
          isVisible
          message={translate(preferences.preferences.language, "loadingModel")}
        />
      </IonApp>
    );
  }

  return (
    <IonApp data-theme={resolveEffectiveTheme(preferences.preferences.theme)}>
      <AppShell />
    </IonApp>
  );
}

function AppShell(): JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const currentPage = getCurrentPage(location.pathname);
  const { preferences, root } = useAppViewModelContext();
  const [updateAvailability, setUpdateAvailability] = useState<UpdateAvailabilityState>(createHiddenUpdateState());

  useEffect(() => {
    let isMounted = true;

    void root.checkForAvailableUpdate().then(nextState => {
      if (isMounted) {
        setUpdateAvailability(nextState);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [root]);

  useEffect(() => {
    root.registerNavigationDelegate((page, character) => {
      const realPage = page === "kanjiEntry" && character === undefined ? "classification" : page;
      root.recordUserAction({
        type: "navigation:opened",
        page: realPage,
        occurredAt: new Date().toISOString()
      });
      const menu = document.querySelector("ion-menu");
      if (menu !== null) {
        void (menu as HTMLIonMenuElement).close();
      }

      if (page === "kanjiEntry" && character !== undefined) {
        history.push(`/kanji/${encodeURIComponent(character)}`);
        return;
      }

      const paths: Record<string, string> = {
        classification: "/classification",
        calligraphy: "/calligraphy",
        search: "/search",
        history: "/history",
        about: "/about",
        kanjiEntry: "/classification"
      };

      history.push(paths[page]);
    });
  }, [history, root]);

  return (
    <>
      <IonMenu
        contentId="main-content"
        side="start"
        type="overlay"
        data-testid="app-menu"
        onIonDidOpen={() => {
          root.recordUserAction({
            type: "navigation:menu-opened",
            occurredAt: new Date().toISOString()
          });
        }}
        onIonDidClose={() => {
          root.recordUserAction({
            type: "navigation:menu-closed",
            occurredAt: new Date().toISOString()
          });
        }}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start" className="toolbar-start-controls">
              <IonSelect
                className="language-select"
                interface="action-sheet"
                value={preferences.preferences.language}
                onIonChange={event => preferences.setLanguage(normalizeLocale(String(event.detail.value)))}
              >
                {SUPPORTED_LOCALES.map(locale => (
                  <IonSelectOption key={locale} value={locale}>
                    {LANGUAGE_NAMES[locale]}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonButtons>
            <IonButtons slot="end" className="toolbar-end-controls">
              <IonButton
                data-testid="theme-cycle-button"
                onClick={() => preferences.setTheme(nextTheme(preferences.preferences.theme))}
                aria-label={translate(preferences.preferences.language, "changeTheme")}
              >
                <IonIcon icon={themeIcon(preferences.preferences.theme)} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent scrollY={false}>
          <div className="menu-shell">
            <NavigationView
              availablePages={root.navigationController.availablePageIds.map(id => ({
                id,
                label: translate(preferences.preferences.language, getPageKey(id) as TranslationKey)
              }))}
              currentPage={currentPage}
              isMenuOpen={true}
              onCloseRequested={() => {
                const menu = document.querySelector("ion-menu");
                if (menu !== null) {
                  void (menu as HTMLIonMenuElement).close();
                }
              }}
              onNavigateRequested={page => {
                root.navigationController.navigateTo(page);
              }}
            />
          </div>
        </IonContent>
      </IonMenu>

      <UpdateAvailableView
        isVisible={updateAvailability.isVisible}
        message={translate(preferences.preferences.language, "updateAvailable")}
        currentVersion={updateAvailability.currentVersion}
        latestVersion={updateAvailability.latestVersion}
        canContinueUsingApplication={updateAvailability.canContinueUsingApplication}
        onDismissRequested={() => setUpdateAvailability(createHiddenUpdateState())}
      />

      <IonRouterOutlet id="main-content">
        <Route exact path="/">
          <Redirect to="/classification" />
        </Route>
        <Route exact path="/classification">
          <ClassificationScreen />
        </Route>
        <Route exact path="/calligraphy">
          <CalligraphyScreen />
        </Route>
        <Route exact path="/calligraphy/category/:categoryId">
          <CalligraphyCategoryScreen />
        </Route>
        <Route exact path="/calligraphy/practice/:character">
          <CalligraphyPracticeScreen />
        </Route>
        <Route exact path="/search">
          <SearchScreen />
        </Route>
        <Route exact path="/history">
          <HistoryScreen />
        </Route>
        <Route exact path="/about">
          <AboutScreen />
        </Route>
        <Route exact path="/kanji/:character">
          <KanjiDetailScreen />
        </Route>
      </IonRouterOutlet>
    </>
  );
}

function getPageKey(page: string): string {
  switch (page) {
    case "classification":
      return "recognition";
    case "calligraphy":
      return "calligraphy";
    case "search":
      return "search";
    case "history":
      return "history";
    case "about":
      return "about";
    default:
      return "";
  }
}

function getCurrentPage(
  pathname: string
): "classification" | "search" | "history" | "about" | "kanjiEntry" | "calligraphy" {
  if (pathname.startsWith("/calligraphy")) {
    return "calligraphy";
  }

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

function nextTheme(theme: ApplicationTheme): ApplicationTheme {
  if (theme === "system") {
    return "light";
  }

  return theme === "light" ? "dark" : "system";
}

function themeIcon(theme: ApplicationTheme): string {
  if (theme === "light") {
    return sunny;
  }

  if (theme === "dark") {
    return moon;
  }

  return phonePortrait;
}

function createHiddenUpdateState(): UpdateAvailabilityState {
  return {
    isVisible: false,
    currentVersion: "",
    latestVersion: "",
    message: "",
    canContinueUsingApplication: true
  };
}



function resolveEffectiveTheme(theme: ApplicationTheme): "light" | "dark" {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default App;
