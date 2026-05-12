/**
 * Shared domain types used by controllers, views, and tests.
 */

/**
 * Application theme modes supported by the preference contracts.
 */
export type ApplicationTheme = "light" | "dark" | "system";

/**
 * OCR mode identifiers used across classification flows.
 */
export type ClassificationMode = "image" | "drawing";

/**
 * Navigation targets available in the application shell.
 */
export type NavigationPage = "classification" | "search" | "history" | "about" | "kanjiEntry";

/**
 * Persistent history categories defined by the contracts.
 */
export type HistoryCategory = "search" | "visitedEntry" | "imageClassification" | "drawingClassification";

/**
 * Point stored inside a canvas stroke.
 */
export interface StrokePoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Structured representation of a drawing stroke.
 */
export interface Stroke {
  readonly points: ReadonlyArray<StrokePoint>;
  readonly startedAt: string;
  readonly endedAt: string;
}

/**
 * Crop region selected on top of an image.
 */
export interface CropRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Loaded image descriptor used by image-mode contracts.
 */
export interface ImageDescriptor {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType: string;
}

/**
 * Combined image state exposed by the image controller contract.
 */
export interface ImageState {
  readonly image: ImageDescriptor | null;
  readonly crop: CropRegion | null;
}

/**
 * Meaning entry associated with a selected kanji.
 */
export interface MeaningEntry {
  readonly language: string;
  readonly value: string;
}

/**
 * Summary row reused in search and visible inference lists.
 */
export interface CharacterSummary {
  readonly character: string;
  readonly primaryReadings: ReadonlyArray<string>;
  readonly levels: ReadonlyArray<string>;
}

/**
 * Raw prediction emitted by the inference layer.
 */
export interface InferencePrediction {
  readonly character: string;
  readonly confidence: number;
  readonly strokeCount: number;
}

/**
 * Detailed kanji entry shape reused in support utilities and controllers.
 */
export interface DetailedKanjiEntry {
  readonly character: string;
  readonly radical?: string;
  readonly components?: ReadonlyArray<string>;
  readonly meanings?: ReadonlyArray<MeaningEntry>;
  readonly kunyomi?: ReadonlyArray<string>;
  readonly kunyomiExamples?: ReadonlyArray<string>;
  readonly onyomi?: ReadonlyArray<string>;
  readonly onyomiExamples?: ReadonlyArray<string>;
  readonly strokeCount: number;
  readonly strokeOrder?: string;
  readonly jlptLevel?: string;
  readonly joyoLevel?: string;
}

/**
 * History row persisted under one category.
 */
export interface HistoryEntry {
  readonly character: string;
  readonly createdAt: string;
  readonly summary: string;
}

/**
 * Group of history rows sharing the same category.
 */
export interface HistoryGroup {
  readonly category: HistoryCategory;
  readonly entries: ReadonlyArray<HistoryEntry>;
}

/**
 * About screen informational item.
 */
export interface AboutInformationItem {
  readonly label: string;
  readonly value: string;
}

/**
 * Inference model configuration snapshot.
 */
export interface ModelConfiguration {
  readonly inputWidth: number;
  readonly inputHeight: number;
  readonly isLoaded: boolean;
}
