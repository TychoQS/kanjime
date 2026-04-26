import type { KanjiEntryProps } from "./Contracts/KanjiEntryProps";

/**
 * Kanji entry detail screen.
 */
export function KanjiEntryView(props: KanjiEntryProps): JSX.Element {
  return (
    <section data-testid="kanji-entry-view" className="kanjiHeader">
      <article>
        {props.canGoBack ? (
          <button data-testid="kanji-back-button" onClick={props.onBackRequested} type="button">
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
          <button data-testid="copy-kanji-button" onClick={props.onCopyRequested} type="button">
            Copy
          </button>
        ) : null}
      </article>
    </section>
  );
}
