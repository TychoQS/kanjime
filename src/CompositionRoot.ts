import { Camera, CameraResultType, CameraSource, type Photo } from "@capacitor/camera";
import { Clipboard } from "@capacitor/clipboard";
import packageMetadata from "../package.json";
import { CreateAboutController } from "./Features/About/CreateAboutController";
import { CreateCanvasController } from "./Features/Classification/Canvas/CreateCanvasController";
import { CreateImageController } from "./Features/Classification/Image/CreateImageController";
import { CreatePhotoController } from "./Features/Classification/Image/CreatePhotoController";
import { CreateDisplayInferencesController } from "./Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateInferenceController } from "./Features/Classification/Inference/CreateInferenceController";
import { CreateModelLoaderController } from "./Features/Classification/Inference/CreateModelLoaderController";
import { CreateClassificationController } from "./Features/Classification/Mode/CreateClassificationController";
import { CreateToggleClassificationModeController } from "./Features/Classification/Mode/CreateToggleClassificationModeController";
import { CreateHistoryController } from "./Features/History/CreateHistoryController";
import { CreateDisplayKanjiController } from "./Features/Kanji/CreateDisplayKanjiController";
import { CreateUserPreferenceController } from "./Features/Preferences/CreateUserPreferenceController";
import { CreateSearchController } from "./Features/Search/CreateSearchController";
import { CreateNavigationController } from "./Features/Shell/CreateNavigationController";
import { openPackagedDatabase } from "./Shared/Database/PackagedDatabase";
import type { Database, SqlValue } from "sql.js";
import type {
  AboutInformationItem,
  ApplicationTheme,
  CharacterSummary,
  CropRegion,
  DetailedKanjiEntry,
  HistoryCategory,
  HistoryEntry,
  HistoryGroup,
  ImageDescriptor,
  InferencePrediction,
  ModelConfiguration,
  NavigationPage,
  Stroke
} from "./Shared/DomainTypes";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
import type { CanvasInterface } from "./Features/Classification/Canvas/Contracts/CanvasInterface";
import type { ImageInterface } from "./Features/Classification/Image/Contracts/ImageInterface";
import type { PhotoInterface } from "./Features/Classification/Image/Contracts/PhotoInterface";
import type { DisplayInferencesInterface } from "./Features/Classification/Inference/Contracts/DisplayInferencesInterface";
import type { InferenceInterface } from "./Features/Classification/Inference/Contracts/InferenceInterface";
import type { ModelLoaderInterface } from "./Features/Classification/Inference/Contracts/ModelLoaderInterface";
import type { ClassificationInterface } from "./Features/Classification/Mode/Contracts/ClassificationInterface";
import type {
  ToggleClassificationModeInterface
} from "./Features/Classification/Mode/Contracts/ToggleClassificationModeInterface";
import type { HistoryInterface } from "./Features/History/Contracts/HistoryInterface";
import type { DisplayKanjiInterface } from "./Features/Kanji/Contracts/DisplayKanjiInterface";
import type { UserPreferenceInterface } from "./Features/Preferences/Contracts/UserPreferenceInterface";
import type { SearchInterface } from "./Features/Search/Contracts/SearchInterface";
import type { NavigationInterface } from "./Features/Shell/Contracts/NavigationInterface";

const MODEL_INPUT_SIZE = 224;
const MODEL_URL = "/assets/model/best_kanji_model.onnx";
const MODEL_CLASSES_URL = "/assets/model/classes.json";
const HISTORY_STORAGE_KEY = "tfg-app.history.v1";
const PREFERENCE_STORAGE_KEY = "tfg-app.preferences.v1";
const HISTORY_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];

interface WorkerInitializeMessage {
  readonly type: "initialize";
  readonly requestId: number;
  readonly modelUrl: string;
  readonly classesUrl: string;
  readonly inputWidth: number;
  readonly inputHeight: number;
}

interface WorkerClassifyMessage {
  readonly type: "classify";
  readonly requestId: number;
  readonly sourceId: string;
  readonly sourceUri: string;
  readonly crop?: CropRegion;
}

type WorkerRequest = WorkerInitializeMessage | WorkerClassifyMessage;
type WorkerRequestPayload = Omit<WorkerInitializeMessage, "requestId"> | Omit<WorkerClassifyMessage, "requestId">;

interface WorkerResponse {
  readonly type: "success" | "error";
  readonly requestId: number;
  readonly message?: string;
  readonly predictions?: ReadonlyArray<{ character: string; confidence: number }>;
}

interface NavigationHandlers {
  readonly navigateToKanjiEntry: (character: string) => Promise<void> | void;
  readonly navigateBack: () => Promise<void> | void;
  readonly navigateToPage: (page: NavigationPage) => Promise<void> | void;
}

interface PersistedHistoryState {
  readonly schemaVersion: 1;
  readonly groups: ReadonlyArray<HistoryGroup>;
}

/**
 * Application controller graph exposed to React views.
 *
 * @pre The packaged database exists and can be opened by SQL.js.
 * @inv Controllers are created once for one application session.
 * @post Every feature controller is wired to concrete local dependencies.
 */
export interface ApplicationCompositionRoot {
  readonly about: AboutInterface;
  readonly canvas: CanvasInterface;
  readonly image: ImageInterface;
  readonly photo: PhotoInterface;
  readonly displayInferences: DisplayInferencesInterface;
  readonly inference: InferenceInterface;
  readonly modelLoader: ModelLoaderInterface;
  readonly classification: ClassificationInterface;
  readonly toggleClassificationMode: ToggleClassificationModeInterface;
  readonly history: HistoryInterface;
  readonly kanji: DisplayKanjiInterface;
  readonly preferences: UserPreferenceInterface;
  readonly search: SearchInterface;
  readonly navigation: NavigationInterface;
  readonly setNavigationHandlers: (handlers: NavigationHandlers) => void;
  readonly getLastDrawingPredictions: () => ReadonlyArray<InferencePrediction>;
  readonly dispose: () => void;
}

/**
 * Creates a concrete application composition root.
 *
 * @pre Browser storage and packaged SQLite assets are available.
 * @post Controllers use real SQLite, Capacitor, and ONNX worker dependencies.
 */
export async function createCompositionRoot(): Promise<ApplicationCompositionRoot> {
  const database = await openPackagedDatabase();
  const workerClient = createOnnxWorkerClient(character => loadStrokeCount(database, character));
  let lastDrawingPredictions: ReadonlyArray<InferencePrediction> = [];
  let navigationHandlers: NavigationHandlers = {
    navigateToKanjiEntry: () => undefined,
    navigateBack: () => undefined,
    navigateToPage: () => undefined
  };

  async function persistHistoryEntry(character: string, category: HistoryCategory): Promise<void> {
    const groups = await loadHistoryGroups();
    const existingGroup = groups.find(group => group.category === category);
    if (existingGroup?.entries.some(entry => entry.character === character)) {
      return;
    }
    const entry: HistoryEntry = { character, createdAt: new Date().toISOString(), summary: character };
    const nextGroups = HISTORY_CATEGORIES.map(groupCategory => {
      const group = groups.find(candidate => candidate.category === groupCategory);
      const entries = group?.entries ?? [];
      return {
        category: groupCategory,
        entries: groupCategory === category ? [...entries, entry] : entries
      };
    });
    saveHistoryGroups(nextGroups);
  }

  const history = CreateHistoryController({
    loadGroups: loadHistoryGroups,
    persistEntry: entry => persistHistoryEntry(entry.character, entry.category),
    navigateToKanjiEntry: async character => { await navigationHandlers.navigateToKanjiEntry(character); }
  });

  const inference = CreateInferenceController({
    classifySource: async (sourceId, inputUrl) => workerClient.classify(sourceId, inputUrl)
  });

  const canvas = CreateCanvasController({
    requestDrawingInference: async stroke => {
      const sourceId = createDrawingSourceId(stroke);
      const sourceUri = renderStrokeToDataUrl(stroke);
      lastDrawingPredictions = await inference.classifyInput({ sourceId, inputUrl: sourceUri, strokeCount: stroke.points.length });
      return lastDrawingPredictions.map(p => ({ character: p.character, strokeCount: p.strokeCount }));
    }
  });

  const displayInferences = CreateDisplayInferencesController({
    navigateToKanjiEntry: async character => { await navigationHandlers.navigateToKanjiEntry(character); },
    saveHistoryEntry: persistHistoryEntry
  });

  const image = CreateImageController({ onImageSelected: () => undefined, onCropSelected: () => undefined });

  const photo = CreatePhotoController({
    captureFromCamera: () => getPhotoFromDevice(CameraSource.Camera),
    pickFromLibrary: () => getPhotoFromDevice(CameraSource.Photos)
  });

  const modelLoader = CreateModelLoaderController({
    initializeModelRuntime: async (): Promise<ModelConfiguration> => {
      await workerClient.initialize();
      return { inputWidth: MODEL_INPUT_SIZE, inputHeight: MODEL_INPUT_SIZE, isLoaded: true };
    }
  });

  const classification = CreateClassificationController({ onModeChanged: () => undefined });
  const toggleClassificationMode = CreateToggleClassificationModeController({ clearCurrentModeState: () => undefined });

  const kanji = CreateDisplayKanjiController({
    loadKanjiDetails: character => loadKanjiDetails(database, character),
    copyToClipboard: character => Clipboard.write({ string: character }),
    navigateBack: () => navigationHandlers.navigateBack()
  });

  const search = CreateSearchController({
    queryTerm: term => searchKanji(database, term),
    navigateToKanjiEntry: async character => {
      await persistHistoryEntry(character, "search");
      await navigationHandlers.navigateToKanjiEntry(character);
    }
  });

  const about = CreateAboutController({
    loadAboutInformation: () => loadAboutInformation(database),
    loadApplicationVersion: () => Promise.resolve(packageMetadata.version)
  });

  const preferences = CreateUserPreferenceController({
    applyLanguage: language => savePreferences({ language }),
    applyTheme: theme => savePreferences({ theme })
  });

  const navigation = CreateNavigationController({ clearPageState: () => undefined, publishInitialRoute: () => undefined });

  return {
    about, canvas, image, photo, displayInferences, inference, modelLoader,
    classification, toggleClassificationMode, history, kanji, preferences, search, navigation,
    setNavigationHandlers(handlers): void { navigationHandlers = handlers; },
    getLastDrawingPredictions(): ReadonlyArray<InferencePrediction> {
      return lastDrawingPredictions.map(p => ({ ...p }));
    },
    dispose(): void { workerClient.dispose(); database.close(); }
  };
}

/* ------------------------------------------------------------------ */
/*  ONNX Worker Client                                                */
/* ------------------------------------------------------------------ */

/**
 * Creates a request-response client for the ONNX worker.
 *
 * @pre Worker support is available in the current browser runtime.
 * @post Model initialization and classification requests are serialized through one worker instance.
 */
function createOnnxWorkerClient(
  loadPredictionStrokeCount: (character: string) => Promise<number>
): {
  readonly initialize: () => Promise<void>;
  readonly classify: (sourceId: string, sourceUri: string, crop?: CropRegion) => Promise<ReadonlyArray<InferencePrediction>>;
  readonly dispose: () => void;
} {
  let nextRequestId = 1;
  let worker: Worker | null = null;
  let initializePromise: Promise<void> | null = null;
  const pendingRequests = new Map<number, { readonly resolve: (r: WorkerResponse) => void; readonly reject: (e: Error) => void }>();

  function ensureWorker(): Worker {
    if (typeof Worker === "undefined") {
      throw new Error("The character identifier cannot run on this device.");
    }
    if (worker === null) {
      worker = new Worker(
        new URL("./Features/Classification/Inference/OnnxInferenceWorker.ts", import.meta.url),
        { type: "module" }
      );
      worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
        const callbacks = pendingRequests.get(event.data.requestId);
        if (!callbacks) { return; }
        pendingRequests.delete(event.data.requestId);
        if (event.data.type === "error") {
          callbacks.reject(new Error(event.data.message ?? "The character could not be identified."));
          return;
        }
        callbacks.resolve(event.data);
      };
      worker.onerror = (): void => {
        pendingRequests.forEach(cb => cb.reject(new Error("The character identifier stopped unexpectedly.")));
        pendingRequests.clear();
      };
    }
    return worker;
  }

  function request(message: WorkerRequestPayload): Promise<WorkerResponse> {
    const requestId = nextRequestId;
    nextRequestId += 1;
    const currentWorker = ensureWorker();
    const requestMessage: WorkerRequest = message.type === "initialize"
      ? { type: "initialize", requestId, modelUrl: message.modelUrl, classesUrl: message.classesUrl, inputWidth: message.inputWidth, inputHeight: message.inputHeight }
      : { type: "classify", requestId, sourceId: message.sourceId, sourceUri: message.sourceUri, ...(message.crop ? { crop: message.crop } : {}) };
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
      currentWorker.postMessage(requestMessage);
    });
  }

  return {
    initialize(): Promise<void> {
      if (initializePromise === null) {
        initializePromise = request({
          type: "initialize", modelUrl: MODEL_URL, classesUrl: MODEL_CLASSES_URL,
          inputWidth: MODEL_INPUT_SIZE, inputHeight: MODEL_INPUT_SIZE
        }).then(() => undefined);
      }
      return initializePromise;
    },
    async classify(sourceId, sourceUri, crop): Promise<ReadonlyArray<InferencePrediction>> {
      await this.initialize();
      const response = await request({ type: "classify", sourceId, sourceUri, ...(crop ? { crop } : {}) });
      const rawPredictions = response.predictions ?? [];
      return Promise.all(rawPredictions.map(async p => ({
        character: p.character,
        confidence: p.confidence,
        strokeCount: await loadPredictionStrokeCount(p.character)
      })));
    },
    dispose(): void {
      pendingRequests.forEach(cb => cb.reject(new Error("The character identifier was stopped.")));
      pendingRequests.clear();
      worker?.terminate();
      worker = null;
      initializePromise = null;
    }
  };
}

/* ------------------------------------------------------------------ */
/*  SQL Helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Reads rows through a prepared SQL statement.
 *
 * @pre SQL uses placeholders for user supplied values.
 * @post Statement resources are released after rows are copied.
 */
function queryRows(database: Database, sql: string, values: ReadonlyArray<SqlValue> = []): ReadonlyArray<Record<string, SqlValue>> {
  const statement = database.prepare(sql);
  try {
    statement.bind(values);
    const rows: Array<Record<string, SqlValue>> = [];
    while (statement.step()) { rows.push(statement.getAsObject()); }
    return rows;
  } finally {
    statement.free();
  }
}

/** @post Empty strings and absent values are normalized to null. */
function readString(row: Record<string, SqlValue>, key: string): string | null {
  const value = row[key];
  if (typeof value !== "string") { return null; }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

/** @post Non-numeric values are normalized to null. */
function readNumber(row: Record<string, SqlValue>, key: string): number | null {
  const value = row[key];
  return typeof value === "number" ? value : null;
}

/* ------------------------------------------------------------------ */
/*  Data Loaders                                                      */
/* ------------------------------------------------------------------ */

async function loadCharacterSummary(database: Database, character: string): Promise<CharacterSummary> {
  const entryRows = queryRows(database, "select character, jlpt_level, joyo_level from kanji_entries where character = ?", [character]);
  const entry = entryRows[0];
  if (!entry) { return { character, primaryReadings: [], levels: [] }; }
  const readingRows = queryRows(database, "select value from kanji_readings where character = ? order by reading_type, value limit 4", [character]);
  const primaryReadings = readingRows.map(row => readString(row, "value")).filter((r): r is string => r !== null);
  const levels = createLevelLabels(readString(entry, "jlpt_level"), readString(entry, "joyo_level"));
  return { character, primaryReadings, levels };
}

async function loadStrokeCount(database: Database, character: string): Promise<number> {
  const rows = queryRows(database, "select stroke_count from kanji_entries where character = ?", [character]);
  return readNumber(rows[0] ?? {}, "stroke_count") ?? 0;
}

async function searchKanji(database: Database, term: string): Promise<ReadonlyArray<CharacterSummary>> {
  const likeTerm = `%${term}%`;
  const rows = queryRows(database,
    `select e.character from kanji_entries e where e.character like ?
       or exists (select 1 from kanji_readings r where r.character = e.character and r.value like ?)
       or exists (select 1 from kanji_meanings m where m.character = e.character and m.value like ?)
     order by e.stroke_count, e.character limit 50`,
    [likeTerm, likeTerm, likeTerm]);
  const characters = rows.map(row => readString(row, "character")).filter((c): c is string => c !== null);
  return Promise.all(characters.map(c => loadCharacterSummary(database, c)));
}

async function loadKanjiDetails(database: Database, character: string): Promise<DetailedKanjiEntry> {
  const entryRows = queryRows(database,
    `select character, radical, components_json, stroke_count, stroke_order_svg, jlpt_level, joyo_level
     from kanji_entries where character = ?`, [character]);
  const entry = entryRows[0];
  if (!entry) { throw new Error("The character details could not be loaded."); }
  const meanings = queryRows(database, "select language, value from kanji_meanings where character = ? order by language, value", [character])
    .map(row => { const l = readString(row, "language"); const v = readString(row, "value"); return l && v ? { language: l, value: v } : null; })
    .filter((m): m is { language: string; value: string } => m !== null);
  const kunyomi = loadStringColumn(database, "select value from kanji_readings where character = ? and reading_type = 'kunyomi' order by value", character);
  const onyomi = loadStringColumn(database, "select value from kanji_readings where character = ? and reading_type = 'onyomi' order by value", character);
  const kunyomiExamples = loadStringColumn(database, "select value from kanji_examples where character = ? and reading_type = 'kunyomi' order by value", character);
  const onyomiExamples = loadStringColumn(database, "select value from kanji_examples where character = ? and reading_type = 'onyomi' order by value", character);
  const components = parseComponents(readString(entry, "components_json"));
  const radical = readString(entry, "radical");
  const strokeOrder = readString(entry, "stroke_order_svg");
  const jlptLevel = readString(entry, "jlpt_level");
  const joyoLevel = readString(entry, "joyo_level");
  return {
    character,
    ...(radical ? { radical } : {}),
    ...(components.length > 0 ? { components } : {}),
    ...(meanings.length > 0 ? { meanings } : {}),
    ...(kunyomi.length > 0 ? { kunyomi } : {}),
    ...(kunyomiExamples.length > 0 ? { kunyomiExamples } : {}),
    ...(onyomi.length > 0 ? { onyomi } : {}),
    ...(onyomiExamples.length > 0 ? { onyomiExamples } : {}),
    strokeCount: readNumber(entry, "stroke_count") ?? 0,
    ...(strokeOrder ? { strokeOrder } : {}),
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(joyoLevel ? { joyoLevel } : {})
  };
}

function loadStringColumn(database: Database, sql: string, character: string): ReadonlyArray<string> {
  return queryRows(database, sql, [character]).map(row => readString(row, "value")).filter((v): v is string => v !== null);
}

function parseComponents(componentsJson: string | null): ReadonlyArray<string> {
  if (!componentsJson) { return []; }
  const parsed: unknown = JSON.parse(componentsJson);
  if (!Array.isArray(parsed)) { return []; }
  return parsed.filter((c): c is string => typeof c === "string" && c.trim().length > 0);
}

function createLevelLabels(jlptLevel: string | null, joyoLevel: string | null): ReadonlyArray<string> {
  return [...(jlptLevel ? [`JLPT ${jlptLevel}`] : []), ...(joyoLevel ? [`Joyo ${joyoLevel}`] : [])];
}

async function loadAboutInformation(database: Database): Promise<ReadonlyArray<AboutInformationItem>> {
  const sourceRows = queryRows(database, "select display_name, attribution, license, homepage from source_attributions order by source_id");
  const sourceItems = sourceRows.map(row => {
    const displayName = readString(row, "display_name") ?? "Data source";
    const attribution = readString(row, "attribution") ?? "Unknown contributor";
    const license = readString(row, "license") ?? "License information unavailable";
    return { label: displayName, value: `${attribution}. ${license}.` };
  });
  return [
    { label: "Version", value: packageMetadata.version },
    { label: "License", value: "Academic final degree project application." },
    { label: "Terms of use", value: "The app works offline and stores user history on this device." },
    { label: "Author", value: "Tycho Quintana Santana" },
    ...sourceItems
  ];
}

/* ------------------------------------------------------------------ */
/*  Capacitor + Browser Helpers                                       */
/* ------------------------------------------------------------------ */

async function getPhotoFromDevice(source: CameraSource): Promise<ImageDescriptor> {
  const photo = await Camera.getPhoto({
    quality: 90, allowEditing: false, resultType: CameraResultType.Uri, source, webUseInput: true
  });
  return createImageDescriptor(photo);
}

async function createImageDescriptor(photo: Photo): Promise<ImageDescriptor> {
  const uri = photo.webPath ?? photo.path ?? "";
  if (uri.trim().length === 0) { throw new Error("The selected image could not be opened."); }
  const dimensions = await loadImageDimensions(uri);
  return { uri, width: dimensions.width, height: dimensions.height, mimeType: `image/${photo.format}` };
}

function loadImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = (): void => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = (): void => reject(new Error("The selected image could not be opened."));
    image.src = uri;
  });
}

/* ------------------------------------------------------------------ */
/*  Drawing Helpers                                                   */
/* ------------------------------------------------------------------ */

function createDrawingSourceId(stroke: Stroke): string {
  return `drawing:${stroke.startedAt}:${stroke.endedAt}:${stroke.points.length}`;
}

function renderStrokeToDataUrl(stroke: Stroke): string {
  if (typeof document === "undefined") { throw new Error("The drawing could not be prepared."); }
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) { throw new Error("The drawing could not be prepared."); }
  context.fillStyle = "#000000";
  context.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  context.strokeStyle = "#FFFFFF";
  context.lineWidth = 10;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  stroke.points.forEach((point, index) => {
    const x = (point.x / 320) * MODEL_INPUT_SIZE;
    const y = (point.y / 320) * MODEL_INPUT_SIZE;
    if (index === 0) { context.moveTo(x, y); } else { context.lineTo(x, y); }
  });
  context.stroke();
  return canvas.toDataURL("image/png");
}

/* ------------------------------------------------------------------ */
/*  Local Storage Persistence                                         */
/* ------------------------------------------------------------------ */

function loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) { return Promise.resolve([]); }
    const parsed = JSON.parse(raw) as PersistedHistoryState;
    return Promise.resolve(parsed.groups ?? []);
  } catch {
    return Promise.resolve([]);
  }
}

function saveHistoryGroups(groups: ReadonlyArray<HistoryGroup>): void {
  const state: PersistedHistoryState = { schemaVersion: 1, groups };
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state));
}

function savePreferences(patch: { language?: string; theme?: ApplicationTheme }): void {
  try {
    const raw = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    /* storage unavailable */
  }
}
