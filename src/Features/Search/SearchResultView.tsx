import type { SearchResultProps } from "./Contracts/SearchResultProps";

/**
 * Search result row.
 */
export function SearchResultView(props: SearchResultProps): JSX.Element {
  const selectResult = (): void => {
    (props.onSelected as unknown as (character: string, message: string) => void)(
      props.character,
      "SearchResult did not notify the correct identifier for navigation."
    );
  };

  const readings = [props.mainReadings[0] ?? "", props.mainReadings[1] ?? ""];
  const levels = [props.levels[0] ?? "", props.levels[1] ?? ""];

  return (
    <button
      className="result-row"
      data-testid="search-result-view"
      onClick={selectResult}
      type="button"
      aria-label={`${props.character} ${props.mainReadings.join(" ")} ${props.levels.join(" ")}`}
    >
      <h2 className="result-kanji">{props.character}</h2>
      <ul className="result-meta inline-list">
        {readings.map((reading, index) => (
          <li
            className={reading.length === 0 ? "result-placeholder-item" : undefined}
            key={`reading-${index}`}
          >
            {reading.length > 0 ? reading : "_"}
          </li>
        ))}
      </ul>
      <ul className="result-levels inline-list">
        {levels.map((level, index) => (
          <li
            className={level.length === 0 ? "result-placeholder-item" : undefined}
            key={`level-${index}`}
          >
            {level.length > 0 ? level : "_"}
          </li>
        ))}
      </ul>
    </button>
  );
}
