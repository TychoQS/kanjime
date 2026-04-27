import { IonLabel, IonSegment, IonSegmentButton, IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import type { HistoryInterface } from "./Contracts/HistoryInterface";
import type { HistoryCategory, HistoryGroup } from "../../Shared/DomainTypes";
import { getHistoryCategoryLabel, translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import { HistoryView } from "./HistoryView";

interface HistoryScreenProps {
  readonly historyController: HistoryInterface;
  readonly language: string;
}

const HISTORY_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];

/**
 * Categorized persistent history screen.
 *
 * @pre Persistence has been initialized by the composition root.
 * @post Entries render by category from newest to oldest.
 */
export function HistoryScreen(props: HistoryScreenProps): JSX.Element {
  const history = useHistory();
  const [groups, setGroups] = useState<ReadonlyArray<HistoryGroup>>([]);
  const [category, setCategory] = useState<HistoryCategory>("search");

  useEffect(() => {
    void props.historyController.getEntriesByCategory()
      .then(nextGroups => setGroups(nextGroups as ReadonlyArray<HistoryGroup>))
      .catch(() => setGroups([]));
  }, [props.historyController]);

  const activeGroups = useMemo(() => {
    return groups.filter(group => group.category === category);
  }, [category, groups]);

  const isEmpty = activeGroups.length === 0 || activeGroups[0].entries.length === 0;

  return (
    <MobilePage title={translate(props.language, "history")} testId="history-screen">
      <div className="screen-shell">
        <div className="screen-flow">
          <IonSegment
            className="mode-segment"
            data-testid="history-category-segment"
            value={category}
            onIonChange={event => setCategory(toHistoryCategory(String(event.detail.value ?? "")))}
          >
            {HISTORY_CATEGORIES.map(historyCategory => (
              <IonSegmentButton
                data-testid={`history-segment-${historyCategory}`}
                key={historyCategory}
                value={historyCategory}
              >
                <IonLabel>{getHistoryCategoryLabel(props.language, historyCategory)}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <section className="results-panel grow-panel" data-testid="history-list-panel">
            {isEmpty ? (
              <div className="result-list scroll-list" data-testid="history-view">
                <IonText color="medium">
                  <p>{translate(props.language, "emptyHistory")}</p>
                </IonText>
              </div>
            ) : (
              <HistoryView
                groups={activeGroups}
                onEntrySelected={(character) => {
                  void props.historyController.openKanjiEntry(character).then(() => {
                    history.push(`/kanji/${encodeURIComponent(character)}`, { skipHistory: true });
                  });
                }}
              />
            )}
          </section>
        </div>
      </div>
    </MobilePage>
  );
}

function toHistoryCategory(value: string): HistoryCategory {
  return HISTORY_CATEGORIES.includes(value as HistoryCategory) ? value as HistoryCategory : "search";
}
