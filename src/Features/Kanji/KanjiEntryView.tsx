import { IonContent } from "@ionic/react";

import type { KanjiEntryProps } from "./Contracts/KanjiEntryProps";

/**
 * Minimal kanji-entry view stub kept intentionally empty for RED tests.
 */
export function KanjiEntryView(_props: KanjiEntryProps): JSX.Element {
  return <IonContent data-testid="kanji-entry-view" />;
}
