import { IonText } from "@ionic/react";
import { useEffect, useState } from "react";

import type { AboutDisplayItem, CompositionRoot } from "../../CompositionRoot";
import { translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";

interface AboutScreenProps {
  readonly root: CompositionRoot;
  readonly language: string;
}

/**
 * Application information, licenses, terms, and acknowledgments.
 *
 * @pre Application metadata and attribution assets are bundled.
 * @post The About screen presents localized headings and non-empty information.
 */
export function AboutScreen(props: AboutScreenProps): JSX.Element {
  const [items, setItems] = useState<ReadonlyArray<AboutDisplayItem>>([]);

  useEffect(() => {
    void props.root.loadAboutItems().then(setItems).catch(() => setItems([]));
  }, [props.root]);

  return (
    <MobilePage title={translate(props.language, "about")} testId="about-screen">
      <div className="screen-shell">
        <div className="detail-scroll">
          <section className="detail-section">
            <h2>{translate(props.language, "about")}</h2>
            {items.length === 0 ? (
              <IonText color="medium">
                <p>{translate(props.language, "loadingApplication")}</p>
              </IonText>
            ) : (
              <dl className="about-list">
                {items.map(item => (
                  <div key={`${item.label}-${item.value}`} className="about-row">
                    <dt>{localizeAboutLabel(props.language, item.label)}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>
      </div>
    </MobilePage>
  );
}

function localizeAboutLabel(language: string, label: string): string {
  if (label === "Version") {
    return translate(language, "version");
  }

  if (label === "License") {
    return translate(language, "license");
  }

  if (label === "Terms of use") {
    return translate(language, "terms");
  }

  return label;
}
