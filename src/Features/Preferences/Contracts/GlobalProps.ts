/**
 * Props contract for global application presentation concerns.
 *
 * Requirement IDs: R10, R15.
 *
 * @pre A language and a theme are configured for the application.
 * @inv All visible text follows the active language consistently.
 * @inv All rendered visuals follow the active theme while preserving contrast and legibility.
 * @post Consumers render text and colors according to the current language and theme.
 */
export interface GlobalProps {
  readonly language: string;
  readonly theme: "light" | "dark" | "system";
  readonly translationsReady: boolean;
  readonly children?: React.ReactNode;
}
