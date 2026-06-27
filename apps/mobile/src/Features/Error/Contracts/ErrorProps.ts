/**
 * Props contract for the controlled error interface.
 *
 * Requirement IDs: R25.
 *
 * @pre An unexpected application error has been captured during app execution.
 * @inv The visible message does not include stack traces, technical internals, or sensitive details.
 * @post The user sees a clear, non-technical error message.
 */
export interface ErrorProps {
  readonly isVisible: boolean;
  readonly message: string;
  readonly canContinue: boolean;
  readonly onDismissRequested: () => void;
}
