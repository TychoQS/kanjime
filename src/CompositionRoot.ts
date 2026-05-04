import packageMetadata from "../package.json";

import { CreateAboutController } from "./Features/About/CreateAboutController";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
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
import { CreateSearchController } from "./Features/Search/CreateSearchController";
import type { SearchInterface } from "./Features/Search/Contracts/SearchInterface";
import { CreateNavigationController } from "./Features/Shell/CreateNavigationController";
import type { NavigationInterface } from "./Features/Shell/Contracts/NavigationInterface";
import { AppPersistence } from "./Shared/AppPersistence";
import type {
  AboutInformationItem,
  ApplicationTheme,
  ClassificationMode,
  DetailedKanjiEntry,
  HistoryCategory,
  HistoryGroup,
  NavigationPage,
  Stroke
} from "./Shared/DomainTypes";
import { getMeaningLanguagePriority, normalizeLocale, type SupportedLocale } from "./Shared/I18n";
import { KanjiRepository, type KanjiSummary, type SourceAttribution } from "./Shared/KanjiRepository";
import { OcrWorkerClient } from "./Shared/OcrWorkerClient";
import { ImageError } from "./Shared/AppErrors";

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
  readonly ocrClient: OcrWorkerClient;
  readonly canvasController: CanvasInterface;
  readonly inferenceController: InferenceInterface;
  readonly imageController: ImageInterface;
  readonly photoController: PhotoInterface;
  readonly displayInferencesController: DisplayInferencesInterface;
  readonly classificationController: ClassificationInterface;
  readonly toggleClassificationModeController: ToggleClassificationModeInterface;
  initialize(): Promise<ApplicationPreferences>;
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
  const ocrClient = new OcrWorkerClient();
  let canvasController: CanvasInterface;

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
      const metadata = kanjiRepository.getMetadata();

      return [
        { label: "version", value: packageMetadata.version },
        { label: "license", value: "licenseDetail" },
        { label: "terms", value: "termsDetail" },
        { label: "authorship", value: "authorshipName" },
        {
          label: "model",
          value: metadata ? `__MODEL_DETAIL__:${metadata.classCount}` : "modelDetailEmpty"
        },
        { label: "textConversion", value: "textConversionValue" },
        { label: "interface", value: "interfaceValue" },
        ...formatAttributions(attributions)
      ];
    },
    loadApplicationVersion: async () => packageMetadata.version
  });

  const userPreferenceController = CreateUserPreferenceController({
    applyLanguage: async (language: string) => {
      const preferences = await persistence.getPreferences();
      const nextPreferences = { ...preferences, language: normalizeLocale(language) };
      await persistence.savePreferences(nextPreferences);
      preferenceDelegate?.(nextPreferences);
    },
    applyTheme: async (theme: ApplicationTheme) => {
      const preferences = await persistence.getPreferences();
      const nextPreferences = { ...preferences, theme };
      await persistence.savePreferences(nextPreferences);
      preferenceDelegate?.(nextPreferences);
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
    navigateToKanjiEntry: async (character: string) => {
      navigationDelegate?.("kanjiEntry", character);
    }
  });

  const searchController = CreateSearchController({
    queryTerm: (term: string) => kanjiRepository.search(term),
    historyController,
    navigateToKanjiEntry: async (character: string) => {
      navigationDelegate?.("kanjiEntry", character);
    }
  });

  const displayKanjiController = CreateDisplayKanjiController({
    loadKanjiDetails: async (character: string) => {
      const { language } = userPreferenceController.getCurrentPreferences();
      return loadKanjiDetailsByLanguage(character, language);
    },
    copyToClipboard: async (character: string) => {
      const { Clipboard } = await import("@capacitor/clipboard");
      await Clipboard.write({ string: character });
    },
    navigateBack: () => {
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
    modelInputSize: MODEL_INPUT_SIZE,
    resolveStrokeCount: async character => {
      const summary = await kanjiRepository.getSummary(character);
      return summary?.strokeCount ?? 0;
    }
  });

  canvasController = CreateCanvasController({
    requestDrawingInference: async (stroke: Stroke) => {
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
    onModeChanged: async (_mode: ClassificationMode) => undefined
  });

  const toggleClassificationModeController = CreateToggleClassificationModeController({
    clearCurrentModeState: async (mode: ClassificationMode) => {
      if (mode === "image") {
        imageController.clearImage();
      } else {
        try {
          canvasController.clearCanvas();
        } catch {
          // no-op
        }
      }
      displayInferencesController.clearResults();
    }
  });

  return {
    kanjiRepository,
    persistence,
    ocrClient,
    canvasController,
    inferenceController,
    imageController,
    photoController: CreatePhotoController({
      captureFromCamera: async () => {
        const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
          allowEditing: false,
          correctOrientation: true,
          quality: 80,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          width: 1024
        });

        if (!photo.webPath) {
          throw new ImageError("The selected image could not be used.");
        }

        const dimensions = await loadImageDimensions(photo.webPath);

        return {
          uri: photo.webPath,
          width: dimensions.width,
          height: dimensions.height,
          mimeType: photo.format ? `image/${photo.format}` : "image/jpeg"
        };
      },
      pickFromLibrary: async () => {
        const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
          allowEditing: false,
          correctOrientation: true,
          quality: 80,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
          width: 1024
        });

        if (!photo.webPath) {
          throw new ImageError("The selected image could not be used.");
        }

        const dimensions = await loadImageDimensions(photo.webPath);

        return {
          uri: photo.webPath,
          width: dimensions.width,
          height: dimensions.height,
          mimeType: photo.format ? `image/${photo.format}` : "image/jpeg"
        };
      }
    }),
    displayInferencesController,
    classificationController,
    toggleClassificationModeController,
    async initialize(): Promise<ApplicationPreferences> {
      await Promise.all([
        kanjiRepository.initialize(),
        persistence.initialize(),
        ocrClient.loadModel()
      ]);
      const preferences = await persistence.getPreferences();
      const locale = normalizeLocale(preferences.language);

      userPreferenceController.setLanguage(locale);
      userPreferenceController.setTheme(preferences.theme);

      return {
        language: locale,
        theme: preferences.theme
      };
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
    value: `${source.attribution}. ${source.license}.`
  }));
}

function loadImageDimensions(uri: string): Promise<{ readonly width: number; readonly height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    image.onerror = () => reject(new ImageError("The image could not be loaded."));
    image.src = uri;
  });
}
