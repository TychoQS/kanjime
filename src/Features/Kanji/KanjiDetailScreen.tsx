import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { arrowBack, copyOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import type { CompositionRoot } from "../../CompositionRoot";
import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";

interface KanjiDetailScreenProps {
  readonly root: CompositionRoot;
  readonly language: string;
}

interface KanjiRouteParams {
  readonly character: string;
}

interface DetailRouteState {
  readonly skipHistory?: boolean;
}

/**
 * Full kanji detail screen with grouped dictionary information.
 *
 * @pre A valid character route parameter is present.
 * @post Available fields for the selected kanji are rendered in one continuous flow.
 */
export function KanjiDetailScreen(props: KanjiDetailScreenProps): JSX.Element {
  const history = useHistory();
  const location = useLocation<DetailRouteState | undefined>();
  const params = useParams<KanjiRouteParams>();
  const character = decodeURIComponent(params.character);
  const [details, setDetails] = useState<DetailedKanjiEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    void props.root.loadKanjiDetails(character, props.language)
      .then(nextDetails => {
        setDetails(nextDetails);
        setIsLoading(false);
      })
      .catch(() => {
        setDetails(null);
        setErrorMessage("The character details could not be loaded.");
        setIsLoading(false);
      });
  }, [character, location.state?.skipHistory, props.language, props.root]);

  const levels = useMemo(() => {
    if (!details) {
      return [];
    }

    return [details.jlptLevel, details.joyoLevel].filter((level): level is string => Boolean(level));
  }, [details]);

  const copyKanji = async (): Promise<void> => {
    const { Clipboard } = await import("@capacitor/clipboard");
    await Clipboard.write({ string: character });
  };

  return (
    <IonPage>
      <IonHeader translucent={false}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              data-testid="kanji-back-button"
              onClick={() => history.goBack()}
              aria-label="Back"
            >
              <IonIcon icon={arrowBack} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{translate(props.language, "kanjiDetails")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              data-testid="kanji-copy-button"
              disabled={!details}
              onClick={() => void copyKanji()}
              aria-label={translate(props.language, "copyKanji")}
            >
              <IonIcon icon={copyOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent data-testid="kanji-detail-screen" scrollY={false}>
        <div className="screen-shell">
          <div className="detail-scroll">
            {isLoading ? (
              <div className="center-state">
                <IonSpinner name="crescent" />
              </div>
            ) : null}

            {errorMessage ? (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            ) : null}

            {details ? (
              <article className="kanji-detail">
                <header className="kanji-hero" data-testid="kanji-detail-header">
                  <h1>{details.character}</h1>
                </header>

                {details.meanings && details.meanings.length > 0 ? (
                  <section className="detail-section" data-testid="kanji-meanings-section">
                    <h2>{translate(props.language, "meaning")}</h2>
                    <p>{details.meanings.map(meaning => meaning.value).join("; ")}</p>
                  </section>
                ) : null}

                {(details.kunyomi?.length || details.onyomi?.length) ? (
                  <section className="detail-section" data-testid="kanji-readings-section">
                    <h2>{translate(props.language, "readings")}</h2>
                    <div className="two-column">
                      {details.kunyomi && details.kunyomi.length > 0 ? (
                        <div>
                          <h3>{translate(props.language, "kunyomi")}</h3>
                          <p>{details.kunyomi.join(" · ")}</p>
                        </div>
                      ) : null}
                      {details.onyomi && details.onyomi.length > 0 ? (
                        <div>
                          <h3>{translate(props.language, "onyomi")}</h3>
                          <p>{details.onyomi.join(" · ")}</p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                <section className="detail-section" data-testid="kanji-information-section">
                  <h2>{translate(props.language, "information")}</h2>
                  <dl className="info-grid">
                    {details.radical ? <InfoItem label={translate(props.language, "radical")} value={details.radical} /> : null}
                    {details.components && details.components.length > 0 ? (
                      <InfoItem label={translate(props.language, "components")} value={details.components.join(" ")} />
                    ) : null}
                    <InfoItem label={translate(props.language, "strokeCount")} value={String(details.strokeCount)} />
                    {levels.length > 0 ? <InfoItem label="JLPT / Joyo" value={levels.join(" · ")} /> : null}
                  </dl>
                </section>

                {(details.kunyomiExamples?.length || details.onyomiExamples?.length) ? (
                  <section className="detail-section" data-testid="kanji-examples-section">
                    <h2>{translate(props.language, "examples")}</h2>
                    {details.kunyomiExamples && details.kunyomiExamples.length > 0 ? (
                      <ExampleGroup title={translate(props.language, "kunyomi")} examples={details.kunyomiExamples} />
                    ) : null}
                    {details.onyomiExamples && details.onyomiExamples.length > 0 ? (
                      <ExampleGroup title={translate(props.language, "onyomi")} examples={details.onyomiExamples} />
                    ) : null}
                  </section>
                ) : null}

                {details.strokeOrder ? (
                  <section className="detail-section" data-testid="kanji-stroke-order-section">
                    <h2>{translate(props.language, "strokeOrder")}</h2>
                    <svg
                      className="stroke-order-svg"
                      viewBox="0 0 109 109"
                      role="img"
                      aria-label={translate(props.language, "strokeOrder")}
                      dangerouslySetInnerHTML={{ __html: details.strokeOrder }}
                    />
                  </section>
                ) : null}
              </article>
            ) : null}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

function InfoItem(props: { readonly label: string; readonly value: string }): JSX.Element {
  return (
    <>
      <dt>{props.label}</dt>
      <dd>{props.value}</dd>
    </>
  );
}

function ExampleGroup(props: { readonly title: string; readonly examples: ReadonlyArray<string> }): JSX.Element {
  return (
    <div className="example-group">
      <h3>{props.title}</h3>
      <ul>
        {props.examples.map(example => <li key={example}>{example}</li>)}
      </ul>
    </div>
  );
}
