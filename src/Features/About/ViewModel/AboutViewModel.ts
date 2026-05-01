import { useEffect, useState } from "react";

import type { AboutInterface } from "../Contracts/AboutInterface";
import type { CreateAboutControllerDependencies } from "../CreateAboutController";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";

export interface AboutScreenViewModel {
  readonly items: ReadonlyArray<AboutInformationItem>;
}

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

/**
 * Creates the About screen hook view model.
 *
 * @pre The about controller is initialized before the screen becomes interactive.
 * @inv The hook exposes immutable About items for rendering.
 * @post The returned state mirrors the latest successfully loaded About information.
 */
export function useAboutScreenViewModel(
  aboutController: AboutInterface,
  language: string,
  isEnabled: boolean
): AboutScreenViewModel {
  const [items, setItems] = useState<ReadonlyArray<AboutInformationItem>>([]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isMounted = true;

    void aboutController.getAboutInformation()
      .then(nextItems => {
        if (isMounted) {
          setItems(nextItems);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItems([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [aboutController, isEnabled, language]);

  return {
    items
  };
}
