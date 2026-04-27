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
  IonTitle,
  IonToolbar,
  IonRouterOutlet
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { moon, phonePortrait, sunny } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";

import { AboutScreen } from "./Features/About/AboutScreen";
import { ClassificationScreen } from "./Features/Classification/ClassificationScreen";
import { HistoryScreen } from "./Features/History/HistoryScreen";
import { KanjiDetailScreen } from "./Features/Kanji/KanjiDetailScreen";
import { SearchScreen } from "./Features/Search/SearchScreen";
import { LoadingScreenView } from "./Features/Shell/LoadingScreenView";
import { NavigationView } from "./Features/Shell/NavigationView";
import { createCompositionRoot, type ApplicationPreferences, type CompositionRoot } from "./CompositionRoot";
import type { ApplicationTheme, NavigationPage } from "./Shared/DomainTypes";
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, THEME_LABELS, normalizeLocale, translate, type TranslationKey } from "./Shared/I18n";

import "./Theme/Variables.css";

const DEFAULT_PREFERENCES: ApplicationPreferences = {
  language: "en-US",
  theme: "system"
};

/**
 * Application root with Ionic routing, sidebar navigation, preferences, and startup loading.
 */
function App(): JSX.Element {
  const root = useMemo(() => createCompositionRoot(), []);
  const [preferences, setPreferences] = useState<ApplicationPreferences>(DEFAULT_PREFERENCES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    root.registerPreferenceDelegate(nextPreferences => {
      if (isMounted) {
        setPreferences(nextPreferences);
      }
    });

    void root.initialize().then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [root]);

  useEffect(() => {
    document.documentElement.lang = preferences.language;
    document.documentElement.dataset.theme = resolveEffectiveTheme(preferences.theme);
  }, [preferences]);

  if (!isReady) {
    return (
      <IonApp data-theme={resolveEffectiveTheme(preferences.theme)}>
        <LoadingScreenView
          blocksInteraction
          isVisible
          message={translate(preferences.language, "loadingModel")}
        />
      </IonApp>
    );
  }

  return (
    <IonApp data-theme={resolveEffectiveTheme(preferences.theme)}>
      <IonReactRouter>
        <AppShell
          preferences={preferences}
          root={root}
          onPreferencesChanged={setPreferences}
        />
      </IonReactRouter>
    </IonApp>
  );
}

interface AppShellProps {
  readonly root: CompositionRoot;
  readonly preferences: ApplicationPreferences;
  readonly onPreferencesChanged: (preferences: ApplicationPreferences) => void;
}

function AppShell(props: AppShellProps): JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const currentPage = getCurrentPage(location.pathname);

  useEffect(() => {
    props.root.registerNavigationDelegate(page => {
      const paths: Record<NavigationPage, string> = {
        classification: "/classification",
        search: "/search",
        history: "/history",
        about: "/about",
        kanjiEntry: "/classification"
      };

      const menu = document.querySelector("ion-menu");
      if (menu !== null) {
        void (menu as HTMLIonMenuElement).close();
      }

      history.push(paths[page]);
    });
  }, [props.root, history]);

  return (
    <>
      <IonMenu contentId="main-content" side="start" type="overlay" data-testid="app-menu">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start" style={{ marginLeft: "8px" }}>
              <IonSelect
                interface="action-sheet"
                value={props.preferences.language}
                onIonChange={event => props.root.userPreferenceController.setLanguage(normalizeLocale(String(event.detail.value)))}
                style={{ maxWidth: "200px" }}
              >
                {SUPPORTED_LOCALES.map(locale => (
                  <IonSelectOption key={locale} value={locale}>
                    {LANGUAGE_NAMES[locale]}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonButtons>
            <IonButtons slot="end" style={{ marginRight: "8px" }}>
              <IonButton
                data-testid="theme-cycle-button"
                onClick={() => props.root.userPreferenceController.setTheme(nextTheme(props.preferences.theme))}
                aria-label={translate(props.preferences.language, "changeTheme")}
              >
                <IonIcon icon={themeIcon(props.preferences.theme)} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent scrollY={false}>
          <div className="menu-shell">
            <NavigationView
              availablePages={props.root.navigationController.availablePageIds.map(id => ({
                id,
                label: translate(props.preferences.language, getPageKey(id) as TranslationKey)
              }))}
              currentPage={currentPage}
              isMenuOpen={true}
              onCloseRequested={() => {
                const menu = document.querySelector("ion-menu");
                if (menu !== null) {
                  void (menu as HTMLIonMenuElement).close();
                }
              }}
              onNavigateRequested={page => props.root.navigationController.navigateTo(page)}
            />
          </div>
        </IonContent>
      </IonMenu>

      <IonRouterOutlet id="main-content">
        <Route exact path="/">
          <Redirect to="/classification" />
        </Route>
        <Route exact path="/classification">
          <ClassificationScreen root={props.root} historyController={props.root.historyController} language={props.preferences.language} />
        </Route>
        <Route exact path="/search">
          <SearchScreen searchController={props.root.searchController} language={props.preferences.language} />
        </Route>
        <Route exact path="/history">
          <HistoryScreen historyController={props.root.historyController} language={props.preferences.language} />
        </Route>
        <Route exact path="/about">
          <AboutScreen aboutController={props.root.aboutController} language={props.preferences.language} />
        </Route>
        <Route exact path="/kanji/:character">
          <KanjiDetailScreen root={props.root} language={props.preferences.language} />
        </Route>
      </IonRouterOutlet>
    </>
  );
}

function getPageKey(page: NavigationPage): string {
  switch (page) {
    case "classification":
      return "recognition";
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

function toApplicationTheme(value: unknown): ApplicationTheme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function resolveEffectiveTheme(theme: ApplicationTheme): "light" | "dark" {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default App;
