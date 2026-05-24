import type { CalligraphyEvaluationFeedback } from "../../../Shared/DomainTypes";

/**
 * Props contract for calligraphy evaluation feedback.
 *
 * Requirement IDs: R22.
 *
 * @pre An evaluation result exists for the writing attempt.
 * @inv Feedback is shown over the calligraphy practice screen.
 * @post The interface shows understandable visual feedback with the calculated score and summary.
 */
export interface CalligraphyEvaluationProps {
  readonly feedback: CalligraphyEvaluationFeedback;
  readonly onDismissRequested: () => void;
}
