/**
 * Props contract for the blocking loading screen component.
 *
 * Requirement IDs: R7.
 *
 * @pre A blocking process is currently in progress.
 * @inv User interaction stays blocked while the loading screen is visible.
 * @post A visible loading indicator is rendered to communicate the ongoing process.
 */
export interface LoadingScreenProps {
  readonly isVisible: boolean;
  readonly message: string;
  readonly blocksInteraction: boolean;
}
