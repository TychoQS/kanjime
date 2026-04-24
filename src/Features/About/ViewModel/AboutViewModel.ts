import type { AboutInterface } from "../Contracts/AboutInterface";
import type { CreateAboutControllerDependencies } from "../CreateAboutController";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";

/**
 * Creates the About view model.
 *
 * @pre About metadata and application version loaders are available.
 * @inv About information is not empty when valid metadata exists.
 * @post The returned controller exposes metadata through dependency results.
 */
export function createAboutViewModel(dependencies: CreateAboutControllerDependencies): AboutInterface {
  return {
    async getAboutInformation(): Promise<ReadonlyArray<AboutInformationItem>> {
      const information = await dependencies.loadAboutInformation();

      if (information.length === 0) {
        throw new Error("Application information could not be loaded.");
      }

      return information.map(item => ({ ...item }));
    },
    async getApplicationVersion(): Promise<string> {
      const version = await dependencies.loadApplicationVersion();

      if (version.trim().length === 0) {
        throw new Error("Application version could not be loaded.");
      }

      return version;
    }
  };
}

