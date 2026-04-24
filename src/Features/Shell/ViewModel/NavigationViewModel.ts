import type { NavigationInterface } from "../Contracts/NavigationInterface";
import type { CreateNavigationControllerDependencies } from "../CreateNavigationController";
import type { NavigationPage } from "../../../Shared/DomainTypes";
import { clearRegisteredCanvasState } from "../../Classification/Canvas/ViewModel/CanvasViewModel";
import { clearRegisteredImageState } from "../../Classification/Image/ViewModel/ImageViewModel";
import {
  clearRegisteredInferenceDisplayState
} from "../../Classification/Inference/ViewModel/DisplayInferencesViewModel";

const INITIAL_ROUTE = {
  page: "classification",
  mode: "image"
} as const;

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

      void dependencies.clearPageState(page);
      if (page === "classification") {
        clearRegisteredCanvasState();
        clearRegisteredImageState();
        clearRegisteredInferenceDisplayState();
      }
      currentPage = page;
    },
    getInitialRoute(): { page: "classification"; mode: "image" } {
      if (!hasPublishedInitialRoute) {
        hasPublishedInitialRoute = true;
        void dependencies.publishInitialRoute(INITIAL_ROUTE);
      }

      return INITIAL_ROUTE;
    }
  };
}
