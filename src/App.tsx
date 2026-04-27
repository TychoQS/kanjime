import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonRouterOutlet
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { brush, informationCircleOutline, moon, phonePortrait, search, sunny, timeOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";

import { AboutScreen } from "./Features/About/AboutScreen";
import { ClassificationScreen } from "./Features/Classification/ClassificationScreen";
import { HistoryScreen } from "./Features/History/HistoryScreen";
import { KanjiDetailScreen } from "./Features/Kanji/KanjiDetailScreen";
import { SearchScreen } from "./Features/Search/SearchScreen";
import { LoadingScreenView } from "./Features/Shell/LoadingScreenView";
import { createCompositionRoot, type ApplicationPreferences, type CompositionRoot } from "./CompositionRoot";
import type { ApplicationTheme, NavigationPage } from "./Shared/DomainTypes";
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, THEME_LABELS, normalizeLocale, translate } from "./Shared/I18n";

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
    void root.initialize().then(nextPreferences => {
      if (isMounted) {
        setPreferences(nextPreferences);
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

  const updatePreferences = async (nextPreferences: ApplicationPreferences): Promise<void> => {
    props.onPreferencesChanged(nextPreferences);
    await props.root.savePreferences(nextPreferences);
  };

  const navigateTo = async (path: string): Promise<void> => {
    const menu = document.querySelector("ion-menu");

    if (menu !== null) {
      await (menu as HTMLIonMenuElement).close();
    }

    history.push(path);
  };

  return (
    <>
      <IonMenu contentId="main-content" side="start" type="overlay" data-testid="app-menu">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{translate(props.preferences.language, "navigation")}</IonTitle>
            <IonButtons slot="end">
              <IonButton
                data-testid="theme-cycle-button"
                onClick={() => void updatePreferences({
                  ...props.preferences,
                  theme: nextTheme(props.preferences.theme)
                })}
                aria-label={translate(props.preferences.language, "changeTheme")}
              >
                <IonIcon icon={themeIcon(props.preferences.theme)} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent scrollY={false}>
          <div className="menu-shell">
            <IonList lines="none" className="menu-list">
              <MenuItem
                currentPage={currentPage}
                icon={brush}
                id="classification"
                label={translate(props.preferences.language, "recognition")}
                onSelected={() => void navigateTo("/classification")}
              />
              <MenuItem
                currentPage={currentPage}
                icon={search}
                id="search"
                label={translate(props.preferences.language, "search")}
                onSelected={() => void navigateTo("/search")}
              />
              <MenuItem
                currentPage={currentPage}
                icon={timeOutline}
                id="history"
                label={translate(props.preferences.language, "history")}
                onSelected={() => void navigateTo("/history")}
              />
              <MenuItem
                currentPage={currentPage}
                icon={informationCircleOutline}
                id="about"
                label={translate(props.preferences.language, "about")}
                onSelected={() => void navigateTo("/about")}
              />
            </IonList>

            <div className="menu-settings" data-testid="menu-settings">
              <IonSelect
                interface="popover"
                label={translate(props.preferences.language, "activeLanguage")}
                value={props.preferences.language}
                onIonChange={event => void updatePreferences({
                  ...props.preferences,
                  language: normalizeLocale(String(event.detail.value))
                })}
              >
                {SUPPORTED_LOCALES.map(locale => (
                  <IonSelectOption key={locale} value={locale}>
                    {LANGUAGE_NAMES[locale]}
                  </IonSelectOption>
                ))}
              </IonSelect>
              <IonSelect
                interface="popover"
                label={translate(props.preferences.language, "activeTheme")}
                value={props.preferences.theme}
                onIonChange={event => void updatePreferences({
                  ...props.preferences,
                  theme: toApplicationTheme(event.detail.value)
                })}
              >
                {(["system", "light", "dark"] as const).map(theme => (
                  <IonSelectOption key={theme} value={theme}>
                    {THEME_LABELS[theme]}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
        </IonContent>
      </IonMenu>

      <IonRouterOutlet id="main-content">
        <Route exact path="/">
          <Redirect to="/classification" />
        </Route>
        <Route exact path="/classification">
          <ClassificationScreen root={props.root} language={props.preferences.language} />
        </Route>
        <Route exact path="/search">
          <SearchScreen root={props.root} language={props.preferences.language} />
        </Route>
        <Route exact path="/history">
          <HistoryScreen root={props.root} language={props.preferences.language} />
        </Route>
        <Route exact path="/about">
          <AboutScreen root={props.root} language={props.preferences.language} />
        </Route>
        <Route exact path="/kanji/:character">
          <KanjiDetailScreen root={props.root} language={props.preferences.language} />
        </Route>
      </IonRouterOutlet>
    </>
  );
}

interface MenuItemProps {
  readonly currentPage: NavigationPage;
  readonly icon: string;
  readonly id: NavigationPage;
  readonly label: string;
  readonly onSelected: () => void;
}

function MenuItem(props: MenuItemProps): JSX.Element {
  return (
    <IonItem
      button
      data-testid={`menu-item-${props.id}`}
      detail={false}
      onClick={props.onSelected}
      className={props.currentPage === props.id ? "menu-item-active" : ""}
    >
      <IonIcon icon={props.icon} slot="start" />
      <IonLabel>{props.label}</IonLabel>
    </IonItem>
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
