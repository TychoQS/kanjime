import type { NavigationPage } from "../../../Shared/DomainTypes";

/**
 * Contract for application-level navigation.
 *
 * @inv User preferences remain unchanged across navigation actions.
 * @inv The initial application entry for OCR is the image mode.
 */
export interface NavigationInterface {
  /**
   * Navigates to another page after clearing the current page state.
   *
   * Requirement IDs: R27.
   *
   * @pre The user is on a navigable page.
   * @post The current page state is discarded and navigation moves to the selected page without changing user preferences.
   */
  navigateTo(page: "classification" | "search" | "history" | "about" | "kanjiEntry"): void;

  /**
   * Returns the initial route expected when the application starts.
   *
   * Requirement IDs: R28.
   *
   * @pre The inference model is loaded.
   * @post The returned route points to the OCR screen in image mode.
   */
  getInitialRoute(): {
    page: "classification";
    mode: "image";
  };
  /**
   * List of identifiers for all pages that can be navigated to via the shell menu.
   */
  readonly availablePageIds: ReadonlyArray<NavigationPage>;
}
