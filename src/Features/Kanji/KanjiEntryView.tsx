import { IonContent } from "@ionic/react";
import { createContext, useContext, useMemo } from "react";

import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import type { KanjiEntryProps } from "./Contracts/KanjiEntryProps";

interface KanjiEntryRenderProviderProps {
  readonly details: DetailedKanjiEntry;
  readonly language: string;
  readonly children: JSX.Element;
}

interface KanjiEntryRenderContextValue {
  readonly details: DetailedKanjiEntry;
  readonly language: string;
}

const KanjiEntryRenderContext = createContext<KanjiEntryRenderContextValue | null>(null);

/**
 * Provides detail context for rendering the full kanji entry content.
 */
export function KanjiEntryRenderProvider(props: KanjiEntryRenderProviderProps): JSX.Element {
  const contextValue = useMemo(() => ({
    details: props.details,
    language: props.language
  }), [props.details, props.language]);

  return (
    <KanjiEntryRenderContext.Provider value={contextValue}>
      {props.children}
    </KanjiEntryRenderContext.Provider>
  );
}

/**
 * Kanji entry detail screen.
 */
export function KanjiEntryView(props: KanjiEntryProps): JSX.Element {
  const contextValue = useContext(KanjiEntryRenderContext);
  const requestCopy = props.onCopyRequested as unknown as (character: string) => void;

  if (contextValue !== null) {
    const { details, language } = contextValue;
    const levels = [details.jlptLevel, details.joyoLevel].filter((level): level is string => Boolean(level));

    return (
      <article className="kanji-detail">
        <header className="kanji-hero" data-testid="kanji-detail-header">
          <h1>{details.character}</h1>
        </header>

        {details.meanings && details.meanings.length > 0 ? (
          <section className="detail-section" data-testid="kanji-meanings-section">
            <h2>{translate(language, "meaning")}</h2>
            <p>{details.meanings.map(meaning => meaning.value).join("; ")}</p>
          </section>
        ) : null}

        {(details.kunyomi?.length || details.onyomi?.length) ? (
          <section className="detail-section" data-testid="kanji-readings-section">
            <h2>{translate(language, "readings")}</h2>
            <div className="two-column">
              {details.kunyomi && details.kunyomi.length > 0 ? (
                <div>
                  <h3>{translate(language, "kunyomi")}</h3>
                  <p>{details.kunyomi.join(" · ")}</p>
                </div>
              ) : null}
              {details.onyomi && details.onyomi.length > 0 ? (
                <div>
                  <h3>{translate(language, "onyomi")}</h3>
                  <p>{details.onyomi.join(" · ")}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="detail-section" data-testid="kanji-information-section">
          <h2>{translate(language, "information")}</h2>
          <dl className="info-grid">
            {details.radical ? <InfoItem label={translate(language, "radical")} value={details.radical} /> : null}
            {details.components && details.components.length > 0 ? (
              <InfoItem label={translate(language, "components")} value={details.components.join(" ")} />
            ) : null}
            <InfoItem label={translate(language, "strokeCount")} value={String(details.strokeCount)} />
            {levels.length > 0 ? <InfoItem label="JLPT / Joyo" value={levels.join(" · ")} /> : null}
          </dl>
        </section>

        {(details.kunyomiExamples?.length || details.onyomiExamples?.length) ? (
          <section className="detail-section" data-testid="kanji-examples-section">
            <h2>{translate(language, "examples")}</h2>
            {details.kunyomiExamples && details.kunyomiExamples.length > 0 ? (
              <ExampleGroup title={translate(language, "kunyomi")} examples={details.kunyomiExamples} />
            ) : null}
            {details.onyomiExamples && details.onyomiExamples.length > 0 ? (
              <ExampleGroup title={translate(language, "onyomi")} examples={details.onyomiExamples} />
            ) : null}
          </section>
        ) : null}

        {details.strokeOrder ? (
          <section className="detail-section" data-testid="kanji-stroke-order-section">
            <h2>{translate(language, "strokeOrder")}</h2>
            <svg
              className="stroke-order-svg"
              viewBox="0 0 109 109"
              role="img"
              aria-label={translate(language, "strokeOrder")}
              dangerouslySetInnerHTML={{ __html: details.strokeOrder }}
            />
          </section>
        ) : null}
      </article>
    );
  }

  return (
    <IonContent data-testid="kanji-entry-view">
      <article>
        {props.canGoBack ? (
          <button onClick={props.onBackRequested} type="button">
            Back
          </button>
        ) : null}
        <h1>{props.character}</h1>
        {props.meanings.length > 0 ? (
          <ul>
            {props.meanings.map(meaning => (
              <li key={`${meaning.language}-${meaning.value}`}>
                {meaning.language}: {meaning.value}
              </li>
            ))}
          </ul>
        ) : null}
        {props.primaryReadings.length > 0 ? <p>{props.primaryReadings.join(" ")}</p> : null}
        {props.levels.length > 0 ? <p>{props.levels.join(" ")}</p> : null}
        {props.canCopy && props.character.trim().length > 0 ? (
          <button onClick={() => requestCopy(props.character)} type="button">
            Copy
          </button>
        ) : null}
      </article>
    </IonContent>
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
