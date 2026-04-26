import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonList, IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";

import { useApplicationComposition } from "../../ApplicationContext";
import type { AboutInformationItem } from "../../Shared/DomainTypes";
import { useI18n } from "../../Shared/I18n/I18nContext";

/**
 * About screen.
 *
 * @post Application metadata and source acknowledgements are visible.
 */
export function AboutScreen(): JSX.Element {
  const composition = useApplicationComposition();
  const { t } = useI18n();
  const [items, setItems] = useState<ReadonlyArray<AboutInformationItem>>([]);
  const [version, setVersion] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const aboutController = useMemo(() => composition.createAboutController(), [composition]);

  useEffect(() => {
    let isActive = true;

    async function loadAbout(): Promise<void> {
      try {
        const [nextItems, nextVersion] = await Promise.all([
          aboutController.getAboutInformation(),
          aboutController.getApplicationVersion()
        ]);

        if (isActive) {
          setItems(nextItems);
          setVersion(nextVersion);
        }
      } catch {
        if (isActive) {
          setMessage(t("unexpectedError"));
        }
      }
    }

    void loadAbout();

    return () => {
      isActive = false;
    };
  }, [aboutController, t]);

  return (
    <IonContent data-testid="about-screen" className="screenContent">
      <div className="screenStack">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t("about")}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList data-testid="about-information-list">
              <dl className="definitionList">
                <dt>{t("version")}</dt>
                <dd data-testid="about-version">{version}</dd>
                {items.map(item => (
                  <div key={`${item.label}-${item.value}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </IonList>
          </IonCardContent>
        </IonCard>
        {message ? <IonText color="danger" data-testid="about-error">{message}</IonText> : null}
      </div>
    </IonContent>
  );
}
