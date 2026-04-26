import { CreateAboutController } from "./Features/About/CreateAboutController";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
import { CreateCanvasController } from "./Features/Classification/Canvas/CreateCanvasController";
import type { CanvasInterface } from "./Features/Classification/Canvas/Contracts/CanvasInterface";
import { CreateDisplayInferencesController } from "./Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "./Features/Classification/Inference/CreateInferenceController";
import type { DisplayInferencesInterface } from "./Features/Classification/Inference/Contracts/DisplayInferencesInterface";
import type { InferenceInterface } from "./Features/Classification/Inference/Contracts/InferenceInterface";
import { CreateModelLoaderController } from "./Features/Classification/Inference/CreateModelLoaderController";
import type { ModelLoaderInterface } from "./Features/Classification/Inference/Contracts/ModelLoaderInterface";
import { CreateImageController } from "./Features/Classification/Image/CreateImageController";
import type { ImageInterface } from "./Features/Classification/Image/Contracts/ImageInterface";
import { CreatePhotoController } from "./Features/Classification/Image/CreatePhotoController";
import type { PhotoInterface } from "./Features/Classification/Image/Contracts/PhotoInterface";
import { CreateClassificationController } from "./Features/Classification/Mode/CreateClassificationController";
import type { ClassificationInterface } from "./Features/Classification/Mode/Contracts/ClassificationInterface";
import { CreateToggleClassificationModeController } from "./Features/Classification/Mode/CreateToggleClassificationModeController";
import type { ToggleClassificationModeInterface } from "./Features/Classification/Mode/Contracts/ToggleClassificationModeInterface";
import { CreateHistoryController } from "./Features/History/CreateHistoryController";
import type { HistoryInterface } from "./Features/History/Contracts/HistoryInterface";
import { CreateDisplayKanjiController } from "./Features/Kanji/CreateDisplayKanjiController";
import type { DisplayKanjiInterface } from "./Features/Kanji/Contracts/DisplayKanjiInterface";
import { CreateNavigationController } from "./Features/Shell/CreateNavigationController";
import type { NavigationInterface } from "./Features/Shell/Contracts/NavigationInterface";
import { CreateSearchController } from "./Features/Search/CreateSearchController";
import type { SearchInterface } from "./Features/Search/Contracts/SearchInterface";
import { CreateUserPreferenceController } from "./Features/Preferences/CreateUserPreferenceController";
import type { UserPreferenceInterface } from "./Features/Preferences/Contracts/UserPreferenceInterface";
import type {
  ApplicationTheme,
  ClassificationMode,
  CropRegion,
  HistoryCategory,
  ImageDescriptor,
  InferencePrediction,
  NavigationPage,
  Stroke
} from "./Shared/DomainTypes";
import { createKanjiRepository, type KanjiRepository } from "./Shared/Data/KanjiRepository";
import { createOcrInferenceService, type OcrInferenceService } from "./Shared/Ocr/OcrInferenceService";
import { createUserDataRepository, type UserDataRepository } from "./Shared/Preferences/UserDataRepository";
import packageMetadata from "../package.json";

/**
 * Application dependency graph.
 *
 * @inv Public contracts are created through their existing factories.
 */
export interface ApplicationComposition {
  /** @post Provides read-only kanji data from the packaged database. */
  readonly kanjiRepository: KanjiRepository;
  /** @post Provides mutable local user data. */
  readonly userDataRepository: UserDataRepository;
  /** @post Provides worker-backed OCR inference. */
  readonly ocrInferenceService: OcrInferenceService;
  /** @post Loads the model at most once per app session. */
  readonly modelLoaderController: ModelLoaderInterface;
  /** @post Creates a classification mode controller. */
  readonly createClassificationController: (onModeChanged: (mode: ClassificationMode) => void) => ClassificationInterface;
  /** @post Creates a mode toggle controller. */
  readonly createToggleController: (clearMode: (mode: ClassificationMode) => void) => ToggleClassificationModeInterface;
  /** @post Creates an image state controller. */
  readonly createImageController: (
    onImageSelected: (image: ImageDescriptor) => void,
    onCropSelected: (crop: CropRegion) => void
  ) => ImageInterface;
  /** @post Creates a photo acquisition controller. */
  readonly createPhotoController: (
    captureFromCamera: () => Promise<ImageDescriptor>,
    pickFromLibrary: () => Promise<ImageDescriptor>
  ) => PhotoInterface;
  /** @post Creates a drawing controller. */
  readonly createCanvasController: (
    requestDrawingInference: (stroke: Stroke) => Promise<ReadonlyArray<{ character: string; strokeCount: number }>>
  ) => CanvasInterface;
  /** @post Creates an inference controller. */
  readonly createInferenceController: () => InferenceInterface;
  /** @post Creates an inference display controller. */
  readonly createDisplayInferencesController: (
    navigateToKanjiEntry: (character: string) => Promise<void>,
    saveHistoryEntry: (character: string, category: HistoryCategory) => Promise<void>
  ) => DisplayInferencesInterface;
  /** @post Creates a search controller. */
  readonly createSearchController: (navigateToKanjiEntry: (character: string) => Promise<void>) => SearchInterface;
  /** @post Creates a history controller. */
  readonly createHistoryController: (navigateToKanjiEntry: (character: string) => Promise<void>) => HistoryInterface;
  /** @post Creates a detail controller. */
  readonly createDisplayKanjiController: (navigateBack: () => void) => DisplayKanjiInterface;
  /** @post Creates a navigation controller. */
  readonly createNavigationController: (
    clearPageState: (page: NavigationPage) => void,
    publishInitialRoute: (route: { page: "classification"; mode: "image" }) => void
  ) => NavigationInterface;
  /** @post Creates a preference controller. */
  readonly createUserPreferenceController: (
    applyLanguage: (language: string) => void,
    applyTheme: (theme: ApplicationTheme) => void
  ) => UserPreferenceInterface;
  /** @post Creates an About controller. */
  readonly createAboutController: () => AboutInterface;
  /** @post Saves a history entry with the current timestamp. */
  readonly saveHistoryEntry: (character: string, category: HistoryCategory) => Promise<void>;
}

/**
 * Creates the application composition root.
 *
 * @returns Fully wired application dependency graph.
 */
export function createApplicationComposition(): ApplicationComposition {
  const kanjiRepository = createKanjiRepository();
  const userDataRepository = createUserDataRepository();
  const ocrInferenceService = createOcrInferenceService();
  const modelLoaderController = CreateModelLoaderController({
    initializeModelRuntime: () => ocrInferenceService.loadModel()
  });

  async function saveHistoryEntry(character: string, category: HistoryCategory): Promise<void> {
    await userDataRepository.saveHistoryEntry(character, category, new Date().toISOString());
  }

  return {
    kanjiRepository,
    userDataRepository,
    ocrInferenceService,
    modelLoaderController,
    createClassificationController(onModeChanged) {
      return CreateClassificationController({
        onModeChanged
      });
    },
    createToggleController(clearMode) {
      return CreateToggleClassificationModeController({
        clearCurrentModeState: clearMode
      });
    },
    createImageController(onImageSelected, onCropSelected) {
      return CreateImageController({
        onImageSelected,
        onCropSelected
      });
    },
    createPhotoController(captureFromCamera, pickFromLibrary) {
      return CreatePhotoController({
        captureFromCamera,
        pickFromLibrary
      });
    },
    createCanvasController(requestDrawingInference) {
      return CreateCanvasController({
        requestDrawingInference
      });
    },
    createInferenceController() {
      return CreateInferenceController({
        classifySource: (sourceId: string, inputUrl: string): Promise<ReadonlyArray<InferencePrediction>> => (
          ocrInferenceService.classifySource(sourceId, inputUrl)
        )
      });
    },
    createDisplayInferencesController(navigateToKanjiEntry, persistHistoryEntry) {
      return CreateDisplayInferencesController({
        navigateToKanjiEntry,
        saveHistoryEntry: persistHistoryEntry
      });
    },
    createSearchController(navigateToKanjiEntry) {
      return CreateSearchController({
        queryTerm: term => kanjiRepository.search(term),
        navigateToKanjiEntry
      });
    },
    createHistoryController(navigateToKanjiEntry) {
      return CreateHistoryController({
        loadGroups: () => userDataRepository.loadHistoryGroups(),
        persistEntry: entry => userDataRepository.saveHistoryEntry(entry.character, entry.category, entry.createdAt),
        navigateToKanjiEntry
      });
    },
    createDisplayKanjiController(navigateBack) {
      return CreateDisplayKanjiController({
        loadKanjiDetails: character => kanjiRepository.getDetails(character),
        copyToClipboard: async character => {
          const { Clipboard } = await import("@capacitor/clipboard");
          await Clipboard.write({ string: character });
        },
        navigateBack
      });
    },
    createNavigationController(clearPageState, publishInitialRoute) {
      return CreateNavigationController({
        clearPageState,
        publishInitialRoute
      });
    },
    createUserPreferenceController(applyLanguage, applyTheme) {
      return CreateUserPreferenceController({
        applyLanguage,
        applyTheme
      });
    },
    createAboutController() {
      return CreateAboutController({
        loadAboutInformation: async () => [
          {
            label: "Application",
            value: "Offline Japanese kanji recognition and dictionary"
          },
          {
            label: "Author",
            value: "Tycho Quintana Santana"
          },
          {
            label: "Terms of use",
            value: "All recognition and dictionary data is processed locally on this device."
          },
          ...(await kanjiRepository.getAttributionItems())
        ],
        loadApplicationVersion: async () => packageMetadata.version
      });
    },
    saveHistoryEntry
  };
}
