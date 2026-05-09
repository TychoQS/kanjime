import type {
  ApplicationTheme,
  CharacterSummary,
  CropRegion,
  DetailedKanjiEntry,
  HistoryGroup,
  ImageDescriptor,
  InferencePrediction,
  Stroke
} from "../../src/Shared/DomainTypes";

import { PROJECT_METADATA } from "./ProjectMetadata";

/**
 * Shared deterministic inputs used across the RED test suite.
 */
export const TEST_LANGUAGE = "en-US";
export const TEST_THEME: ApplicationTheme = "dark";
export const TEST_SEARCH_TERM = PROJECT_METADATA.primaryCharacter;
export const TEST_SEARCH_READING = "nichi";
export const TEST_PRIMARY_CHARACTER = PROJECT_METADATA.primaryCharacter;
export const TEST_SECONDARY_CHARACTER = PROJECT_METADATA.secondaryCharacter;
export const TEST_TERTIARY_CHARACTER = PROJECT_METADATA.thirdCharacter;
export const TEST_TIMESTAMP = "2026-04-20T10:00:00.000Z";
export const TEST_HISTORY_CATEGORIES = ["search", "visitedEntry", "imageClassification", "drawingClassification"] as const;
export const TEST_NON_KANJI_CHARACTERS = ["a", "あ", "ア"];

/**
 * Canonical stroke sample used by drawing-related tests.
 */
export const TEST_STROKE: Stroke = {
  points: [
    { x: 12, y: 54 },
    { x: 48, y: 54 }
  ],
  startedAt: TEST_TIMESTAMP,
  endedAt: "2026-04-20T10:00:01.000Z"
};

/**
 * Additional strokes.
 */
export const TEST_SECOND_STROKE: Stroke = {
  points: [
    { x: 12, y: 54 },
    { x: 48, y: 54 }
  ],
  startedAt: "2026-04-20T10:00:02.000Z",
  endedAt: "2026-04-20T10:00:03.000Z"
};

export const TEST_THIRD_STROKE: Stroke = {
  points: [
    { x: 12, y: 54 },
    { x: 48, y: 54 }
  ],
  startedAt: "2026-04-20T10:00:04.000Z",
  endedAt: "2026-04-20T10:00:05.000Z"
};

/**
 * Canonical canvas data URL sample used by drawing preprocessing tests.
 * Represents a minimal valid 1x1 black PNG in base64 format.
 */
export const TEST_CANVAS_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Representative colors and thresholds for canvas testing.
 */
export const TEST_CANVAS_BG_COLOR = "#000000";
export const TEST_CANVAS_STROKE_COLOR = "#FFFFFF";
export const TEST_CANVAS_CUSTOM_BG = "#1A1A1A";
export const TEST_CANVAS_CUSTOM_STROKE = "#EBEBEB";
export const WCAG_AAA_CONTRAST_THRESHOLD = 7.0;

/**
 * Inference model image size
 */
export const MODEL_INPUT_SIZE = 128

/**
 * Canonical image sample used by image-related tests.
 */
export const TEST_IMAGE: ImageDescriptor = {
  uri: "file:///kanji.png",
  width: 128,
  height: 128,
  mimeType: "image/png"
};

/**
 * Canonical crop sample used by crop-related tests.
 */
export const TEST_CROP: CropRegion = {
  x: 10,
  y: 10,
  width: 80,
  height: 80
};

/**
 * Raw predictions used by inference-related tests.
 */
export const TEST_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: TEST_PRIMARY_CHARACTER, confidence: 0.78, strokeCount: 4 },
  { character: TEST_SECONDARY_CHARACTER, confidence: 0.92, strokeCount: 5 },
  { character: TEST_TERTIARY_CHARACTER, confidence: 0.88, strokeCount: 3 }
];

/**
 * Extended predictions for strict truncation and filtering tests.
 * Uses real kanjis with their actual stroke counts.
 */
export const TEST_EXTENDED_PREDICTIONS = [
  { character: "海", confidence: 0.99, strokeCount: 9 },
  { character: "空", confidence: 0.98, strokeCount: 8 },
  { character: "十", confidence: 0.94, strokeCount: 2 },
  { character: "八", confidence: 0.96, strokeCount: 2 },
  { character: "一", confidence: 0.79, strokeCount: 1 },
  { character: "九", confidence: 0.75, strokeCount: 2 },
  { character: "二", confidence: 0.28, strokeCount: 2 },
  { character: "七", confidence: 0.37, strokeCount: 2 }
];

/**
 * Alternative predictions.
 */
export const TEST_OTHER_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: TEST_TERTIARY_CHARACTER, confidence: 0.95, strokeCount: 3 },
];

/**
 * Predictions returned by the model with strokeCount: 0 (not resolved from database).
 * Used for R40 testing - verifying the system enriches predictions with real strokeCount.
 */
export const TEST_MODEL_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: "一", confidence: 0.99, strokeCount: 0 },
  { character: "二", confidence: 0.98, strokeCount: 0 },
  { character: "三", confidence: 0.97, strokeCount: 0 },
  { character: "四", confidence: 0.96, strokeCount: 0 },
  { character: "五", confidence: 0.95, strokeCount: 0 }
];

/**
 * Resolved stroke counts from database for TEST_MODEL_PREDICTIONS characters.
 */
export const TEST_RESOLVED_STROKE_COUNTS: Record<string, number> = {
  "一": 1,
  "二": 2,
  "三": 3,
  "四": 4,
  "五": 5
};

/**
 * Expected predictions with correct stroke count from database.
 */
export const TEST_ENRICHED_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: "一", confidence: 0.99, strokeCount: 1 },
  { character: "二", confidence: 0.98, strokeCount: 2 },
  { character: "三", confidence: 0.97, strokeCount: 3 },
  { character: "四", confidence: 0.96, strokeCount: 4 },
  { character: "五", confidence: 0.95, strokeCount: 5 }
];

/**
 * Visible summaries used by search and list rendering tests.
 */
export const TEST_SUMMARIES: ReadonlyArray<CharacterSummary> = [
  {
    character: TEST_SECONDARY_CHARACTER,
    primaryReadings: ["ちょう", "cho"],
    levels: ["JLPT N4", "Joyo 2"]
  },
  {
    character: TEST_TERTIARY_CHARACTER,
    primaryReadings: ["しち", "nana"],
    levels: ["JLPT N5", "Joyo 1"]
  },
  {
    character: TEST_PRIMARY_CHARACTER,
    primaryReadings: ["にち", "nichi"],
    levels: ["JLPT N5", "Joyo 1"]
  }
];

export const TEST_MOCK_SUMMARIES: Record<string, CharacterSummary & { strokeCount: number }> = {
  [TEST_PRIMARY_CHARACTER]: {
    character: TEST_PRIMARY_CHARACTER,
    primaryReadings: ["にち", "nichi"],
    levels: ["JLPT N5", "Joyo 1"],
    strokeCount: 1
  },
  [TEST_SECONDARY_CHARACTER]: {
    character: TEST_SECONDARY_CHARACTER,
    primaryReadings: ["ちょう", "cho"],
    levels: ["JLPT N4", "Joyo 2"],
    strokeCount: 2
  },
  [TEST_TERTIARY_CHARACTER]: {
    character: TEST_TERTIARY_CHARACTER,
    primaryReadings: ["しち", "nana"],
    levels: ["JLPT N5", "Joyo 1"],
    strokeCount: 2
  },
  "海": { character: "海", primaryReadings: ["かい", "うみ"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 9 },
  "空": { character: "空", primaryReadings: ["くう", "そら"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 8 },
  "十": { character: "十", primaryReadings: ["じゅう", "とお"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 2 },
  "八": { character: "八", primaryReadings: ["はち", "や"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 2 },
  "九": { character: "九", primaryReadings: ["きゅう", "ここの"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 2 },
  "二": { character: "二", primaryReadings: ["に", "ふた"], levels: ["JLPT N5", "Joyo 1"], strokeCount: 2 }
};

export const TEST_MOCK_RESOLVE_SUMMARY = (character: string): (CharacterSummary & { strokeCount: number }) | null => {
  return TEST_MOCK_SUMMARIES[character] ?? null;
};

/**
 * Kanji "日" test data.
 */
export const TEST_KANJI_DAY: DetailedKanjiEntry = {
  character: "日",
  radical: "日",
  components: ["日"],
  meanings: [
    { language: "en", value: "Japan" },
    { language: "en", value: "day" },
    { language: "en", value: "sun" },
    { language: "es", value: "Japón" },
    { language: "es", value: "día" },
    { language: "es", value: "sol" },
    { language: "fr", value: "Japon" },
    { language: "fr", value: "jour" },
    { language: "fr", value: "soleil" }
  ],
  kunyomi: ["ひ", "-び", "-か"],
  kunyomiExamples: ["向日葵", "日", "日の丸", "日の出", "昼日中"],
  onyomi: ["ニチ", "ジツ"],
  onyomiExamples: ["日々草"],
  strokeCount: 4,
  strokeOrder: '<g id="kvg:kanji_065e5"><g id="kvg:065e5"><path id="kvg:065e5-s1" d="M31.5,24.5c1.12,1.12,1.74,2.75,1.74,4.75c0,1.6-0.16,38.11-0.09,53.5c0.02,3.82,0.05,6.35,0.09,6.75"/><path id="kvg:065e5-s2" d="M33.48,26c0.8-0.05,37.67-3.01,40.77-3.25c3.19-0.25,5,1.75,5,4.25c0,4-0.22,40.84-0.23,56c0,3.48,0,5.72,0,6"/><path id="kvg:065e5-s3" d="M34.22,55.25c7.78-0.5,35.9-2.5,44.06-2.75"/><path id="kvg:065e5-s4" d="M34.23,86.5c10.52-0.75,34.15-2.12,43.81-2.25"/></g></g>',
  jlptLevel: "1",
  joyoLevel: "1"
};

/**
 * Second kanji for history tests.
 */
export const TEST_KANJI_MOON = "月";

/**
 * Third kanji for history tests.
 */
export const TEST_KANJI_FIRE = "火";

/**
 * Reading for search tests.
 */
export const TEST_READING_NICHI = "ニチ";

/**
 * Reading for search tests.
 */
export const TEST_READING_HI = "ひ";

/**
 * Detailed kanji entry used by kanji-detail tests.
 */
export const TEST_KANJI_DETAILS: DetailedKanjiEntry = {
  character: TEST_PRIMARY_CHARACTER,
  radical: TEST_PRIMARY_CHARACTER,
  components: [TEST_PRIMARY_CHARACTER, TEST_SECONDARY_CHARACTER],
  meanings: [
    {
      language: TEST_LANGUAGE,
      value: PROJECT_METADATA.packageName
    }
  ],
  kunyomi: ["ひ"],
  kunyomiExamples: [TEST_PRIMARY_CHARACTER],
  onyomi: ["ニチ"],
  onyomiExamples: [TEST_SECONDARY_CHARACTER],
  strokeCount: 4,
  strokeOrder: "/assets/database/stroke-order.svg",
  jlptLevel: "N5",
  joyoLevel: "1"
};

/**
 * Standardized search result info used by SearchResultProps tests.
 * Includes all fields required by R12 (character, readings, levels).
 */
export const TEST_KANJI_INFO = {
  character: TEST_PRIMARY_CHARACTER,
  mainReadings: ["ニチ", "ひ"],
  levels: ["JLPT N5", "Joyo 1"],
};

/**
 * Partial kanji entry for testing incomplete kanji data structures.
 */
export const TEST_PARTIAL_KANJI_DETAILS: DetailedKanjiEntry = {
  character: TEST_SECONDARY_CHARACTER,
  strokeCount: 5
};

/**
 * Persisted history groups used by history-related tests.
 */
export const TEST_HISTORY_GROUPS: ReadonlyArray<HistoryGroup> = [
  {
    category: "search",
    entries: [
      {
        character: TEST_PRIMARY_CHARACTER,
        createdAt: TEST_TIMESTAMP,
        summary: TEST_SEARCH_TERM
      }
    ]
  },
  {
    category: "visitedEntry",
    entries: [
      {
        character: TEST_SECONDARY_CHARACTER,
        createdAt: "2026-04-20T09:00:00.000Z",
        summary: TEST_SEARCH_READING
      }
    ]
  },
  {
    category: "imageClassification",
    entries: [
      {
        character: TEST_TERTIARY_CHARACTER,
        createdAt: "2026-04-20T08:00:00.000Z",
        summary: TEST_IMAGE.uri
      }
    ]
  },
  {
    category: "drawingClassification",
    entries: [
      {
        character: TEST_PRIMARY_CHARACTER,
        createdAt: "2026-04-20T07:00:00.000Z",
        summary: String(TEST_STROKE.points.length)
      }
    ]
  }
];

/**
 * Default props for CanvasInputView tests.
 */
export const TEST_CANVAS_PROPS = {
  backgroundColor: TEST_CANVAS_BG_COLOR,
  strokeColor: TEST_CANVAS_STROKE_COLOR,
  isDrawingEnabled: true,
  strokes: [TEST_STROKE],
  activeStroke: null,
  onPointerDown: () => undefined,
  onPointerMove: () => undefined,
  onPointerUp: () => undefined,
  onPointerCancel: () => undefined,
  onStrokeCommitted: () => undefined,
  onClearRequested: () => undefined
};

/**
 * Screen test data for R10 (GlobalProps language verification).
 * Each entry defines route, title translation key, and checks to run.
 */
export const TEST_SCREENS_I18N = [
  {
    route: "/classification",
    titleKey: "recognition",
    checks: [
      "ocr-mode-segment",
      "ocr-image-segment",
      "ocr-drawing-segment",
      "image-ocr-zone",
      "take-photo-button",
      "choose-image-button",
      "ocr-results-panel"
    ]
  },
  {
    route: "/search",
    titleKey: "search",
    checks: ["kanji-searchbar", "search-results-panel"]
  },
  {
    route: "/history",
    titleKey: "history",
    checks: ["history-category-segment", "history-list-panel", "history-view"]
  },
  {
    route: "/about",
    titleKey: "about",
    checks: ["about-list"]
  }
] as const;
