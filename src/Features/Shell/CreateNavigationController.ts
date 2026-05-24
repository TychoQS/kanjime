import type { NavigationInterface } from "./Contracts/NavigationInterface";
import type { NavigationPage } from "../../Shared/DomainTypes";
import { createNavigationViewModel } from "./ViewModel/NavigationViewModel";

/**
 * External collaborators consumed by the navigation controller.
 */
export interface CreateNavigationControllerDependencies {
  readonly clearPageState: {
    bivarianceHack(page: NavigationPage): Promise<void> | void;
  }["bivarianceHack"];
  readonly publishInitialRoute: (route: { page: "classification"; mode: "image" }) => Promise<void> | void;
}

/**
 * Creates the navigation controller.
 */
export function CreateNavigationController(
  dependencies: CreateNavigationControllerDependencies
): NavigationInterface {
  return createNavigationViewModel(dependencies);
}
