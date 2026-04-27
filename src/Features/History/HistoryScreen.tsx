import { IonLabel, IonSegment, IonSegmentButton, IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import type { CompositionRoot } from "../../CompositionRoot";
import type { HistoryCategory, HistoryGroup } from "../../Shared/DomainTypes";
import { getHistoryCategoryLabel, translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";

interface HistoryScreenProps {
  readonly root: CompositionRoot;
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
    void props.root.loadHistoryGroups().then(setGroups).catch(() => setGroups([]));
  }, [props.root]);

  const activeEntries = useMemo(() => {
    return groups.find(group => group.category === category)?.entries ?? [];
  }, [category, groups]);

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
            <div className="result-list scroll-list">
              {activeEntries.length === 0 ? (
                <IonText color="medium">
                  <p>{translate(props.language, "emptyHistory")}</p>
                </IonText>
              ) : activeEntries.map(entry => (
                <button
                  className="result-row"
                  data-testid={`history-entry-${category}-${entry.character}`}
                  key={`${category}-${entry.character}`}
                  onClick={() => history.push(`/kanji/${encodeURIComponent(entry.character)}`, { skipHistory: true })}
                  type="button"
                >
                  <span className="result-kanji">{entry.character}</span>
                  <span className="result-meta">{entry.summary}</span>
                  <time className="result-levels" dateTime={entry.createdAt}>{formatHistoryDate(entry.createdAt)}</time>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MobilePage>
  );
}

function toHistoryCategory(value: string): HistoryCategory {
  return HISTORY_CATEGORIES.includes(value as HistoryCategory) ? value as HistoryCategory : "search";
}

function formatHistoryDate(value: string): string {
  return value.slice(0, 10);
}
