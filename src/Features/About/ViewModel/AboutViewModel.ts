import { useEffect, useState } from "react";

import type { AboutInterface } from "../Contracts/AboutInterface";
import type { CreateAboutControllerDependencies } from "../CreateAboutController";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";
import { ApplicationError } from "../../../Shared/AppErrors";

export interface AboutScreenViewModel {
  readonly items: ReadonlyArray<AboutInformationItem>;
}

export function createAboutViewModel(dependencies: CreateAboutControllerDependencies): AboutInterface {
  return {
    async getAboutInformation(): Promise<ReadonlyArray<AboutInformationItem>> {
      const information = await dependencies.loadAboutInformation();

      if (information.length === 0) {
        throw new ApplicationError("Application information could not be loaded.");
      }

      return information.map(item => ({ ...item }));
    },
    async getApplicationVersion(): Promise<string> {
      const version = await dependencies.loadApplicationVersion();

      if (version.trim().length === 0) {
        throw new ApplicationError("Application version could not be loaded.");
      }

      return version;
    }
  };
}

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
