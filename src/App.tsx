import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IonApp, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,
  IonLabel, IonPage, IonRouterOutlet, IonSegment, IonSegmentButton, IonSpinner,
  IonText, IonTitle, IonToast, IonToolbar
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, useHistory, useLocation, useParams } from "react-router-dom";

import { CanvasInputView } from "./Features/Classification/Canvas/CanvasInputView";
import { ImageView } from "./Features/Classification/Image/ImageView";
import { InferenceListView } from "./Features/Classification/Inference/InferenceListView";
import { HistoryView } from "./Features/History/HistoryView";
import { KanjiEntryView } from "./Features/Kanji/KanjiEntryView";
import { SearchResultView } from "./Features/Search/SearchResultView";
import { LoadingScreenView } from "./Features/Shell/LoadingScreenView";
import { createCompositionRoot, type ApplicationCompositionRoot } from "./CompositionRoot";
import type {
  CharacterSummary, DetailedKanjiEntry, HistoryGroup,
  ImageState, InferencePrediction, NavigationPage, Stroke
} from "./Shared/DomainTypes";

let compositionRootPromise: Promise<ApplicationCompositionRoot> | null = null;

/**
 * Returns the single application composition root for this browser session.
 *
 * @pre The packaged assets needed by the app are available.
 * @post The same composition root promise is reused across React remounts.
 */
function getCompositionRoot(): Promise<ApplicationCompositionRoot> {
  if (compositionRootPromise === null) {
    compositionRootPromise = createCompositionRoot();
  }
  return compositionRootPromise;
}

/**
 * Application root component.
 */
function App(): JSX.Element {
  const [root, setRoot] = useState<ApplicationCompositionRoot | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [startupError, setStartupError] = useState("");

  useEffect(() => {
    let isActive = true;
    void getCompositionRoot()
      .then(async nextRoot => {
        if (isActive) { setRoot(nextRoot); }
        await nextRoot.modelLoader.loadModel();
      })
      .then(() => { if (isActive) { setIsLoadingModel(false); } })
      .catch(() => {
        if (isActive) {
          setStartupError("The character identifier could not be loaded.");
          setIsLoadingModel(false);
        }
      });
    return () => { isActive = false; };
  }, []);

  if (root === null || isLoadingModel) {
    return (
      <IonApp>
        <LoadingScreenView blocksInteraction isVisible message="Loading character identifier..." />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <ApplicationRoutes root={root} startupError={startupError} />
      </IonReactRouter>
    </IonApp>
  );
}

interface ApplicationRoutesProps {
  readonly root: ApplicationCompositionRoot;
  readonly startupError: string;
}

/**
 * Route tree for the mobile application shell.
 *
 * @pre A composition root has been created.
 * @post Every feature screen is reachable through a URL route.
 */
function ApplicationRoutes(props: ApplicationRoutesProps): JSX.Element {
  const history = useHistory();
  const [toastMessage, setToastMessage] = useState(props.startupError);

  useEffect(() => {
    props.root.setNavigationHandlers({
      navigateToKanjiEntry(character): void { history.push(`/kanji/${encodeURIComponent(character)}`); },
      navigateBack(): void { history.goBack(); },
      navigateToPage(page): void { history.push(resolvePagePath(page)); }
    });
  }, [history, props.root]);

  useEffect(() => {
    if (props.startupError.length > 0) { setToastMessage(props.startupError); }
  }, [props.startupError]);

  const reportError = useCallback((message: string): void => { setToastMessage(message); }, []);

  return (
    <>
      <IonRouterOutlet>
        <Route exact path="/ocr/image">
          <OcrPage mode="image" onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/ocr/drawing">
          <OcrPage mode="drawing" onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/search">
          <SearchPage onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/history">
          <HistoryPage onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/about">
          <AboutPage onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/kanji/:character">
          <KanjiPage onError={reportError} root={props.root} />
        </Route>
        <Route exact path="/">
          <Redirect to="/ocr/image" />
        </Route>
      </IonRouterOutlet>
      <IonToast
        data-testid="app-error-toast"
        duration={2600}
        isOpen={toastMessage.length > 0}
        message={toastMessage}
        onDidDismiss={() => setToastMessage("")}
      />
    </>
  );
}

interface PageProps {
  readonly root: ApplicationCompositionRoot;
  readonly onError: (message: string) => void;
}

interface OcrPageProps extends PageProps {
  readonly mode: "image" | "drawing";
}

/** OCR page for image and drawing modes. */
function OcrPage(props: OcrPageProps): JSX.Element {
  const { mode, onError, root } = props;
  const [imageState, setImageState] = useState<ImageState>(() => root.image.getImageState());
  const [strokes, setStrokes] = useState<ReadonlyArray<Stroke>>(() => root.canvas.getStrokeHistory());
  const [results, setResults] = useState<ReadonlyArray<InferencePrediction>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { root.classification.activateMode(mode); }, [mode, root]);

  const visibleResults = useMemo(() => results.map(p => ({
    character: p.character, primaryReadings: [] as string[], levels: [] as string[], isSelected: false
  })), [results]);

  const refreshVisibleResults = useCallback((): void => {
    try {
      const nextResults = root.displayInferences.getVisibleResults();
      setResults(nextResults.map(s => ({ character: s.character, confidence: 1, strokeCount: 0 })));
    } catch { setResults([]); }
  }, [root]);

  const classifyImage = useCallback(async (image: ImageState["image"]): Promise<void> => {
    if (image === null) { return; }
    setIsProcessing(true);
    try {
      const sourceId = `image:${image.uri}`;
      const predictions = await root.inference.classifyFullImage({ sourceId, sourceUri: image.uri });
      root.displayInferences.updateResultsFromImageSource(sourceId, predictions);
      refreshVisibleResults();
    } catch { onError("An unexpected error occurred and the character could not be identified."); }
    finally { setIsProcessing(false); }
  }, [onError, refreshVisibleResults, root]);

  const captureImage = useCallback(async (): Promise<void> => {
    try {
      const image = await root.photo.capturePhoto();
      if (image === null || image.uri.trim().length === 0 || image.width <= 0 || image.height <= 0) {
        onError("The selected image could not be opened."); return;
      }
      root.image.setImage(image);
      const nextImageState = root.image.getImageState();
      setImageState(nextImageState);
      await classifyImage(nextImageState.image);
    } catch { onError("The selected image could not be opened."); }
  }, [classifyImage, onError, root]);

  const pickImage = useCallback(async (): Promise<void> => {
    try {
      const image = await root.photo.pickPhotoFromLibrary();
      if (image === null || image.uri.trim().length === 0 || image.width <= 0 || image.height <= 0) {
        onError("The selected image could not be opened."); return;
      }
      root.image.setImage(image);
      const nextImageState = root.image.getImageState();
      setImageState(nextImageState);
      await classifyImage(nextImageState.image);
    } catch { onError("The selected image could not be opened."); }
  }, [classifyImage, onError, root]);

  const clearImage = useCallback((): void => {
    root.image.clearImage(); setImageState(root.image.getImageState()); setResults([]);
  }, [root]);

  const commitStroke = useCallback((stroke: Stroke): void => {
    setIsProcessing(true);
    void root.canvas.registerStroke(stroke)
      .then(() => {
        const predictions = root.getLastDrawingPredictions();
        root.displayInferences.updateResultsFromDrawingInference(predictions);
        setStrokes(root.canvas.getStrokeHistory());
        refreshVisibleResults();
      })
      .catch(() => onError("Draw at least one stroke before identifying a character."))
      .finally(() => setIsProcessing(false));
  }, [onError, refreshVisibleResults, root]);

  const clearDrawing = useCallback((): void => {
    try { root.canvas.clearCanvas(); setStrokes([]); setResults([]); }
    catch { onError("There is no drawing to clear."); }
  }, [onError, root]);

  const openResult = useCallback((character: string): void => {
    void root.displayInferences.openKanjiEntry(character)
      .catch(() => onError("Select a result before opening details."));
  }, [onError, root]);

  return (
    <IonPage data-testid={`ocr-${mode}-page`}>
      <PageHeader title={mode === "image" ? "Image OCR" : "Drawing OCR"} />
      <IonContent fullscreen>
        <main className="ion-padding" data-testid={`ocr-${mode}-content`}>
          <ModeSwitcher activeMode={mode} root={root} />
          {mode === "image" ? (
            <section data-testid="ocr-image-controls">
              <IonButton data-testid="capture-image-button" expand="block" onClick={() => void captureImage()}>
                Take Photo
              </IonButton>
              <IonButton data-testid="pick-image-button" expand="block" fill="outline" onClick={() => void pickImage()}>
                Choose Image
              </IonButton>
              <ImageView
                image={imageState.image ? {
                  uri: imageState.image.uri, width: imageState.image.width,
                  height: imageState.image.height, altText: "Selected kanji source"
                } : null}
                isProcessing={isProcessing}
                onClearImage={clearImage}
              />
            </section>
          ) : (
            <section data-testid="ocr-drawing-controls">
              <CanvasInputView
                backgroundColor="var(--ion-color-step-950, #000000)"
                isDrawingEnabled
                onClearRequested={clearDrawing}
                onStrokeCommitted={commitStroke}
                strokeColor="var(--ion-color-step-50, #ffffff)"
                strokes={strokes}
              />
            </section>
          )}
          <ProcessingIndicator isProcessing={isProcessing} />
          {visibleResults.length > 0 ? (
            <InferenceListView onResultSelected={openResult} results={visibleResults} />
          ) : (
            <p data-testid="ocr-empty-results">No results are available.</p>
          )}
        </main>
      </IonContent>
      <PrimaryNavigation />
    </IonPage>
  );
}

/** Search route. */
function SearchPage(props: PageProps): JSX.Element {
  const { onError, root } = props;
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<ReadonlyArray<CharacterSummary>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(async (nextTerm: string): Promise<void> => {
    setTerm(nextTerm);
    if (nextTerm.trim().length === 0) {
      void Promise.resolve(root.search.clearSearch()).catch(() => undefined);
      setResults([]); return;
    }
    setIsSearching(true);
    try { setResults(await root.search.search(nextTerm)); }
    catch { onError("The search could not be completed."); }
    finally { setIsSearching(false); }
  }, [onError, root]);

  const clearSearch = useCallback((): void => {
    void Promise.resolve(root.search.clearSearch()).catch(() => undefined);
    setTerm(""); setResults([]);
  }, [root]);

  const openResult = useCallback((character: string): void => {
    void root.search.openKanjiEntry(character).catch(() => onError("The character details could not be opened."));
  }, [onError, root]);

  return (
    <IonPage data-testid="search-page">
      <PageHeader title="Search" />
      <IonContent fullscreen>
        <main className="ion-padding" data-testid="search-content">
          <IonItem>
            <IonLabel position="stacked">Search term</IonLabel>
            <IonInput autocomplete="off" data-testid="search-input" name="kanji-search"
              onIonInput={event => { const value = String(event.detail.value ?? ""); void runSearch(value); }}
              placeholder="Kanji, reading, or meaning..." value={term} />
          </IonItem>
          <IonButton data-testid="search-clear-button" expand="block" fill="outline" onClick={clearSearch}>
            Clear Search
          </IonButton>
          <ProcessingIndicator isProcessing={isSearching} />
          {results.length > 0 ? (
            <section data-testid="search-results-list">
              {results.map(result => (
                <SearchResultView key={result.character} character={result.character}
                  levels={result.levels} mainReadings={result.primaryReadings} onSelected={openResult} />
              ))}
            </section>
          ) : (
            <p data-testid="search-empty-state">No search results are available.</p>
          )}
        </main>
      </IonContent>
      <PrimaryNavigation />
    </IonPage>
  );
}

/** History route. */
function HistoryPage(props: PageProps): JSX.Element {
  const { onError, root } = props;
  const [groups, setGroups] = useState<ReadonlyArray<HistoryGroup>>([]);

  useEffect(() => {
    void root.history.getEntriesByCategory()
      .then(nextGroups => setGroups(nextGroups.map(g => ({
        category: g.category,
        entries: g.entries.map(e => ({ ...e, summary: e.character }))
      }))))
      .catch(() => onError("The history could not be loaded."));
  }, [onError, root]);

  const openEntry = useCallback((character: string): void => {
    void root.history.openKanjiEntry(character).catch(() => onError("The character details could not be opened."));
  }, [onError, root]);

  return (
    <IonPage data-testid="history-page">
      <PageHeader title="History" />
      <HistoryView groups={groups} onEntrySelected={openEntry} />
      <PrimaryNavigation />
    </IonPage>
  );
}

/** About route. */
function AboutPage(props: PageProps): JSX.Element {
  const { onError, root } = props;
  const [items, setItems] = useState<ReadonlyArray<{ label: string; value: string }>>([]);

  useEffect(() => {
    void root.about.getAboutInformation().then(setItems)
      .catch(() => onError("Application information could not be loaded."));
  }, [onError, root]);

  return (
    <IonPage data-testid="about-page">
      <PageHeader title="About" />
      <IonContent fullscreen>
        <main className="ion-padding" data-testid="about-content">
          <dl data-testid="about-information-list">
            {items.map(item => (
              <div key={`${item.label}-${item.value}`} data-testid={`about-item-${item.label}`}>
                <dt>{item.label}</dt><dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </main>
      </IonContent>
      <PrimaryNavigation />
    </IonPage>
  );
}

/** Kanji detail route. */
function KanjiPage(props: PageProps): JSX.Element {
  const { onError, root } = props;
  const params = useParams<{ character: string }>();
  const character = decodeURIComponent(params.character);
  const [details, setDetails] = useState<DetailedKanjiEntry | null>(null);

  useEffect(() => {
    void root.kanji.getKanjiDetails(character)
      .then(async entry => {
        setDetails(entry);
        await root.history.saveEntry({ character: entry.character, category: "visitedEntry", createdAt: new Date().toISOString() });
      })
      .catch(() => onError("The character details could not be loaded."));
  }, [character, onError, root]);

  const copyCharacter = useCallback((): void => {
    void root.kanji.copyKanjiCharacter(character).catch(() => onError("The character could not be copied."));
  }, [character, onError, root]);

  const goBack = useCallback((): void => {
    try { root.kanji.returnToPreviousScreen(); } catch { onError("Open a character before going back."); }
  }, [onError, root]);

  if (details === null) {
    return (
      <IonPage data-testid="kanji-page">
        <PageHeader title="Kanji" />
        <IonContent fullscreen>
          <main className="ion-padding" data-testid="kanji-loading-state">
            <IonSpinner data-testid="kanji-loading-spinner" name="crescent" />
          </main>
        </IonContent>
      </IonPage>
    );
  }

  const levels = [
    ...(details.jlptLevel ? [`JLPT ${details.jlptLevel}`] : []),
    ...(details.joyoLevel ? [`Joyo ${details.joyoLevel}`] : [])
  ];

  return (
    <IonPage data-testid="kanji-page">
      <PageHeader title={details.character} />
      <KanjiEntryView canCopy canGoBack character={details.character}
        levels={levels}
        meanings={details.meanings ?? []}
        onBackRequested={goBack} onCopyRequested={copyCharacter}
        primaryReadings={[...(details.kunyomi ?? []), ...(details.onyomi ?? [])].slice(0, 4)}
      />
      <PrimaryNavigation />
    </IonPage>
  );
}

interface ModeSwitcherProps { readonly activeMode: "image" | "drawing"; readonly root: ApplicationCompositionRoot; }

/** OCR mode switcher. */
function ModeSwitcher(props: ModeSwitcherProps): JSX.Element {
  const history = useHistory();
  const switchMode = (mode: "image" | "drawing"): void => {
    props.root.toggleClassificationMode.switchMode(mode);
    history.push(mode === "image" ? "/ocr/image" : "/ocr/drawing");
  };
  return (
    <IonSegment data-testid="ocr-mode-segment" value={props.activeMode}>
      <IonSegmentButton data-testid="ocr-mode-image-button" onClick={() => switchMode("image")} value="image">
        <IonLabel>Image</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton data-testid="ocr-mode-drawing-button" onClick={() => switchMode("drawing")} value="drawing">
        <IonLabel>Drawing</IonLabel>
      </IonSegmentButton>
    </IonSegment>
  );
}

/** Small inline processing indicator. */
function ProcessingIndicator(props: { readonly isProcessing: boolean }): JSX.Element | null {
  if (!props.isProcessing) { return null; }
  return (
    <IonText data-testid="processing-indicator">
      <p aria-live="polite"><IonSpinner name="dots" /> Processing...</p>
    </IonText>
  );
}

/** Shared page header. */
function PageHeader(props: { readonly title: string }): JSX.Element {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle data-testid="page-title">{props.title}</IonTitle>
        <IonButtons slot="end">
          <IonButton data-testid="header-about-button" routerLink="/about">About</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}

/** Primary application navigation. */
function PrimaryNavigation(): JSX.Element {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <nav aria-label="Primary" data-testid="primary-navigation">
      <IonButton data-testid="nav-ocr-button" fill={currentPath.startsWith("/ocr") ? "solid" : "clear"} routerLink="/ocr/image">OCR</IonButton>
      <IonButton data-testid="nav-search-button" fill={currentPath === "/search" ? "solid" : "clear"} routerLink="/search">Search</IonButton>
      <IonButton data-testid="nav-history-button" fill={currentPath === "/history" ? "solid" : "clear"} routerLink="/history">History</IonButton>
      <IonButton data-testid="nav-about-button" fill={currentPath === "/about" ? "solid" : "clear"} routerLink="/about">About</IonButton>
    </nav>
  );
}

/** Resolves a navigation page to the matching route. */
function resolvePagePath(page: NavigationPage): string {
  if (page === "classification") { return "/ocr/image"; }
  if (page === "kanjiEntry") { return "/kanji/"; }
  return `/${page}`;
}

export default App;
