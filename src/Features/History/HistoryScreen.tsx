import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import { useApplicationComposition } from "../../ApplicationContext";
import type { HistoryGroup } from "../../Shared/DomainTypes";
import { useI18n } from "../../Shared/I18n/I18nContext";
import { HistoryView } from "./HistoryView";

/**
 * Persistent history screen.
 *
 * @post History entries are grouped and selectable.
 */
export function HistoryScreen(): JSX.Element {
  const composition = useApplicationComposition();
  const { t } = useI18n();
  const history = useHistory();
  const [groups, setGroups] = useState<ReadonlyArray<HistoryGroup>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const historyController = useMemo(() => composition.createHistoryController(async character => {
    history.push(`/kanji/${encodeURIComponent(character)}`);
  }), [composition, history]);

  useEffect(() => {
    let isActive = true;

    async function loadHistory(): Promise<void> {
      try {
        const rawGroups = await historyController.getEntriesByCategory();
        const hydratedGroups = await Promise.all(rawGroups.map(async group => ({
          category: group.category,
          entries: await Promise.all(group.entries.map(entry => composition.kanjiRepository.hydrateHistoryEntry(entry)))
        })));

        if (isActive) {
          setGroups(hydratedGroups);
        }
      } catch {
        if (isActive) {
          setMessage(t("unexpectedError"));
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
    };
  }, [composition, historyController, t]);

  async function openEntry(character: string): Promise<void> {
    try {
      await historyController.openKanjiEntry(character);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  return (
    <IonContent data-testid="history-screen" className="screenContent">
      <div className="screenStack">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t("history")}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <HistoryView groups={groups} onEntrySelected={character => void openEntry(character)} />
            {groups.every(group => group.entries.length === 0) ? (
              <IonText data-testid="history-empty-state">{t("historyEmpty")}</IonText>
            ) : null}
          </IonCardContent>
        </IonCard>
        {message ? <IonText color="danger" data-testid="history-error">{message}</IonText> : null}
      </div>
    </IonContent>
  );
}
