/**
 * Props contract for the application navigation drawer.
 *
 * Requirement IDs: R8, R9.
 *
 * @pre The navigation menu is open.
 * @inv The close control is always available while the menu is open.
 * @inv The current page remains visibly identified inside the menu.
 * @post Users can close the menu or navigate directly to another page through visible controls.
 */
export interface NavigationProps {
  readonly isMenuOpen: boolean;
  readonly currentPage: "classification" | "search" | "history" | "about" | "kanjiEntry";
  readonly availablePages: ReadonlyArray<{
    id: "classification" | "search" | "history" | "about" | "kanjiEntry";
    label: string;
  }>;
  readonly onCloseRequested: () => void;
  readonly onNavigateRequested: (
    page: "classification" | "search" | "history" | "about" | "kanjiEntry"
  ) => void;
}
