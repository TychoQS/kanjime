import packageMetadata from "../package.json";

import { App as CapacitorApp } from "@capacitor/app";
import { Device } from "@capacitor/device";

import { CreateAboutController } from "./Features/About/CreateAboutController";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
import { CreateCalligraphyCanvasController } from "./Features/Calligraphy/CreateCalligraphyCanvasController";
import type { CalligraphyCanvasInterface } from "./Features/Calligraphy/Contracts/CalligraphyCanvasInterface";
import { CreateCalligraphyController } from "./Features/Calligraphy/CreateCalligraphyController";
import type { CalligraphyInterface } from "./Features/Calligraphy/Contracts/CalligraphyInterface";
import { CreateCalligraphyEvaluationController } from "./Features/Calligraphy/CreateCalligraphyEvaluationController";
import type { CalligraphyEvaluationInterface } from "./Features/Calligraphy/Contracts/CalligraphyEvaluationInterface";
import { CreateCategoryController } from "./Features/Calligraphy/CreateCategoryController";
import type { CategoryInterface } from "./Features/Calligraphy/Contracts/CategoryInterface";
import { CreateKanjiPracticeController } from "./Features/Calligraphy/CreateKanjiPracticeController";
import type { KanjiPracticeInterface } from "./Features/Calligraphy/Contracts/KanjiPracticeInterface";
import { evaluateCalligraphyAttempt } from "./Features/Calligraphy/Services/CalligraphyEvaluationService";
import { CreateCanvasController } from "./Features/Classification/Canvas/CreateCanvasController";
import type { CanvasInterface } from "./Features/Classification/Canvas/Contracts/CanvasInterface";
import { CreateImageController } from "./Features/Classification/Image/CreateImageController";
import type { ImageInterface } from "./Features/Classification/Image/Contracts/ImageInterface";
import { CreatePhotoController } from "./Features/Classification/Image/CreatePhotoController";
import type { PhotoInterface } from "./Features/Classification/Image/Contracts/PhotoInterface";
import { CreateDisplayInferencesController } from "./Features/Classification/Inference/CreateDisplayInferencesController";
import type { DisplayInferencesInterface } from "./Features/Classification/Inference/Contracts/DisplayInferencesInterface";
import { CreateInferenceController } from "./Features/Classification/Inference/CreateInferenceController";
import type { InferenceInterface } from "./Features/Classification/Inference/Contracts/InferenceInterface";
import { CreateModelLoaderController } from "./Features/Classification/Inference/CreateModelLoaderController";
import type { ModelLoaderInterface } from "./Features/Classification/Inference/Contracts/ModelLoaderInterface";
import { DRAWING_CANVAS_SIZE, MODEL_INPUT_SIZE } from "./Features/Classification/Inference/InferenceRuntimeConfig";
import { CreateClassificationController } from "./Features/Classification/Mode/CreateClassificationController";
import type { ClassificationInterface } from "./Features/Classification/Mode/Contracts/ClassificationInterface";
import { CreateToggleClassificationModeController } from "./Features/Classification/Mode/CreateToggleClassificationModeController";
import type { ToggleClassificationModeInterface } from "./Features/Classification/Mode/Contracts/ToggleClassificationModeInterface";
import { CreateHistoryController } from "./Features/History/CreateHistoryController";
import type { HistoryInterface } from "./Features/History/Contracts/HistoryInterface";
import { CreateDisplayKanjiController } from "./Features/Kanji/CreateDisplayKanjiController";
import type { DisplayKanjiInterface } from "./Features/Kanji/Contracts/DisplayKanjiInterface";
import { CreateUserPreferenceController } from "./Features/Preferences/CreateUserPreferenceController";
import type { UserPreferenceInterface } from "./Features/Preferences/Contracts/UserPreferenceInterface";
import { CreateErrorController } from "./Features/Error/CreateErrorController";
import type { ErrorInterface } from "./Features/Error/Contracts/ErrorInterface";
import { CreateErrorObservabilityController } from "./Features/Error/CreateErrorObservabilityController";
import type { ErrorObservabilityInterface } from "./Features/Error/Contracts/ErrorObservabilityInterface";
import { CreateSearchController } from "./Features/Search/CreateSearchController";
import type { SearchInterface } from "./Features/Search/Contracts/SearchInterface";
import { CreateNavigationController } from "./Features/Shell/CreateNavigationController";
import type { NavigationInterface } from "./Features/Shell/Contracts/NavigationInterface";
import { CreateUpdateAvailableController } from "./Features/Version/CreateUpdateAvailableController";
import type { UpdateAvailableInterface } from "./Features/Version/Contracts/UpdateAvailableInterface";
import { CreateVersionCheckController } from "./Features/Version/CreateVersionCheckController";
import type { VersionCheckInterface } from "./Features/Version/Contracts/VersionCheckInterface";
import { AppPersistence } from "./Shared/AppPersistence";
import type {
  AboutInformationItem,
  ApplicationErrorContext,
  ApplicationTheme,
  ApplicationUserAction,
  ClassificationMode,
  DetailedKanjiEntry,
  HistoryCategory,
  HistoryGroup,
  ModelConfiguration,
  NavigationPage,
  Stroke,
  UpdateAvailabilityState
} from "@kanjime/shared";
import { getMeaningLanguagePriority, normalizeLocale, translate, type SupportedLocale } from "./Shared/I18n";
import { KanjiRepository, type KanjiSummary, type SourceAttribution } from "./Shared/KanjiRepository";
import { OcrWorkerClient } from "./Shared/OcrWorkerClient";
import {
  isMobileE2EMocksEnabled,
  readMobileE2ELastKnownVersionConfiguration,
  readMobileE2ERemoteVersionConfiguration,
  shouldFailMobileE2ERemoteVersionCheck
} from "./Shared/E2EMocks";
import { ObservabilityPersistence } from "./Shared/ObservabilityPersistence";
import { UserActionTracker } from "./Shared/UserActionTracker";
import { captureVideoFrame, openRearCameraStream, stopCameraStream } from "./Features/Classification/Camera/WebRtcCamera";
import { pickImageFromDevice } from "./Features/Classification/Image/WebImagePicker";
import { readFirebaseInstallationId } from "./Shared/FirebaseInstallationClient";
import { initializeOpenCvWorker } from "./Shared/OpenCvHomographyWorkerClient";

export interface AboutDisplayItem {
  readonly label: string;
  readonly value: string;
}

export interface ApplicationPreferences {
  readonly language: SupportedLocale;
  readonly theme: ApplicationTheme;
}

let navigationDelegate: ((page: NavigationPage, character?: string) => void) | null = null;
let preferenceDelegate: ((preferences: ApplicationPreferences) => void) | null = null;

export interface CompositionRoot {
  readonly kanjiRepository: KanjiRepository;
  readonly persistence: AppPersistence;
  readonly observabilityPersistence: ObservabilityPersistence;
  readonly ocrClient: OcrWorkerClient;
  readonly canvasController: CanvasInterface;
  readonly modelLoaderController: ModelLoaderInterface;
  readonly inferenceController: InferenceInterface;
  readonly imageController: ImageInterface;
  readonly photoController: PhotoInterface;
  readonly displayInferencesController: DisplayInferencesInterface;
  readonly classificationController: ClassificationInterface;
  readonly toggleClassificationModeController: ToggleClassificationModeInterface;
  readonly calligraphyController: CalligraphyInterface;
  readonly categoryController: CategoryInterface;
  readonly calligraphyCanvasController: CalligraphyCanvasInterface;
  readonly kanjiPracticeController: KanjiPracticeInterface;
  readonly calligraphyEvaluationController: CalligraphyEvaluationInterface;
  readonly errorObservabilityController: ErrorObservabilityInterface;
  readonly errorController: ErrorInterface;
  readonly versionCheckController: VersionCheckInterface;
  readonly updateAvailableController: UpdateAvailableInterface;
  initialize(): Promise<ApplicationPreferences>;
  checkForAvailableUpdate(): Promise<UpdateAvailabilityState>;
  captureUnexpectedError(error: Error): Promise<{ readonly message: string; readonly isControlled: boolean }>;
  createErrorContext(): Promise<ApplicationErrorContext>;
  recordUserAction(action: ApplicationUserAction): void;
  loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>>;
  loadKanjiDetails(character: string, language: string, recordVisit?: boolean): Promise<DetailedKanjiEntry>;
  readonly aboutController: AboutInterface;
  readonly userPreferenceController: UserPreferenceInterface;
  readonly navigationController: NavigationInterface;
  readonly searchController: SearchInterface;
  readonly historyController: HistoryInterface;
  readonly displayKanjiController: DisplayKanjiInterface;
  registerNavigationDelegate(delegate: (page: NavigationPage, character?: string) => void): void;
  registerPreferenceDelegate(delegate: (preferences: ApplicationPreferences) => void): void;
  savePreferences(preferences: ApplicationPreferences): Promise<void>;
}

/**
 * Builds the application dependency graph.
 */
export function createCompositionRoot(): CompositionRoot {
  const kanjiRepository = new KanjiRepository();
  const persistence = new AppPersistence();
  const observabilityPersistence = new ObservabilityPersistence();
  const userActionTracker = new UserActionTracker();
  const ocrClient = new OcrWorkerClient();
  const modelLoaderController = CreateModelLoaderController({
    initializeModelRuntime: async (): Promise<ModelConfiguration> => {
      await ocrClient.loadModel();
      return {
        inputWidth: MODEL_INPUT_SIZE,
        inputHeight: MODEL_INPUT_SIZE,
        isLoaded: true
      };
    }
  });
  // eslint-disable-next-line prefer-const
  let canvasController: CanvasInterface;
  let activeCameraStream: MediaStream | null = null;

  const recordUserAction = (action: ApplicationUserAction): void => {
    userActionTracker.record(action);
  };

  const errorObservabilityController = CreateErrorObservabilityController({
    createReportId: () => createReportId(),
    readCurrentDate: () => new Date().toISOString()
  });

  const errorController = CreateErrorController({
    createUserFacingMessage: () => {
      const language =
        typeof document !== "undefined" && document.documentElement.lang
          ? document.documentElement.lang
          : "en-US";

      return translate(language, "unexpectedError");
    }
  });

  const versionCheckController = CreateVersionCheckController({
    loadVersionConfiguration: async () => {
      if (isMobileE2EMocksEnabled()) {
        if (shouldFailMobileE2ERemoteVersionCheck()) {
          throw new Error("No remote version configuration source is available.");
        }

        const e2eConfiguration = readMobileE2ERemoteVersionConfiguration();

        if (e2eConfiguration !== null) {
          return e2eConfiguration;
        }
      }

      const configuration = await observabilityPersistence.getVersionConfiguration();

      if (configuration === null) {
        throw new Error("No remote version configuration source is available.");
      }

      return configuration;
    },
    loadLastKnownVersionConfiguration: async () => {
      if (isMobileE2EMocksEnabled()) {
        const e2eConfiguration = readMobileE2ELastKnownVersionConfiguration();

        if (e2eConfiguration !== null) {
          return e2eConfiguration;
        }
      }

      const configuration = await observabilityPersistence.getLastKnownVersionConfiguration();

      if (configuration === null) {
        throw new Error("No last known version configuration is available.");
      }

      return configuration;
    },
    saveVersionConfiguration: configuration => observabilityPersistence.saveVersionConfiguration(configuration)
  });

  const updateAvailableController = CreateUpdateAvailableController({
    createUpdateMessage: () => {
      const language =
        typeof document !== "undefined" && document.documentElement.lang
          ? document.documentElement.lang
          : "en-US";

      return translate(language, "updateAvailable");
    }
  });

  const createErrorContext = async (): Promise<ApplicationErrorContext> => {
    const [applicationVersion, deviceInfo, anonymousClientId] = await Promise.all([
      loadCurrentApplicationVersion(),
      loadDeviceInfo(),
      readFirebaseInstallationId()
    ]);

    return {
      applicationVersion: applicationVersion ?? packageMetadata.version,
      webEngine: deviceInfo.webEngine,
      webEngineVersion: deviceInfo.webEngineVersion,
      ...(anonymousClientId ? { anonymousClientId } : {}),
      lastActions: userActionTracker.listRecentActions()
    };
  };

  const captureUnexpectedError = async (
    error: Error
  ): Promise<{ readonly message: string; readonly isControlled: boolean }> => {
    try {
      recordUserAction({
        type: "error:captured",
        occurredAt: new Date().toISOString()
      });
      const controlledState = await errorController.captureUnexpectedError(error);
      const context = await createErrorContext();
      const report = await errorObservabilityController.createErrorReport(error, context);
      await observabilityPersistence.saveErrorReport(report);

      return controlledState;
    } catch {
      const fallbackLanguage =
        typeof document !== "undefined" && document.documentElement.lang
          ? document.documentElement.lang
          : "en-US";
      return {
        message: translate(fallbackLanguage, "unexpectedError"),
        isControlled: true
      };
    }
  };

  const loadKanjiDetailsByLanguage = async (character: string, language: string): Promise<DetailedKanjiEntry> => {
    const details = await kanjiRepository.getDetails(character);

    return {
      ...details,
      meanings: filterMeaningsByLanguage(details.meanings ?? [], language)
    };
  };

  const aboutController = CreateAboutController({
    loadAboutInformation: async () => {
      const attributions = await kanjiRepository.loadSourceAttributions();
      return [
        { label: "version", value: packageMetadata.version },
        { label: "authorship", value: "authorshipName" },
        { label: "textConversion", value: "textConversionValue" },
        ...formatAttributions(attributions)
      ];
    },
    loadApplicationVersion: async () => packageMetadata.version
  });

  const userPreferenceController = CreateUserPreferenceController({
    applyLanguage: async (language: string) => {
      try {
        const preferences = await persistence.getPreferences();
        const nextPreferences = { ...preferences, language: normalizeLocale(language) };
        await persistence.savePreferences(nextPreferences);
        recordUserAction({
          type: "preferences:changed",
          preference: "language",
          occurredAt: new Date().toISOString()
        });
        preferenceDelegate?.(nextPreferences);
      } catch (error) {
        await captureUnexpectedError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    applyTheme: async (theme: ApplicationTheme) => {
      try {
        const preferences = await persistence.getPreferences();
        const nextPreferences = { ...preferences, theme };
        await persistence.savePreferences(nextPreferences);
        recordUserAction({
          type: "preferences:changed",
          preference: "theme",
          occurredAt: new Date().toISOString()
        });
        preferenceDelegate?.(nextPreferences);
      } catch (error) {
        await captureUnexpectedError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });

  const navigationController = CreateNavigationController({
    clearPageState: (page: NavigationPage) => {
      navigationDelegate?.(page);
    },
    publishInitialRoute: () => {
      // no-op
    }
  });

  const historyController = CreateHistoryController({
    loadGroups: () => persistence.loadHistoryGroups(),
    persistEntry: async entry => {
      const summary = await kanjiRepository.getSummary(entry.character);
      await persistence.saveHistoryEntry({
        ...entry,
        summary: summary ? createHistorySummary(summary) : entry.character
      });
    },
    resolveEntrySummary: character => {
      const summary = kanjiRepository.getCachedSummarySnapshot(character);
      return summary ? createHistorySummary(summary) : character;
    },
    navigateToKanjiEntry: async (character: string) => {
      recordUserAction({
        type: "kanji:detail-opened",
        character,
        occurredAt: new Date().toISOString()
      });
      navigationDelegate?.("kanjiEntry", character);
    }
  });

  const searchController = CreateSearchController({
    queryTerm: (term: string) => kanjiRepository.search(term),
    historyController,
    recordUserAction,
    navigateToKanjiEntry: async (character: string) => {
      recordUserAction({
        type: "kanji:detail-opened",
        character,
        occurredAt: new Date().toISOString()
      });
      navigationDelegate?.("kanjiEntry", character);
    }
  });

  const displayKanjiController = CreateDisplayKanjiController({
    loadKanjiDetails: async (character: string) => {
      const { language } = userPreferenceController.getCurrentPreferences();
      return loadKanjiDetailsByLanguage(character, language);
    },
    copyToClipboard: async (character: string) => {
      recordUserAction({
        type: "kanji:copied",
        character,
        occurredAt: new Date().toISOString()
      });
      const { Clipboard } = await import("@capacitor/clipboard");
      await Clipboard.write({ string: character });
    },
    navigateBack: () => {
      recordUserAction({
        type: "navigation:back",
        page: "kanjiEntry",
        occurredAt: new Date().toISOString()
      });
      window.history.back();
    }
  });

  const imageController = CreateImageController({
    onImageSelected: () => undefined,
    onCropSelected: () => undefined
  });

  const inferenceController = CreateInferenceController({
    classifyDrawing: input => ocrClient.classifyDrawing(input),
    classifyImage: input => ocrClient.classifyImage(input),
    preprocessDrawing: input => ocrClient.preprocessDrawing(input),
    preprocessImage: input => ocrClient.preprocessImage(input),
    getCurrentStrokes: () => canvasController.getStrokeHistory().map(stroke => ({
      points: stroke.points.map(point => ({ ...point })),
      startedAt: stroke.startedAt,
      endedAt: stroke.endedAt
    })),
    drawingWidth: DRAWING_CANVAS_SIZE,
    drawingHeight: DRAWING_CANVAS_SIZE,
    modelLoader: modelLoaderController,
    resolveStrokeCount: async character => {
      const summary = await kanjiRepository.getSummary(character);
      return summary?.strokeCount ?? 0;
    }
  });

  canvasController = CreateCanvasController({
    requestDrawingInference: async (stroke: Stroke) => {
      recordUserAction({
        type: "classification:stroke-completed",
        mode: "drawing",
        occurredAt: new Date().toISOString()
      });
      const predictions = await inferenceController.classifyInput({
        sourceId: `drawing-${stroke.endedAt}`,
        inputUrl: "drawing://canvas",
        strokeCount: canvasController.getStrokeHistory().length
      });

      return predictions;
    }
  });

  const displayInferencesController = CreateDisplayInferencesController({
    navigateToKanjiEntry: async character => {
      recordUserAction({
        type: "kanji:detail-opened",
        character,
        occurredAt: new Date().toISOString()
      });
      navigationDelegate?.("kanjiEntry", character);
    },
    saveHistoryEntry: async (character: string, category: HistoryCategory) => {
      await historyController.saveEntry({
        character,
        category,
        createdAt: new Date().toISOString()
      });
    },
    resolveSummary: character => kanjiRepository.getCachedSummarySnapshot(character)
  });

  const classificationController = CreateClassificationController({
    onModeChanged: async (mode: ClassificationMode) => {
      recordUserAction({
        type: "classification:mode-selected",
        mode,
        occurredAt: new Date().toISOString()
      });
    }
  });

  const toggleClassificationModeController = CreateToggleClassificationModeController({
    clearCurrentModeState: async (mode: ClassificationMode) => {
      recordUserAction({
        type: "classification:canvas-cleared",
        mode,
        occurredAt: new Date().toISOString()
      });
      if (mode === "image") {
        imageController.clearImage();
      } else {
        try {
          canvasController.clearCanvas();
        } catch (error) {
          if (!isEmptyCanvasClearError(error)) {
            throw error;
          }
        }
      }
      displayInferencesController.clearResults();
    }
  });

  const calligraphyController = CreateCalligraphyController({
    getCategories: () => kanjiRepository.getCachedCalligraphyCategories(),
    navigateToCategory: async (categoryId, grouping) => {
      recordUserAction({
        type: "calligraphy:category-opened",
        grouping,
        occurredAt: new Date().toISOString()
      });
    }
  });

  const categoryController = CreateCategoryController({
    getKanjiByCategory: categoryId => kanjiRepository.getCalligraphyKanjiByCategory(categoryId),
    searchKanjiByCategory: (categoryId, term) => kanjiRepository.searchCalligraphyKanjiByCategory(categoryId, term),
    startCalligraphyPractice: async (character, grouping) => {
      recordUserAction({
        type: "calligraphy:practice-started",
        grouping: grouping ?? "jlpt",
        occurredAt: new Date().toISOString()
      });
    },
    returnToCalligraphy: async () => undefined
  });

  const calligraphyCanvasController = CreateCalligraphyCanvasController();

  const calligraphyEvaluationController = CreateCalligraphyEvaluationController({
    evaluateAttempt: attempt => evaluateCalligraphyAttempt({
      loadReferenceStrokeOrder: async character => {
        const details = await kanjiRepository.getDetails(character);
        return details.strokeOrder ?? "";
      }
    }, attempt),
    createFeedback: result => ({
      score: result.score,
      summary: result.summary,
      recommendation: result.recommendation ?? "recommendSimilarity",
      aspects: result.aspects ?? [],
      visualComparison: result.visualComparison,
      isOverlayVisible: true
    })
  });

  const kanjiPracticeController = CreateKanjiPracticeController({
    navigateBackToCategory: async () => undefined,
    requestEvaluation: attempt => calligraphyEvaluationController.evaluateAttempt(attempt)
  });

  return {
    kanjiRepository,
    persistence,
    observabilityPersistence,
    ocrClient,
    modelLoaderController,
    canvasController,
    inferenceController,
    imageController,
    photoController: CreatePhotoController({
      startCameraPreview: async () => {
        stopCameraStream(activeCameraStream);
        activeCameraStream = await openRearCameraStream();
        return activeCameraStream;
      },
      captureFromCamera: video => captureVideoFrame(video),
      stopCameraPreview: () => {
        stopCameraStream(activeCameraStream);
        activeCameraStream = null;
      },
      pickFromLibrary: () => pickImageFromDevice()
    }),
    displayInferencesController,
    classificationController,
    toggleClassificationModeController,
    calligraphyController,
    categoryController,
    calligraphyCanvasController,
    kanjiPracticeController,
    calligraphyEvaluationController,
    errorObservabilityController,
    errorController,
    versionCheckController,
    updateAvailableController,
    async initialize(): Promise<ApplicationPreferences> {
      await Promise.all([
        initializeOpenCvWorker(),
        kanjiRepository.initialize(),
        persistence.initialize(),
        modelLoaderController.loadModel()
      ]);
      void observabilityPersistence.flushPendingErrorReports();
      const preferences = await persistence.getPreferences();
      const locale = normalizeLocale(preferences.language);

      userPreferenceController.setLanguage(locale);
      userPreferenceController.setTheme(preferences.theme);

      return {
        language: locale,
        theme: preferences.theme
      };
    },
    async checkForAvailableUpdate(): Promise<UpdateAvailabilityState> {
      try {
        const currentVersion = await loadCurrentApplicationVersion();
        const result = await versionCheckController.checkCurrentVersion(currentVersion);
        return updateAvailableController.getUpdateAvailability(result);
      } catch (error) {
        await captureUnexpectedError(error instanceof Error ? error : new Error(String(error)));
        return createHiddenUpdateAvailability();
      }
    },
    async captureUnexpectedError(error: Error): Promise<{ readonly message: string; readonly isControlled: boolean }> {
      return captureUnexpectedError(error);
    },
    async createErrorContext(): Promise<ApplicationErrorContext> {
      return createErrorContext();
    },
    recordUserAction(action: ApplicationUserAction): void {
      recordUserAction(action);
    },
    loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
      return persistence.loadHistoryGroups();
    },
    loadKanjiDetails(character: string, language: string): Promise<DetailedKanjiEntry> {
      return loadKanjiDetailsByLanguage(character, language);
    },
    aboutController,
    userPreferenceController,
    navigationController,
    searchController,
    historyController,
    displayKanjiController,
    registerNavigationDelegate(delegate: (page: NavigationPage, character?: string) => void): void {
      navigationDelegate = delegate;
    },
    registerPreferenceDelegate(delegate: (preferences: ApplicationPreferences) => void): void {
      preferenceDelegate = delegate;
    },
    savePreferences(preferences: ApplicationPreferences): Promise<void> {
      return persistence.savePreferences(preferences);
    }
  };
}

function createHistorySummary(summary: KanjiSummary): string {
  const onyomi = summary.primaryReadings.filter(r => !r.match(/^[あ-ん]/)).slice(0, 3);
  const kunyomi = summary.primaryReadings.filter(r => r.match(/^[あ-ん]/)).slice(0, 3);

  const onText = onyomi.join("・");
  const kunText = kunyomi.join("・");

  if (onText && kunText) {
    return `${onText}・${kunText}`;
  }
  return onText || kunText || summary.character;
}

function filterMeaningsByLanguage(
  meanings: ReadonlyArray<{ readonly language: string; readonly value: string }>,
  language: string
): ReadonlyArray<{ readonly language: string; readonly value: string }> {
  const priority = getMeaningLanguagePriority(language);

  for (const languageCode of priority) {
    const matchingMeanings = meanings.filter(meaning => meaning.language === languageCode);

    if (matchingMeanings.length > 0) {
      return matchingMeanings;
    }
  }

  return [];
}

function formatAttributions(attributions: ReadonlyArray<SourceAttribution>): ReadonlyArray<AboutInformationItem> {
  return attributions.map(source => ({
    label: source.id,
    value: `${source.attribution}. ${source.license}. ${source.id === "etl9b" ? "modelSourceDetail" : "databaseSourceDetail"}`
  }));
}

function createHiddenUpdateAvailability(): UpdateAvailabilityState {
  return {
    isVisible: false,
    currentVersion: "",
    latestVersion: "",
    message: "",
    canContinueUsingApplication: true
  };
}

function isEmptyCanvasClearError(error: unknown): boolean {
  return error instanceof Error && error.message === "There is no drawing to clear.";
}

function createReportId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `error-${Date.now().toString(36)}`;
}

async function loadCurrentApplicationVersion(): Promise<string | null> {
  try {
    const appInfo = await CapacitorApp.getInfo();
    return appInfo.version.trim().length > 0 ? appInfo.version : null;
  } catch {
    return packageMetadata.version;
  }
}

async function loadDeviceInfo(): Promise<{ readonly webEngine: string; readonly webEngineVersion: string }> {
  if (isMobileE2EMocksEnabled()) {
    return {
      webEngine: "web",
      webEngineVersion: "124.0.0"
    };
  }

  try {
    const deviceInfo = await Device.getInfo();
    const webEngine = deviceInfo.operatingSystem.trim().length > 0
      ? deviceInfo.operatingSystem
      : "web";
    const webEngineVersion = typeof deviceInfo.webViewVersion === "string" && deviceInfo.webViewVersion.trim().length > 0
      ? deviceInfo.webViewVersion
      : deviceInfo.osVersion;

    return {
      webEngine,
      webEngineVersion
    };
  } catch {
    return {
      webEngine: "web",
      webEngineVersion: "unknown"
    };
  }
}
