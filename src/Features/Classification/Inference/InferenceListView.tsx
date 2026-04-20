import { IonContent } from "@ionic/react";

import type { InferenceListProps } from "./Contracts/InferenceListProps";

/**
 * Minimal inference list view stub kept intentionally empty for RED tests.
 */
export function InferenceListView(_props: InferenceListProps): JSX.Element {
  return <IonContent data-testid="inference-list-view" />;
}
