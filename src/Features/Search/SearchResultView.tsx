import { IonContent } from "@ionic/react";

import type { SearchResultProps } from "./Contracts/SearchResultProps";

/**
 * Minimal search-result view stub kept intentionally empty for RED tests.
 */
export function SearchResultView(_props: SearchResultProps): JSX.Element {
  return <IonContent data-testid="search-result-view" />;
}
