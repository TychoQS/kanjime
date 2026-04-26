import type { InferenceListProps } from "./Contracts/InferenceListProps";

/**
 * Visible inference result list.
 */
export function InferenceListView(props: InferenceListProps): JSX.Element {
  return (
    <section data-testid="inference-list-view" className="resultList">
      <ul>
        {props.results.map(result => (
          <li key={result.character}>
            <button
              aria-pressed={result.isSelected}
              className="resultButton"
              data-testid={`inference-result-${result.character}`}
              onClick={() => props.onResultSelected(result.character)}
              type="button"
            >
              <span>{result.character}</span>
              <span>{result.primaryReadings.join(" ")}</span>
              <span>{result.levels.join(" ")}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
