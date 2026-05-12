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
