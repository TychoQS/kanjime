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
export type NavigationPage = "classification" | "search" | "history" | "about" | "kanjiEntry" | "calligraphy";

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

/**
 * Supported calligraphy category grouping modes.
 */
export type CalligraphyGrouping = "jlpt" | "joyo";

/**
 * Category descriptor for a calligraphy grouping.
 */
export interface CalligraphyCategory {
  readonly id: string;
  readonly grouping: CalligraphyGrouping;
  readonly label: string;
  readonly order: number;
  readonly isResidual: boolean;
  readonly kanjiCount: number;
}

/**
 * Kanji summary displayed inside a calligraphy category.
 */
export interface CalligraphyKanjiSummary {
  readonly character: string;
  readonly categoryId: string;
  readonly grouping: CalligraphyGrouping;
  readonly strokeCount: number;
}

/**
 * Current writing attempt captured during calligraphy practice.
 */
export interface CalligraphyAttempt {
  readonly targetCharacter: string;
  readonly categoryId: string;
  readonly strokes: ReadonlyArray<Stroke>;
  readonly isFinalized: boolean;
}

/**
 * Metrics considered by the calligraphy evaluator.
 */
export interface CalligraphyEvaluationMetrics {
  readonly strokeCount: number;
  readonly strokeOrder: number;
  readonly approximateDirection: number;
  readonly generalSimilarity: number;
}

/**
 * Similarity strategy used by the visual calligraphy comparison.
 */
export type CalligraphySimilarityStrategy = "SIFT" | "FALLBACK";

/**
 * Visual similarity result produced for a finalized calligraphy attempt.
 */
export interface CalligraphyVisualSimilarityResult {
  readonly targetCharacter: string;
  readonly attemptId: string;
  readonly score: number;
  readonly strategy: CalligraphySimilarityStrategy;
  readonly matchedKeypointCount: number;
}

/**
 * Visual reference and attempt comparison shown with calligraphy metrics.
 */
export interface CalligraphyVisualComparison {
  readonly targetCharacter: string;
  readonly attemptId: string;
  readonly referenceImageUri: string;
  readonly attemptImageUri: string;
  readonly alignedAttemptImageUri?: string;
  readonly matchedKeypoints?: ReadonlyArray<readonly [StrokePoint, StrokePoint]>;
  readonly isReferenceVisible: boolean;
  readonly isAttemptVisible: boolean;
  readonly isHomographyApplied: boolean;
  readonly similarity: CalligraphyVisualSimilarityResult;
}

/**
 * Reference visual asset used to compare a calligraphy attempt.
 */
export interface CalligraphyReferenceVisual {
  readonly targetCharacter: string;
  readonly referenceImageUri: string;
}

/**
 * Similarity evaluation generated for a calligraphy attempt.
 */
export type CalligraphySimilarityEvaluation = CalligraphyVisualSimilarityResult & {
  readonly fallbackReason?: "insufficient_keypoints";
};

/**
 * Per-aspect explainable feedback for a calligraphy attempt.
 */
export interface CalligraphyEvaluationAspect {
  readonly id: keyof CalligraphyEvaluationMetrics;
  readonly score: number;
  readonly description: string;
}

/**
 * Calculated calligraphy evaluation result.
 */
export interface CalligraphyEvaluationResult {
  readonly targetCharacter: string;
  readonly score: number;
  readonly summary: string;
  readonly recommendation?: string;
  readonly metrics: CalligraphyEvaluationMetrics;
  readonly similarityEvaluation?: CalligraphySimilarityEvaluation;
  readonly visualComparison?: CalligraphyVisualComparison;
  readonly aspects?: ReadonlyArray<CalligraphyEvaluationAspect>;
}

/**
 * Visual feedback shown after a calligraphy evaluation.
 */
export interface CalligraphyEvaluationFeedback {
  readonly score: number;
  readonly summary: string;
  readonly recommendation?: string;
  readonly aspects?: ReadonlyArray<CalligraphyEvaluationAspect>;
  readonly isOverlayVisible: boolean;
  readonly visualComparison?: CalligraphyVisualComparison;
}

/**
 * Kanji entry displayed inside a selected calligraphy category.
 */
export interface CategoryKanjiEntry {
  readonly character: string;
  readonly categoryId: string;
  readonly strokeCount: number;
}

/**
 * Version configuration shared by the mobile application and the administration panel.
 */
export interface VersionConfiguration {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly minimumSupportedVersion: string;
  readonly updatedAt: string;
}

/**
 * Result produced by the startup version check.
 */
export interface VersionCheckResult {
  readonly configuration: VersionConfiguration | null;
  readonly isCurrentVersionDefined: boolean;
  readonly isUpdateAvailable: boolean;
  readonly isSupported: boolean;
  readonly usedLastKnownConfiguration: boolean;
}

/**
 * Non-blocking update notice state exposed to the mobile interface.
 */
export interface UpdateAvailabilityState {
  readonly isVisible: boolean;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly message: string;
  readonly canContinueUsingApplication: boolean;
}

/**
 * User action recorded before an error is captured.
 */
/**
 * User action categories that can be recorded before an application error.
 *
 */
export type ApplicationUserAction =
    | NavigationUserAction
    | ClassificationUserAction
    | SearchUserAction
    | KanjiUserAction
    | CalligraphyUserAction
    | PreferencesUserAction
    | ErrorUserAction;

interface BaseUserAction {
  readonly occurredAt: string;
}

export type NavigationUserAction =
  | NavigationPageAction
  | NavigationMenuAction;

interface NavigationPageAction extends BaseUserAction {
  readonly type: "navigation:opened" | "navigation:back";
  readonly page: NavigationPage;
}

interface NavigationMenuAction extends BaseUserAction {
  readonly type: "navigation:menu-opened" | "navigation:menu-closed";
}

export type ClassificationUserAction =
  | ClassificationInferenceUserAction
  | ClassificationStandardUserAction;

interface ClassificationInferenceUserAction extends BaseUserAction {
  readonly type: "classification:inference-requested";
  readonly mode: ClassificationMode;
  readonly hadResults?: boolean;
}

interface ClassificationStandardUserAction extends BaseUserAction {
  readonly type:
      | "classification:mode-selected"
      | "classification:image-selected"
      | "classification:crop-confirmed"
      | "classification:stroke-completed"
      | "classification:canvas-cleared"
      | "classification:photo-requested"
      | "classification:photo-cancelled";
  readonly mode: ClassificationMode;
}

export interface SearchUserAction extends BaseUserAction {
  readonly type: "search:submitted";
  readonly queryLength: number;
  readonly hadResults?: boolean;
}

export type KanjiUserAction =
  | KanjiDetailOpenedUserAction
  | KanjiCopiedUserAction;

interface KanjiDetailOpenedUserAction extends BaseUserAction {
  readonly type: "kanji:detail-opened";
  readonly character?: string;
}

interface KanjiCopiedUserAction extends BaseUserAction {
  readonly type: "kanji:copied";
  readonly character?: string;
}

export type CalligraphyUserAction =
  | CalligraphyGroupingRequiredAction
  | CalligraphyGroupingOptionalAction;

interface CalligraphyGroupingRequiredAction extends BaseUserAction {
  readonly type: "calligraphy:category-opened" | "calligraphy:practice-started" | "calligraphy:grouping-selected";
  readonly grouping?: CalligraphyGrouping;
}

interface CalligraphyGroupingOptionalAction extends BaseUserAction {
  readonly type:
      | "calligraphy:stroke-completed"
      | "calligraphy:attempt-reset"
      | "calligraphy:evaluation-requested";
  readonly grouping?: CalligraphyGrouping;
}

export interface PreferencesUserAction extends BaseUserAction {
  readonly type: "preferences:changed";
  readonly preference: "language" | "theme";
}

export interface ErrorUserAction extends BaseUserAction {
  readonly type: "error:captured";
}

/**
 * Basic execution context included in captured error reports.
 */
export interface ApplicationErrorContext {
  readonly applicationVersion: string;
  readonly webEngine: string;
  readonly webEngineVersion: string;
  readonly anonymousClientId?: string;
  readonly lastActions: ReadonlyArray<ApplicationUserAction>;
}

/**
 * Iteration 3 execution context alias shared by mobile and administration code.
 */
export type ErrorExecutionContext = ApplicationErrorContext;

/**
 * Structured report generated when a controlled error is captured.
 */
export interface ApplicationErrorReport {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
  readonly applicationVersion: string;
  readonly webEngine: string;
  readonly webEngineVersion: string;
  readonly anonymousClientId?: string;
  readonly lastActions: ReadonlyArray<ApplicationUserAction>;
  readonly isReadyForObservability: boolean;
}

/**
 * Allowed administration statuses for a reported application error.
 */
export type AdminErrorStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "DISCARDED";

/**
 * Visible filters supported by the administration error list.
 */
export type AdminErrorFilter = AdminErrorStatus | "all";

/**
 * Iteration 3 error report alias shared by mobile and administration code.
 */
export type ErrorReport = ApplicationErrorReport;

/**
 * Technical summary displayed in the administration dashboard.
 */
export interface AdminTechnicalSummary {
  readonly versionConfiguration: VersionConfiguration;
  readonly reportedErrorCount: number;
  readonly latestReportedErrorAt: string | null;
}

/**
 * Version state displayed by the administration panel.
 */
export interface AdminVersionSummary {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly minimumSupportedVersion: string;
  readonly updatedAt: string;
}

/**
 * Editable version form state displayed by the administration panel.
 */
export interface AdminVersionFormState {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly minimumSupportedVersion: string;
  readonly validationMessage: string | null;
  readonly canSave: boolean;
}

/**
 * Error row displayed in the administration error list.
 */
export interface AdminErrorSummary {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
  readonly applicationVersion: string;
  readonly status: AdminErrorStatus;
  readonly contextSummary: string;
}

/**
 * Error detail displayed by the administration panel.
 */
export interface AdminErrorDetail {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
  readonly applicationVersion: string;
  readonly status: AdminErrorStatus;
  readonly context: ApplicationErrorContext;
}
