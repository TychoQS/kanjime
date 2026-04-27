import { IonSearchbar, IonText } from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import type { CompositionRoot } from "../../CompositionRoot";
import type { SearchInterface } from "./Contracts/SearchInterface";
import { translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import { SearchResultView } from "./SearchResultView";

interface SearchScreenProps {
  readonly searchController: SearchInterface;
  readonly language: string;
}

const SEARCH_DELAY_MS = 100;

/**
 * Manual Kanji search by character, reading, or meaning.
 *
 * @pre The offline dictionary repository is initialized.
 * @post Effective non-empty terms update the visible result list.
 */
export function SearchScreen(props: SearchScreenProps): JSX.Element {
  const history = useHistory();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<ReadonlyArray<{ character: string, primaryReadings: ReadonlyArray<string>, levels: ReadonlyArray<string> }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const effectiveTerm = term.trim();

    if (effectiveTerm.length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = window.setTimeout(() => {
      void props.searchController.search(effectiveTerm).then(nextResults => {
        setResults(nextResults);
        setIsSearching(false);
      }).catch(() => {
        setResults([]);
        setIsSearching(false);
      });
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [props.searchController, term]);


  return (
    <MobilePage title={translate(props.language, "search")} testId="search-screen">
      <div className="screen-shell">
        <div className="screen-flow">
          <IonSearchbar
            data-testid="kanji-searchbar"
            debounce={0}
            inputmode="search"
            placeholder={translate(props.language, "searchPlaceholder")}
            value={term}
            onIonInput={event => setTerm(event.detail.value ?? "")}
            onIonClear={() => {
              setTerm("");
              setResults([]);
            }}
          />

          <section className="results-panel grow-panel" data-testid="search-results-panel">
            <div className="section-heading">
              <span>{translate(props.language, "results")}</span>
            </div>
            <div className="result-list scroll-list">
              {results.length === 0 ? (
                <IonText color="medium">
                  <p>{isSearching ? translate(props.language, "loadingApplication") : translate(props.language, "noResults")}</p>
                </IonText>
              ) : results.map(result => (
                <SearchResultView
                  key={result.character}
                  character={result.character}
                  mainReadings={result.primaryReadings}
                  levels={result.levels}
                  onSelected={character => {
                    void props.searchController.openKanjiEntry(character).then(() => {
                      history.push(`/kanji/${encodeURIComponent(character)}`);
                    });
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
