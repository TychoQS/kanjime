import type { AboutInterface } from "./Contracts/AboutInterface";
import type { AboutInformationItem } from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the About controller.
 */
export interface CreateAboutControllerDependencies {
  readonly loadAboutInformation: () => Promise<ReadonlyArray<AboutInformationItem>>;
  readonly loadApplicationVersion: () => Promise<string>;
}

/**
 * Creates the About controller stub used to keep the RED test suite compilable.
 */
export function CreateAboutController(_dependencies: CreateAboutControllerDependencies): AboutInterface {
  return {
    async getAboutInformation(): Promise<ReadonlyArray<AboutInformationItem>> {
      return [];
    },
    async getApplicationVersion(): Promise<string> {
      return "";
    }
  };
}
