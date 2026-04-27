import { useEffect, useState } from "react";

import type { CompositionRoot } from "../../CompositionRoot";
import type { AboutInformationItem } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import { AboutView } from "./View/AboutView";

interface AboutScreenProps {
  readonly root: CompositionRoot;
  readonly language: string;
}

/**
 * Application information screen using MVVM architecture.
 *
 * @pre The about controller is initialized in the composition root.
 * @post The About screen presents information obtained from the view model.
 */
export function AboutScreen(props: AboutScreenProps): JSX.Element {
  const [items, setItems] = useState<ReadonlyArray<AboutInformationItem>>([]);

  useEffect(() => {
    let isMounted = true;
    void props.root.aboutController.getAboutInformation()
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
  }, [props.root.aboutController, props.language]);

  return (
    <MobilePage title="" testId="about-screen">
      <div className="screen-shell">
        <div className="detail-scroll">
          <AboutView items={items} language={props.language} />
        </div>
      </div>
    </MobilePage>
  );
}
