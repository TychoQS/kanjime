import type { InferenceListProps } from "./Contracts/InferenceListProps";

/**
 * Visible inference result list.
 */
export function InferenceListView(props: InferenceListProps): JSX.Element {
  return (
    <>
      {props.results.map(result => (
        <button
          className="result-row"
          data-testid={`ocr-result-${result.character}`}
          key={result.character}
          onClick={() => props.onResultSelected(result.character)}
          type="button"
        >
          <span className="result-kanji">{result.character}</span>
          <span className="result-meta">{result.primaryReadings.join(" ")}</span>
          <span className="result-levels">{result.levels.join(" ")}</span>
        </button>
      ))}
    </>
  );
}
