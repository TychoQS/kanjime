import type {
  ApplicationTheme,
  CalligraphyAttempt,
  CalligraphyCategory,
  CalligraphyEvaluationResult, CategoryKanjiEntry,
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
export const MODEL_INPUT_SIZE = 128;

/**
 * Shared calligraphy test identifiers and values.
 */
export const TEST_CALLIGRAPHY_TARGET_CHARACTER = "水";
export const TEST_CALLIGRAPHY_CATEGORY_ID = "jlpt-n5";
export const TEST_CALLIGRAPHY_JOYO_GROUPING = "joyo";
export const TEST_CALLIGRAPHY_JLPT_GROUPING = "jlpt";
export const TEST_CALLIGRAPHY_INVALID_GROUPING = "hsk";
export const TEST_CALLIGRAPHY_JLPT_GROUPING_LABEL = "JLPT";
export const TEST_CALLIGRAPHY_JLPT_LABEL = "JLPT N5";
export const TEST_CALLIGRAPHY_RESIDUAL_LABEL = "Unclassified";
export const TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS = [
  "jlpt-n5",
  "jlpt-n4",
  "jlpt-n3",
  "jlpt-n2",
  "jlpt-n1"
] as const;

export const TEST_CALLIGRAPHY_JOYO_CATEGORY_GRADES = [
  10,
  9,
  8,
  6,
  5,
  4,
  3,
  2,
  1
] as const;
export const TEST_CALLIGRAPHY_EVALUATION_SUMMARY = "The attempt is recognizable.";
export const TEST_CALLIGRAPHY_EVALUATION_SCORE = 82;
export const TEST_CALLIGRAPHY_BACK_LABEL = "Back";
export const TEST_CALLIGRAPHY_CLEAR_LABEL = "Clear";
export const TEST_CALLIGRAPHY_VALIDATE_LABEL = "Validate";

/**
 * Shared calligraphy domain objects.
 */

export const TEST_CALLIGRAPHY_JLPT_CATEGORIES: ReadonlyArray<CalligraphyCategory> =
    TEST_CALLIGRAPHY_JLPT_CATEGORY_IDS.map((id, index) => {
      const level = 5 - index;

      return {
        id,
        grouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
        label: `JLPT N${level}`,
        order: index + 1,
        isResidual: false,
        kanjiCount: 1
      };
    });

export const TEST_CALLIGRAPHY_JOYO_CATEGORIES: ReadonlyArray<CalligraphyCategory> =
    TEST_CALLIGRAPHY_JOYO_CATEGORY_GRADES.map((grade, index) => ({
      id: `joyo-grade-${grade}`,
      grouping: TEST_CALLIGRAPHY_JOYO_GROUPING,
      label: `Jōyō Grade ${grade}`,
      order: index + 1,
      isResidual: false,
      kanjiCount: 1
    }));

export const TEST_CALLIGRAPHY_CATEGORY: CalligraphyCategory =
    TEST_CALLIGRAPHY_JLPT_CATEGORIES[0];

export const TEST_CALLIGRAPHY_JLPT_RESIDUAL_CATEGORY: CalligraphyCategory = {
  id: "jlpt-unclassified",
  grouping: TEST_CALLIGRAPHY_JLPT_GROUPING,
  label: TEST_CALLIGRAPHY_RESIDUAL_LABEL,
  order: 6,
  isResidual: true,
  kanjiCount: 297
};

export const TEST_CALLIGRAPHY_JOYO_RESIDUAL_CATEGORY: CalligraphyCategory = {
  id: "joyo-unclassified",
  grouping: TEST_CALLIGRAPHY_JOYO_GROUPING,
  label: TEST_CALLIGRAPHY_RESIDUAL_LABEL,
  order: 10,
  isResidual: true,
  kanjiCount: 297
};

export const TEST_CALLIGRAPHY_VISIBLE_JLPT_CATEGORIES: ReadonlyArray<CalligraphyCategory> = [
  ...TEST_CALLIGRAPHY_JLPT_CATEGORIES,
  TEST_CALLIGRAPHY_JLPT_RESIDUAL_CATEGORY
];

export const TEST_CALLIGRAPHY_VISIBLE_JOYO_CATEGORIES: ReadonlyArray<CalligraphyCategory> = [
  ...TEST_CALLIGRAPHY_JOYO_CATEGORIES,
  TEST_CALLIGRAPHY_JOYO_RESIDUAL_CATEGORY
];

export const TEST_CALLIGRAPHY_VIEW_CATEGORY: CalligraphyCategory = {
  ...TEST_CALLIGRAPHY_CATEGORY,
  kanjiCount: 3
};
export const TEST_CALLIGRAPHY_FINALIZED_ATTEMPT: CalligraphyAttempt = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
  isFinalized: true,
  strokes: [
    {
      points: [{ x: 1, y: 1 }],
      startedAt: "2026-05-14T10:00:00.000Z",
      endedAt: "2026-05-14T10:00:01.000Z"
    }
  ]
};

export const TEST_CALLIGRAPHY_EMPTY_ATTEMPT: CalligraphyAttempt = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
  isFinalized: false,
  strokes: []
};

export const TEST_CALLIGRAPHY_ATTEMPT_WITH_STROKE: CalligraphyAttempt = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  categoryId: TEST_CALLIGRAPHY_CATEGORY_ID,
  isFinalized: false,
  strokes: [
    {
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      startedAt: "2026-05-14T10:00:00.000Z",
      endedAt: "2026-05-14T10:00:01.000Z"
    }
  ]
};

export const TEST_CALLIGRAPHY_EVALUATION_RESULT: CalligraphyEvaluationResult = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
  summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  metrics: {
    strokeCount: 1,
    strokeOrder: 1,
    approximateDirection: 1,
    generalSimilarity: 0.8
  }
};

export const TEST_CALLIGRAPHY_INVALID_EVALUATION_RESULT: CalligraphyEvaluationResult = {
  targetCharacter: TEST_CALLIGRAPHY_TARGET_CHARACTER,
  score: TEST_CALLIGRAPHY_EVALUATION_SCORE,
  summary: TEST_CALLIGRAPHY_EVALUATION_SUMMARY,
  metrics: {
    strokeCount: NaN,
    strokeOrder: NaN,
    approximateDirection: NaN,
    generalSimilarity: NaN
  }
};

export const TEST_CALLIGRAPHY_KANJI_BY_CATEGORY_CASES = [
  {
    categoryId: "jlpt-n5",
    unsortedKanji: [
      { character: "日", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 },
      { character: "一", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 1 },
      { character: "大", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 3 }
    ],
    sortedKanji: [
      { character: "一", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 1 },
      { character: "大", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 3 },
      { character: "日", categoryId: "jlpt-n5", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 }
    ]
  },
  {
    categoryId: "jlpt-n4",
    unsortedKanji: [
      { character: "両", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 6 },
      { character: "不", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 },
      { character: "仕", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 5 }
    ],
    sortedKanji: [
      { character: "不", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 },
      { character: "仕", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 5 },
      { character: "両", categoryId: "jlpt-n4", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 6 }
    ]
  },
  {
    categoryId: "jlpt-n3",
    unsortedKanji: [
      { character: "漢", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 },
      { character: "森", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 12 },
      { character: "想", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 }
    ],
    sortedKanji: [
      { character: "森", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 12 },
      { character: "漢", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 },
      { character: "想", categoryId: "jlpt-n3", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 }
    ]
  },
  {
    categoryId: "jlpt-n2",
    unsortedKanji: [
      { character: "愛", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 },
      { character: "器", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 15 },
      { character: "緑", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 14 }
    ],
    sortedKanji: [
      { character: "愛", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 },
      { character: "緑", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 14 },
      { character: "器", categoryId: "jlpt-n2", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 15 }
    ]
  },
  {
    categoryId: "jlpt-n1",
    unsortedKanji: [
      { character: "議", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 20 },
      { character: "機", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 16 },
      { character: "艦", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 21 }
    ],
    sortedKanji: [
      { character: "機", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 16 },
      { character: "議", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 20 },
      { character: "艦", categoryId: "jlpt-n1", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 21 }
    ]
  },
  {
    categoryId: "joyo-grade-1",
    unsortedKanji: [
      { character: "日", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "一", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 1 },
      { character: "人", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 2 }
    ],
    sortedKanji: [
      { character: "一", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 1 },
      { character: "人", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 2 },
      { character: "日", categoryId: "joyo-grade-1", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 }
    ]
  },
  {
    categoryId: "joyo-grade-2",
    unsortedKanji: [
      { character: "曜", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 },
      { character: "光", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 6 },
      { character: "雲", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 12 }
    ],
    sortedKanji: [
      { character: "光", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 6 },
      { character: "雲", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 12 },
      { character: "曜", categoryId: "joyo-grade-2", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 }
    ]
  },
  {
    categoryId: "joyo-grade-3",
    unsortedKanji: [
      { character: "漢", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 },
      { character: "写", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 5 },
      { character: "感", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 }
    ],
    sortedKanji: [
      { character: "写", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 5 },
      { character: "漢", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 },
      { character: "感", categoryId: "joyo-grade-3", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 }
    ]
  },
  {
    categoryId: "joyo-grade-4",
    unsortedKanji: [
      { character: "説", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 14 },
      { character: "管", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 14 },
      { character: "不", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 }
    ],
    sortedKanji: [
      { character: "不", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "説", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 14 },
      { character: "管", categoryId: "joyo-grade-4", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 14 }
    ]
  },
  {
    categoryId: "joyo-grade-5",
    unsortedKanji: [
      { character: "興", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 },
      { character: "圧", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 5 },
      { character: "質", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 15 }
    ],
    sortedKanji: [
      { character: "圧", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 5 },
      { character: "質", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 15 },
      { character: "興", categoryId: "joyo-grade-5", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 }
    ]
  },
  {
    categoryId: "joyo-grade-6",
    unsortedKanji: [
      { character: "難", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 },
      { character: "己", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 3 },
      { character: "装", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 12 }
    ],
    sortedKanji: [
      { character: "己", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 3 },
      { character: "装", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 12 },
      { character: "難", categoryId: "joyo-grade-6", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 }
    ]
  },
  {
    categoryId: "joyo-grade-8",
    unsortedKanji: [
      { character: "彙", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 },
      { character: "挨", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 10 },
      { character: "曖", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 17 }
    ],
    sortedKanji: [
      { character: "挨", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 10 },
      { character: "彙", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 13 },
      { character: "曖", categoryId: "joyo-grade-8", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 17 }
    ]
  },
  {
    categoryId: "joyo-grade-9",
    unsortedKanji: [
      { character: "璽", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 19 },
      { character: "釜", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 10 },
      { character: "韓", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 }
    ],
    sortedKanji: [
      { character: "釜", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 10 },
      { character: "韓", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 18 },
      { character: "璽", categoryId: "joyo-grade-9", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 19 }
    ]
  },
  {
    categoryId: "joyo-grade-10",
    unsortedKanji: [
      { character: "鷹", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 24 },
      { character: "丑", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "謎", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 }
    ],
    sortedKanji: [
      { character: "丑", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "謎", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 },
      { character: "鷹", categoryId: "joyo-grade-10", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 24 }
    ]
  },
  {
    categoryId: "jlpt-unclassified",
    unsortedKanji: [
      { character: "曖", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 17 },
      { character: "丑", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 },
      { character: "彙", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 }
    ],
    sortedKanji: [
      { character: "丑", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 4 },
      { character: "彙", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 13 },
      { character: "曖", categoryId: "jlpt-unclassified", grouping: TEST_CALLIGRAPHY_JLPT_GROUPING, strokeCount: 17 }
    ]
  },
  {
    categoryId: "joyo-unclassified",
    unsortedKanji: [
      { character: "鴨", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 },
      { character: "丑", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "曖", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 17 }
    ],
    sortedKanji: [
      { character: "丑", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 4 },
      { character: "鴨", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 16 },
      { character: "曖", categoryId: "joyo-unclassified", grouping: TEST_CALLIGRAPHY_JOYO_GROUPING, strokeCount: 17 }
    ]
  }
] as const;

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
