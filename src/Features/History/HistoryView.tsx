import { IonContent } from "@ionic/react";

import type { HistoryProps } from "./Contracts/HistoryProps";

/**
 * Minimal history view stub kept intentionally empty for RED tests.
 */
export function HistoryView(_props: HistoryProps): JSX.Element {
  return <IonContent data-testid="history-view" />;
}
