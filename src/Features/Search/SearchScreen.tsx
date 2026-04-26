import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonText
} from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import { useApplicationComposition } from "../../ApplicationContext";
import type { CharacterSummary } from "../../Shared/DomainTypes";
import { useI18n } from "../../Shared/I18n/I18nContext";
import { SearchResultView } from "./SearchResultView";

/**
 * Manual kanji search screen.
 *
 * @post Users can search the packaged dictionary and open details.
 */
export function SearchScreen(): JSX.Element {
  const composition = useApplicationComposition();
  const { t } = useI18n();
  const history = useHistory();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<ReadonlyArray<CharacterSummary>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const searchController = useMemo(() => composition.createSearchController(async character => {
    history.push(`/kanji/${encodeURIComponent(character)}`);
  }), [composition, history]);

  async function updateSearch(nextTerm: string): Promise<void> {
    setTerm(nextTerm);
    setMessage(null);

    try {
      const nextResults = await searchController.search(nextTerm);
      setResults(nextResults);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  async function openResult(character: string): Promise<void> {
    try {
      await composition.saveHistoryEntry(character, "search");
      await searchController.openKanjiEntry(character);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  function clearSearch(): void {
    searchController.clearSearch();
    setTerm("");
    setResults([]);
  }

  return (
    <IonContent data-testid="search-screen" className="screenContent">
      <div className="screenStack">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t("search")}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="stack">
            <IonInput
              data-testid="search-input"
              value={term}
              label={t("search")}
              labelPlacement="stacked"
              placeholder={t("searchPlaceholder")}
              onIonInput={event => void updateSearch(String(event.detail.value ?? ""))}
            />
            <IonButton data-testid="clear-search-button" disabled={term.length === 0 && results.length === 0} onClick={clearSearch}>
              {t("clear")}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t("results")}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {results.length > 0 ? (
              <section data-testid="search-results-list" className="resultList">
                {results.map(result => (
                  <SearchResultView
                    key={result.character}
                    character={result.character}
                    mainReadings={result.primaryReadings}
                    levels={result.levels}
                    onSelected={character => void openResult(character)}
                  />
                ))}
              </section>
            ) : (
              <IonText data-testid="search-empty-state">
                {term.trim().length > 0 ? t("noResults") : t("searchEmpty")}
              </IonText>
            )}
          </IonCardContent>
        </IonCard>

        {message ? <IonText color="danger" data-testid="search-error">{message}</IonText> : null}
      </div>
    </IonContent>
  );
}
