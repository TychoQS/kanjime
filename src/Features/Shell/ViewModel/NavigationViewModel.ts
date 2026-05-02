import type { NavigationInterface } from "../Contracts/NavigationInterface";
import type { CreateNavigationControllerDependencies } from "../CreateNavigationController";
import type { NavigationPage } from "../../../Shared/DomainTypes";
import {
  markRegisteredClassificationScreenForReset
} from "../../Classification/Mode/ViewModel/ClassificationViewModel";
import { markRegisteredHistoryScreenForReset } from "../../History/ViewModel/HistoryViewModel";
import { markRegisteredSearchScreenForReset } from "../../Search/ViewModel/SearchViewModel";

const INITIAL_ROUTE = {
  page: "classification",
  mode: "image"
} as const;

function markCurrentPageStateForReset(page: NavigationPage): void {
  if (page === "classification") {
    markRegisteredClassificationScreenForReset();
    return;
  }

  if (page === "search") {
    markRegisteredSearchScreenForReset();
    return;
  }

  if (page === "history") {
    markRegisteredHistoryScreenForReset();
  }
}

/**
 * Creates the navigation view model.
 *
 * @pre Navigation dependencies can clear page state and publish startup route.
 * @inv Preferences are not modified by navigation actions.
 * @post The returned controller publishes the initial OCR route and clears page state on navigation.
 */
export function createNavigationViewModel(
  dependencies: CreateNavigationControllerDependencies
): NavigationInterface {
  let currentPage: NavigationPage = INITIAL_ROUTE.page;
  let hasPublishedInitialRoute = false;

  return {
    navigateTo(page: NavigationPage): void {
      if (!hasPublishedInitialRoute) {
        hasPublishedInitialRoute = true;
        void dependencies.publishInitialRoute(INITIAL_ROUTE);
      }

      const previousPage = currentPage;
      if (previousPage !== page) {
        markCurrentPageStateForReset(previousPage);
      }
      void dependencies.clearPageState(page);
      currentPage = page;
    },
    getInitialRoute(): { page: "classification"; mode: "image" } {
      if (!hasPublishedInitialRoute) {
        hasPublishedInitialRoute = true;
        void dependencies.publishInitialRoute(INITIAL_ROUTE);
      }

      return INITIAL_ROUTE;
    },
    availablePageIds: ["classification", "search", "history", "about"] as const
  };
}
