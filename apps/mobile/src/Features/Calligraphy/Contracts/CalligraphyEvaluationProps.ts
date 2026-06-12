import type {
  CalligraphyEvaluationFeedback,
  CalligraphyEvaluationMetrics,
  CalligraphyVisualComparison
} from "@kanjime/shared";

/**
 * Props contract for calligraphy evaluation feedback.
 *
 * Requirement IDs: R22, R30.
 *
 * @pre An evaluation result exists for the writing attempt together with its visual comparison and metric breakdown.
 * @inv The visual comparison remains positioned above the evaluation metric breakdown while the feedback is visible.
 * @post The interface shows understandable visual feedback with the calculated score, summary, top comparison block, and metric breakdown.
 */
export interface CalligraphyEvaluationProps {
  readonly feedback: CalligraphyEvaluationFeedback;
  readonly comparison?: CalligraphyVisualComparison | null;
  readonly metrics?: CalligraphyEvaluationMetrics | null;
  readonly onDismissRequested: () => void;
}
