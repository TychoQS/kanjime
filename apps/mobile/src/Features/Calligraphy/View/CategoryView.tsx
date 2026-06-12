import { IonButton, IonIcon, IonText } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

import { translate } from "../../../Shared/I18n";
import type { CategoryProps } from "../Contracts/CategoryProps";

/**
 * Calligraphy category kanji list view.
 */
export function CategoryView(props: CategoryProps): JSX.Element {
  const language = document.documentElement.lang || "en-US";

  return (
    <div className="calligraphy-category-screen" data-testid="calligraphy-category-view">
      <IonButton
        className="calligraphy-back-button"
        data-testid="calligraphy-category-back-button"
        fill="clear"
        onClick={props.onBackRequested}
        aria-label={translate(language, "back")}
      >
        <IonIcon icon={arrowBack} slot="icon-only" />
      </IonButton>
      <section className="results-panel grow-panel">
        <div className="section-heading">
          <span>{translate(language, "kanji")}</span>
        </div>
        <div className="result-list scroll-list">
          {props.visibleKanji.length === 0 ? (
            <IonText color="medium">
              <p className="empty-state-text">{translate(language, "emptyCategory")}</p>
            </IonText>
          ) : props.visibleKanji.map(entry => (
            <button
              className="result-row"
              data-testid={`calligraphy-kanji-${entry.character}`}
              key={entry.character}
              onClick={() => props.onKanjiSelected(entry.character)}
              type="button"
            >
              <span className="result-kanji">{entry.character}</span>
              <span className="result-meta">{translate(language, "strokeCount")}: {entry.strokeCount}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
