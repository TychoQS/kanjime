import type { NavigationInterface } from "./Contracts/NavigationInterface";
import type { NavigationPage } from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the navigation controller.
 */
export interface CreateNavigationControllerDependencies {
  readonly clearPageState: (page: NavigationPage) => Promise<void> | void;
  readonly publishInitialRoute: (route: { page: "classification"; mode: "image" }) => Promise<void> | void;
}

/**
 * Creates the navigation controller stub used by the RED test suite.
 */
export function CreateNavigationController(
  _dependencies: CreateNavigationControllerDependencies
): NavigationInterface {
  return {
    navigateTo(_page: NavigationPage): void {},
    getInitialRoute(): { page: "classification"; mode: "image" } {
      return {
        page: "classification",
        mode: "image"
      };
    }
  };
}
