import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { translate, type TranslationKey } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import { ErrorView } from "../Error/View/ErrorView";
import { CalligraphyEvaluationView } from "./View/CalligraphyEvaluationView";
import { CalligraphyPracticeView } from "./View/CalligraphyPracticeView";
import { CategoryView } from "./View/CategoryView";
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
        <ErrorView
          isVisible={calligraphy.errorMessage !== null}
          message={calligraphy.errorMessage ? translate(language, calligraphy.errorMessage as TranslationKey) : ""}
          canContinue={true}
          onDismissRequested={() => calligraphy.dismissError()}
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

  return (
    <MobilePage title={translate(preferences.preferences.language, "calligraphy")} testId="calligraphy-category-screen">
      <CategoryView
        categoryId={calligraphy.selectedCategoryId ?? ""}
        searchTerm={calligraphy.categorySearchTerm}
        visibleKanji={calligraphy.categoryKanji}
        onBackRequested={() => {
          void calligraphy.returnHome();
        }}
        onKanjiSelected={character => {
          void calligraphy.startPractice(character);
        }}
        onSearchTermChanged={calligraphy.updateCategorySearchTerm}
      />
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
        <ErrorView
          isVisible={calligraphy.errorMessage !== null}
          message={calligraphy.errorMessage ? translate(language, calligraphy.errorMessage as TranslationKey) : ""}
          canContinue={true}
          onDismissRequested={() => calligraphy.dismissError()}
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
                comparison={calligraphy.feedback.visualComparison ?? null}
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
