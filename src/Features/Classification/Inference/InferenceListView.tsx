import { IonContent } from "@ionic/react";

import type { InferenceListProps } from "./Contracts/InferenceListProps";

/**
 * Visible inference result list.
 */
export function InferenceListView(props: InferenceListProps): JSX.Element {
  return (
    <IonContent data-testid="inference-list-view">
      <ul>
        {props.results.map(result => (
          <li key={result.character}>
            <button
              aria-pressed={result.isSelected}
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
    </IonContent>
  );
}
