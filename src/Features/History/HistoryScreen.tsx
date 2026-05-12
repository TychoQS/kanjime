import { IonIcon, IonSegment, IonSegmentButton } from "@ionic/react";
import { createOutline, eyeOutline, imageOutline, searchOutline } from "ionicons/icons";

import { getHistoryCategoryLabel, translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { HistoryView } from "./HistoryView";
import { HISTORY_CATEGORIES } from "./ViewModel/HistoryViewModel";

const HISTORY_CATEGORY_ICONS = {
  search: searchOutline,
  visitedEntry: eyeOutline,
  imageClassification: imageOutline,
  drawingClassification: createOutline
} as const;

export function HistoryScreen(): JSX.Element {
  const { history, preferences } = useAppViewModelContext();

  return (
    <MobilePage title={translate(preferences.preferences.language, "history")} testId="history-screen">
      <div className="screen-shell">
        <div className="screen-flow">
          <IonSegment
            className="mode-segment"
            data-testid="history-category-segment"
            value={history.category}
            onIonChange={event => history.setCategory(String(event.detail.value ?? ""))}
          >
            {HISTORY_CATEGORIES.map(historyCategory => (
              <IonSegmentButton
                aria-label={getHistoryCategoryLabel(preferences.preferences.language, historyCategory)}
                data-testid={`history-segment-${historyCategory}`}
                key={historyCategory}
                value={historyCategory}
                title={getHistoryCategoryLabel(preferences.preferences.language, historyCategory)}
              >
                <IonIcon icon={HISTORY_CATEGORY_ICONS[historyCategory]} />
              </IonSegmentButton>
            ))}
          </IonSegment>

          <section className="results-panel grow-panel" data-testid="history-list-panel">
            {history.isEmpty ? (
              <div className="result-list scroll-list" data-testid="history-view" />
            ) : (
              <HistoryView
                groups={history.activeGroups}
                onEntrySelected={(character) => {
                  void history.openKanjiEntry(character);
                }}
              />
            )}
          </section>
        </div>
      </div>
    </MobilePage>
  );
}
