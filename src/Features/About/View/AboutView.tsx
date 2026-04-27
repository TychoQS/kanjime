import { IonText } from "@ionic/react";

import { translate } from "../../../Shared/I18n";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";
import { AboutListView } from "./AboutListView";

interface AboutViewProps {
  readonly items: ReadonlyArray<AboutInformationItem>;
  readonly language: string;
}

/**
 * About screen content view.
 *
 * @pre The information items and language are provided.
 * @post Renders the about section with a list of items or a loading message.
 */
export function AboutView(props: AboutViewProps): JSX.Element {
  return (
    <section className="detail-section">
      {props.items.length === 0 ? (
        <IonText color="medium">
          <p>{translate(props.language, "loadingApplication")}</p>
        </IonText>
      ) : (
        <AboutListView items={props.items} language={props.language} />
      )}
    </section>
  );
}
