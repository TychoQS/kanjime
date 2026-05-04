import { IonSearchbar, IonText } from "@ionic/react";

import { translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { SearchResultView } from "./SearchResultView";

/**
 * Manual Kanji search by character, reading, or meaning.
 *
 * @pre The offline dictionary repository is initialized.
 * @post Effective non-empty terms update the visible result list.
 */
export function SearchScreen(): JSX.Element {
  const { preferences, search } = useAppViewModelContext();

  return (
    <MobilePage title={translate(preferences.preferences.language, "search")} testId="search-screen">
      <div className="screen-shell">
        <div className="screen-flow">
          <IonSearchbar
            data-testid="kanji-searchbar"
            debounce={0}
            inputmode="search"
            placeholder={translate(preferences.preferences.language, "searchPlaceholder")}
            value={search.term}
            onIonInput={event => search.setTerm(event.detail.value ?? "")}
            onIonClear={() => search.clear()}
          />

          <section className="results-panel grow-panel" data-testid="search-results-panel">
            <div className="section-heading">
              <span>{translate(preferences.preferences.language, "results")}</span>
            </div>
            <div className="result-list scroll-list">
              {search.results.length === 0 && search.isSearching ? (
                <IonText color="medium">
                  <p>{translate(preferences.preferences.language, "loadingApplication")}</p>
                </IonText>
              ) : search.results.map(result => (
                <SearchResultView
                  key={result.character}
                  character={result.character}
                  mainReadings={result.primaryReadings}
                  levels={result.levels}
                  onSelected={character => {
                    void search.openKanjiEntry(character);
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </MobilePage>
  );
}
