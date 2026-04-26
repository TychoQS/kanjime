import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonText } from "@ionic/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { useApplicationComposition } from "../../ApplicationContext";
import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";
import { useI18n } from "../../Shared/I18n/I18nContext";
import { KanjiEntryView } from "./KanjiEntryView";

type KanjiRouteParams = {
  readonly character: string;
};

/**
 * Full kanji detail screen.
 *
 * @post Available kanji fields are rendered and the character can be copied.
 */
export function KanjiEntryScreen(): JSX.Element {
  const composition = useApplicationComposition();
  const { t } = useI18n();
  const history = useHistory();
  const params = useParams<KanjiRouteParams>();
  const character = decodeURIComponent(params.character);
  const [entry, setEntry] = useState<DetailedKanjiEntry | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const displayController = useMemo(() => composition.createDisplayKanjiController(() => history.goBack()), [composition, history]);

  useEffect(() => {
    let isActive = true;

    async function loadEntry(): Promise<void> {
      try {
        const details = await displayController.getKanjiDetails(character);

        if (isActive) {
          setEntry(details);
        }
      } catch {
        if (isActive) {
          setMessage(t("unexpectedError"));
        }
      }
    }

    void loadEntry();

    return () => {
      isActive = false;
    };
  }, [character, displayController, t]);

  async function copyCharacter(): Promise<void> {
    try {
      await displayController.copyKanjiCharacter(character);
      setMessage(t("copySuccess"));
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  if (entry === null) {
    return (
      <IonContent data-testid="kanji-detail-screen" className="screenContent">
        <IonText>{message ?? t("loadingModel")}</IonText>
      </IonContent>
    );
  }

  const primaryReadings = [
    ...(entry.kunyomi ?? []),
    ...(entry.onyomi ?? [])
  ];
  const levels = [
    entry.jlptLevel,
    entry.joyoLevel
  ].filter((value): value is string => typeof value === "string");

  return (
    <IonContent data-testid="kanji-detail-screen" className="screenContent">
      <div className="screenStack">
        <KanjiEntryView
          character={entry.character}
          meanings={entry.meanings ?? []}
          primaryReadings={primaryReadings}
          levels={levels}
          canCopy
          canGoBack
          onCopyRequested={() => void copyCharacter()}
          onBackRequested={() => displayController.returnToPreviousScreen()}
        />

        <DetailSection title={t("radical")} testId="kanji-radical">
          {entry.radical}
        </DetailSection>
        {entry.components && entry.components.length > 0 ? (
          <DetailSection title={t("components")} testId="kanji-components">
            {entry.components.join(" ")}
          </DetailSection>
        ) : null}
        {entry.kunyomi && entry.kunyomi.length > 0 ? (
          <DetailSection title={t("kunyomi")} testId="kanji-kunyomi">
            {entry.kunyomi.join(" ")}
          </DetailSection>
        ) : null}
        {entry.onyomi && entry.onyomi.length > 0 ? (
          <DetailSection title={t("onyomi")} testId="kanji-onyomi">
            {entry.onyomi.join(" ")}
          </DetailSection>
        ) : null}
        {entry.kunyomiExamples && entry.kunyomiExamples.length > 0 ? (
          <DetailSection title={`${t("kunyomi")} ${t("examples")}`} testId="kanji-kunyomi-examples">
            {entry.kunyomiExamples.join(" · ")}
          </DetailSection>
        ) : null}
        {entry.onyomiExamples && entry.onyomiExamples.length > 0 ? (
          <DetailSection title={`${t("onyomi")} ${t("examples")}`} testId="kanji-onyomi-examples">
            {entry.onyomiExamples.join(" · ")}
          </DetailSection>
        ) : null}
        <DetailSection title={t("strokeCount")} testId="kanji-stroke-count">
          {String(entry.strokeCount)}
        </DetailSection>
        {levels.length > 0 ? (
          <DetailSection title={t("levels")} testId="kanji-levels">
            {levels.join(" ")}
          </DetailSection>
        ) : null}
        {entry.strokeOrder ? (
          <IonCard data-testid="kanji-stroke-order">
            <IonCardHeader>
              <IonCardTitle>{t("strokeOrder")}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <svg
                className="strokeOrderSvg"
                role="img"
                aria-label={t("strokeOrder")}
                viewBox="0 0 109 109"
                dangerouslySetInnerHTML={{ __html: normalizeStrokeOrderSvg(entry.strokeOrder) }}
              />
            </IonCardContent>
          </IonCard>
        ) : null}
        {message ? <IonText data-testid="kanji-message">{message}</IonText> : null}
      </div>
    </IonContent>
  );
}

function DetailSection(props: {
  readonly title: string;
  readonly testId: string;
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <IonCard data-testid={props.testId}>
      <IonCardHeader>
        <IonCardTitle>{props.title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>{props.children}</IonCardContent>
    </IonCard>
  );
}

function normalizeStrokeOrderSvg(strokeOrder: string): string {
  const groupMatch = strokeOrder.match(/<g[\s\S]*<\/g>/);
  const group = groupMatch?.[0] ?? strokeOrder;

  return group.split("kvg:").join("data-kvg-");
}
