import { IonContent } from "@ionic/react";

import type { KanjiEntryProps } from "./Contracts/KanjiEntryProps";

/**
 * Kanji entry detail screen.
 */
export function KanjiEntryView(props: KanjiEntryProps): JSX.Element {
  const requestCopy = props.onCopyRequested as unknown as (character: string) => void;

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
