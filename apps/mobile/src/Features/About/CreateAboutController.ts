import type { AboutInterface } from "./Contracts/AboutInterface";
import type { AboutInformationItem } from "@kanjime/shared";
import { createAboutViewModel } from "./ViewModel/AboutViewModel";

/**
 * External collaborators consumed by the About controller.
 */
export interface CreateAboutControllerDependencies {
  readonly loadAboutInformation: () => Promise<ReadonlyArray<AboutInformationItem>>;
  readonly loadApplicationVersion: () => Promise<string>;
}

/**
 * Creates the About controller.
 */
export function CreateAboutController(dependencies: CreateAboutControllerDependencies): AboutInterface {
  return createAboutViewModel(dependencies);
}
