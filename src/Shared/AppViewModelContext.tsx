import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";

import type { CompositionRoot } from "../CompositionRoot";
import { useAboutScreenViewModel, type AboutScreenViewModel } from "../Features/About/ViewModel/AboutViewModel";
import {
  useCanvasInteractionViewModel,
  type CanvasInteractionViewModel
} from "../Features/Classification/Canvas/ViewModel/CanvasViewModel";
import {
  useClassificationScreenViewModel,
  type ClassificationScreenViewModel
} from "../Features/Classification/Mode/ViewModel/ClassificationViewModel";
import { useHistoryScreenViewModel, type HistoryScreenViewModel } from "../Features/History/ViewModel/HistoryViewModel";
import {
  useKanjiDetailScreenViewModel,
  type KanjiDetailScreenViewModel
} from "../Features/Kanji/ViewModel/DisplayKanjiViewModel";
import {
  useUserPreferenceAppViewModel,
  type UserPreferenceAppViewModel
} from "../Features/Preferences/ViewModel/UserPreferenceViewModel";
import { useSearchScreenViewModel, type SearchScreenViewModel } from "../Features/Search/ViewModel/SearchViewModel";

interface KanjiRouteParams {
  readonly character: string;
}

interface AppViewModelProviderProps {
  readonly root: CompositionRoot;
  readonly children: ReactNode;
}

/**
 * Shared application view-model slices exposed through the root context.
 *
 * @pre The provider is mounted inside the Ionic router and receives a composition root.
 * @inv Every screen reads view state from this single context tree instead of local component state.
 * @post Consumers receive stable feature slices backed by the existing controller layer.
 */
export interface AppViewModelContextValue {
  readonly root: CompositionRoot;
  readonly preferences: UserPreferenceAppViewModel;
  readonly about: AboutScreenViewModel;
  readonly search: SearchScreenViewModel;
  readonly history: HistoryScreenViewModel;
  readonly kanji: KanjiDetailScreenViewModel;
  readonly classification: ClassificationScreenViewModel;
  readonly canvasInteraction: CanvasInteractionViewModel;
}

const AppViewModelContext = createContext<AppViewModelContextValue | null>(null);

/**
 * Provides the root application view-model context.
 *
 * @pre The composition root has been created once for the current app lifetime.
 * @inv Feature slices remain centralized and are consumed through `useContext`.
 * @post Descendants can read every view-model slice without keeping duplicate local screen state.
 */
export function AppViewModelProvider(props: AppViewModelProviderProps): JSX.Element {
  const location = useLocation();
  const preferences = useUserPreferenceAppViewModel(props.root);
  const isReady = preferences.isReady;
  const canvasInteraction = useCanvasInteractionViewModel();
  const routeMatch = matchPath<KanjiRouteParams>(location.pathname, {
    path: "/kanji/:character",
    exact: true
  });
  const currentCharacter = routeMatch?.params.character
    ? decodeURIComponent(routeMatch.params.character)
    : null;
  const language = preferences.preferences.language;
  const isClassificationActive = location.pathname === "/classification";
  const isSearchActive = location.pathname === "/search";
  const isHistoryActive = location.pathname === "/history";

  const about = useAboutScreenViewModel(props.root.aboutController, language, isReady);
  const search = useSearchScreenViewModel(props.root.searchController, isReady && isSearchActive);
  const history = useHistoryScreenViewModel(props.root.historyController, isReady && isHistoryActive);
  const kanji = useKanjiDetailScreenViewModel(
    props.root.displayKanjiController,
    currentCharacter,
    language,
    location.key ?? location.pathname,
    isReady
  );
  const classification = useClassificationScreenViewModel({
    canvasController: props.root.canvasController,
    inferenceController: props.root.inferenceController,
    imageController: props.root.imageController,
    photoController: props.root.photoController,
    displayInferencesController: props.root.displayInferencesController,
    classificationController: props.root.classificationController,
    toggleClassificationModeController: props.root.toggleClassificationModeController,
    canvasInteraction
  }, isReady && isClassificationActive);

  const contextValue = useMemo<AppViewModelContextValue>(() => ({
    root: props.root,
    preferences,
    about,
    search,
    history,
    kanji,
    classification,
    canvasInteraction
  }), [about, canvasInteraction, classification, history, kanji, preferences, props.root, search]);

  return (
    <AppViewModelContext.Provider value={contextValue}>
      {props.children}
    </AppViewModelContext.Provider>
  );
}

import { InfrastructureError } from "./AppErrors";

/**
 * Reads the root application view-model context.
 *
 * @pre The caller is rendered under `AppViewModelProvider`.
 * @post The returned value exposes the centralized screen state and actions for all features.
 */
export function useAppViewModelContext(): AppViewModelContextValue {
  const contextValue = useContext(AppViewModelContext);

  if (contextValue === null) {
    throw new InfrastructureError("AppViewModelContext is only available inside AppViewModelProvider.");
  }

  return contextValue;
}
