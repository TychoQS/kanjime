import type { SearchResultProps } from "./Contracts/SearchResultProps";

/**
 * Search result row.
 */
export function SearchResultView(props: SearchResultProps): JSX.Element {
  const selectResult = (): void => {
    props.onSelected(props.character);
  };

  return (
    <div data-testid="search-result-view">
      <button
        aria-label={`${props.character} ${props.mainReadings.join(" ")} ${props.levels.join(" ")}`}
        className="resultButton"
        data-testid={`search-result-${props.character}`}
        onClick={selectResult}
        type="button"
      >
        <h2>{props.character}</h2>
        {props.mainReadings.length > 0 ? <p>{props.mainReadings.join(" ")}</p> : null}
        {props.levels.length > 0 ? <p>{props.levels.join(" ")}</p> : null}
      </button>
    </div>
  );
}
