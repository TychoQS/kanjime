import { IonLabel, IonSegment, IonSegmentButton } from "@ionic/react";

import { getHistoryCategoryLabel, translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { HistoryView } from "./HistoryView";
import { HISTORY_CATEGORIES } from "./ViewModel/HistoryViewModel";

/**
 * Categorized persistent history screen.
 *
 * @pre Persistence has been initialized by the composition root.
 * @post Entries render by category from newest to oldest.
 */
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
                data-testid={`history-segment-${historyCategory}`}
                key={historyCategory}
                value={historyCategory}
              >
                <IonLabel>{getHistoryCategoryLabel(preferences.preferences.language, historyCategory)}</IonLabel>
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
