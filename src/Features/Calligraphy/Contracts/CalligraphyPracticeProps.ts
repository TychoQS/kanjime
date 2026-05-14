import type { Stroke } from "../../../Shared/DomainTypes";

/**
 * Props contract for the active calligraphy practice screen.
 *
 * Requirement IDs: R19, R20, R21, R23.
 *
 * @pre The user is in an active calligraphy practice.
 * @inv The writing canvas keeps most of the available screen space.
 * @inv No visual aid for the target kanji is shown during practice.
 * @inv Only the required back, clear, and validate controls are visible.
 * @inv Practice controls remain grouped at the top of the screen.
 * @post The interface shows the writing canvas as the main visual element with only the necessary controls.
 */
export interface CalligraphyPracticeProps {
  readonly targetCharacter: string;
  readonly strokes: ReadonlyArray<Stroke>;
  readonly canReset: boolean;
  readonly canValidate: boolean;
  readonly onBackRequested: () => void;
  readonly onResetRequested: () => void;
  readonly onValidateRequested: () => void;
}
