import { IonText } from "@ionic/react";

import { translate } from "../../../Shared/I18n";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";
import { AboutListView } from "./AboutListView";

interface AboutViewProps {
  readonly items: ReadonlyArray<AboutInformationItem>;
  readonly language: string;
}

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
