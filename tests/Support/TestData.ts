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

/**
 * Canonical stroke sample used by drawing-related tests.
 */
export const TEST_STROKE: Stroke = {
  points: [
    { x: 12, y: 18 },
    { x: 48, y: 54 }
  ],
  startedAt: TEST_TIMESTAMP,
  endedAt: "2026-04-20T10:00:01.000Z"
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
export const MODEL_INPUT_SIZE = 224

/**
 * Canonical image sample used by image-related tests.
 */
export const TEST_IMAGE: ImageDescriptor = {
  uri: "file:///kanji.png",
  width: 224,
  height: 224,
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
export const TEST_EXTENDED_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: "一", confidence: 0.99, strokeCount: 1 },
  { character: "二", confidence: 0.98, strokeCount: 2 },
  { character: "七", confidence: 0.97, strokeCount: 2 },
  { character: "八", confidence: 0.96, strokeCount: 2 },
  { character: "九", confidence: 0.95, strokeCount: 2 },
  { character: "十", confidence: 0.94, strokeCount: 2 },
  { character: "空", confidence: 0.93, strokeCount: 8 },
  { character: "海", confidence: 0.92, strokeCount: 9 },
];

/**
 * Alternative predictions.
 */
export const TEST_OTHER_PREDICTIONS: ReadonlyArray<InferencePrediction> = [
  { character: TEST_TERTIARY_CHARACTER, confidence: 0.95, strokeCount: 3 },
];

/**
 * Visible summaries used by search and list rendering tests.
 */
export const TEST_SUMMARIES: ReadonlyArray<CharacterSummary> = [
  {
    character: TEST_PRIMARY_CHARACTER,
    primaryReadings: ["にち", "nichi"],
    levels: ["JLPT N5", "Joyo 1"]
  },
  {
    character: TEST_SECONDARY_CHARACTER,
    primaryReadings: ["ちょう", "cho"],
    levels: ["JLPT N4", "Joyo 2"]
  }
];

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
  onStrokeCommitted: () => undefined,
  onClearRequested: () => undefined
};
