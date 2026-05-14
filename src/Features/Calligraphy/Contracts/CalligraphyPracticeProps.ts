import type { Stroke } from "../../../Shared/DomainTypes";

/**
 * Props contract for the active calligraphy practice screen.
 *
 * Requirement IDs: R19, R21, R23.
 *
 * @pre The user is in an active calligraphy practice.
 * @inv The writing canvas keeps most of the available screen space.
 * @inv Only the required back, clear, and validate controls are visible.
 * @inv Practice controls remain grouped at the top of the screen.
 * @post The interface shows the writing canvas as the main visual element
 * @post Interface only display the necessary controls to return, retry or validate.
 * @post Controls are located at the top of the screen.
 */
export interface CalligraphyPracticeProps {

  /**
   * Requirement ID: R20.
   *
   * @inv No visual aid for the target kanji is shown during practice.
   * @post The interface keeps the target kanji and its visual reference hidden.
   */
  readonly targetCharacter: string;
  readonly strokes: ReadonlyArray<Stroke>;
  readonly canReset: boolean;
  readonly canValidate: boolean;
  readonly onBackRequested: () => void;
  readonly onResetRequested: () => void;
  readonly onValidateRequested: () => void;
}
