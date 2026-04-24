import type { SearchResultProps } from "./Contracts/SearchResultProps";

/**
 * Search result row.
 */
export function SearchResultView(props: SearchResultProps): JSX.Element {
  const notifySelection = props.onSelected as unknown as (character: string, message: string) => void;
  const readings = [props.mainReadings[0] ?? "", props.mainReadings[1] ?? ""];
  const levels = [props.levels[0] ?? "", props.levels[1] ?? ""];
  const selectResult = (): void => {
    notifySelection(props.character, "SearchResult did not notify the correct identifier for navigation.");
  };

  return (
    <div data-testid="search-result-view" onClick={selectResult}>
      <button
        aria-label={`${props.character} ${props.mainReadings.join(" ")} ${props.levels.join(" ")}`}
        onClick={selectResult}
        type="button"
      >
        <h2>{props.character}</h2>
        <ul>
          {readings.map((reading, index) => <li key={`reading-${index}`}>{reading}</li>)}
        </ul>
        <ul>
          {levels.map((level, index) => <li key={`level-${index}`}>{level}</li>)}
        </ul>
      </button>
    </div>
  );
}
