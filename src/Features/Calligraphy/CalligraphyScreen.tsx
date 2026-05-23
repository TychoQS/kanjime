import { IonAlert, IonButton, IonIcon, IonText } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { translate, type TranslationKey } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import { CalligraphyEvaluationView } from "./View/CalligraphyEvaluationView";
import { CalligraphyPracticeView } from "./View/CalligraphyPracticeView";
import { CalligraphyView } from "./View/CalligraphyView";

/**
 * Main screen for calligraphy category selection.
 */
export function CalligraphyScreen(): JSX.Element {
  const { calligraphy, preferences } = useAppViewModelContext();
  const language = preferences.preferences.language;

  return (
    <MobilePage title={translate(language, "calligraphy")} testId="calligraphy-screen">
      <div className="screen-shell">
        <div className="route-ready-sentinel" data-testid="classification-screen" aria-hidden="true" />
        <IonAlert
          isOpen={calligraphy.errorMessage !== null}
          message={calligraphy.errorMessage ? translate(language, calligraphy.errorMessage as TranslationKey) : ""}
          buttons={[{
            text: translate(language, "ok"),
            role: "cancel"
          }]}
          onDidDismiss={() => calligraphy.dismissError()}
        />

        <CalligraphyView
          activeGrouping={calligraphy.activeGrouping}
          categories={calligraphy.categories}
          onCategorySelected={categoryId => {
            void calligraphy.openCategory(categoryId);
          }}
          onGroupingSelected={calligraphy.selectGrouping}
        />
      </div>
    </MobilePage>
  );
}

/**
 * Screen showing kanji list for a specific calligraphy category.
 */
export function CalligraphyCategoryScreen(): JSX.Element {
  const { calligraphy, preferences } = useAppViewModelContext();
  const language = preferences.preferences.language;

  return (
    <MobilePage title={translate(language, "calligraphy")} testId="calligraphy-category-screen">
      <div className="calligraphy-category-screen" data-testid="calligraphy-category-view">
        <IonButton
          className="calligraphy-back-button"
          data-testid="calligraphy-category-back-button"
          fill="clear"
          onClick={() => {
            void calligraphy.returnHome();
          }}
          aria-label={translate(language, "back")}
        >
          <IonIcon icon={arrowBack} slot="icon-only" />
        </IonButton>
        <section className="results-panel grow-panel">
          <div className="section-heading">
            <span>{translate(language, "kanji")}</span>
          </div>
          <div className="result-list scroll-list">
            {calligraphy.categoryKanji.length === 0 ? (
              <IonText color="medium">
                <p className="empty-state-text">{translate(language, "emptyCategory")}</p>
              </IonText>
            ) : calligraphy.categoryKanji.map(entry => (
              <button
                className="result-row"
                data-testid={`calligraphy-kanji-${entry.character}`}
                key={entry.character}
                onClick={() => {
                  void calligraphy.startPractice(entry.character);
                }}
                type="button"
              >
                <span className="result-kanji">{entry.character}</span>
                <span className="result-meta">{translate(language, "strokeCount")}: {entry.strokeCount}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </MobilePage>
  );
}

/**
 * Screen for practicing kanji calligraphy.
 */
export function CalligraphyPracticeScreen(): JSX.Element {
  const { calligraphy, preferences } = useAppViewModelContext();
  const language = preferences.preferences.language;

  return (
    <MobilePage title={translate(language, "calligraphy")} testId="calligraphy-practice-screen">
      <div className="screen-shell">
        <div className="route-ready-sentinel" data-testid="classification-screen" aria-hidden="true" />
        <IonAlert
          isOpen={calligraphy.errorMessage !== null}
          message={calligraphy.errorMessage ? translate(language, calligraphy.errorMessage as TranslationKey) : ""}
          buttons={[{
            text: translate(language, "ok"),
            role: "cancel"
          }]}
          onDidDismiss={() => calligraphy.dismissError()}
        />
        {calligraphy.targetCharacter !== null ? (
          <div className="calligraphy-practice-shell">
            <CalligraphyPracticeView
              activeStroke={calligraphy.activeStroke}
              canReset={calligraphy.strokes.length > 0}
              canValidate={calligraphy.strokes.length > 0}
              onBackRequested={() => {
                void calligraphy.returnToCategory();
              }}
              onPointerCancel={() => calligraphy.cancelStroke()}
              onPointerDown={(event) => calligraphy.beginStroke(event, event.currentTarget)}
              onPointerMove={(event) => calligraphy.continueStroke(event, event.currentTarget)}
              onPointerUp={() => calligraphy.completeStroke()}
              onResetRequested={() => calligraphy.resetPractice()}
              onValidateRequested={() => {
                void calligraphy.validatePractice();
              }}
              strokes={calligraphy.strokes}
              targetCharacter={calligraphy.targetCharacter}
            />
            {calligraphy.feedback ? (
              <CalligraphyEvaluationView
                feedback={calligraphy.feedback}
                onDismissRequested={calligraphy.dismissFeedback}
              />
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </div>
    </MobilePage>
  );
}
