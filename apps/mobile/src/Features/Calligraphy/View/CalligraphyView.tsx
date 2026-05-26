import { IonText } from "@ionic/react";

import { translate } from "../../../Shared/I18n";
import type { CalligraphyProps } from "../Contracts/CalligraphyProps";

/**
 * Main calligraphy category selection view.
 */
export function CalligraphyView(props: CalligraphyProps): JSX.Element {
  const language = document.documentElement.lang || "en-US";

  return (
    <div className="calligraphy-home" data-testid="calligraphy-view">
      <div
        className="mode-segment"
        data-testid="calligraphy-grouping-segment"
      >
        <button
          aria-current={props.activeGrouping === "jlpt" ? "page" : undefined}
          aria-pressed={props.activeGrouping === "jlpt"}
          className="calligraphy-grouping-button"
          data-testid="calligraphy-grouping-jlpt"
          onClick={() => selectGrouping(props.onGroupingSelected, "jlpt")}
          type="button"
        >
          {translate(language, "jlpt")}
        </button>
        <button
          aria-current={props.activeGrouping === "joyo" ? "page" : undefined}
          aria-pressed={props.activeGrouping === "joyo"}
          className="calligraphy-grouping-button"
          data-testid="calligraphy-grouping-joyo"
          onClick={() => selectGrouping(props.onGroupingSelected, "joyo")}
          type="button"
        >
          {translate(language, "joyo")}
        </button>
      </div>

      <section className="results-panel grow-panel" data-testid="calligraphy-categories-panel">
        <div className="section-heading">
          <span>{props.activeGrouping === "jlpt" ? translate(language, "jlpt") : translate(language, "joyo")}</span>
        </div>
        <div className="result-list scroll-list">
          {props.categories.length === 0 ? (
            <IonText color="medium">
              <p className="empty-state-text">{translate(language, "emptyCategories")}</p>
            </IonText>
          ) : props.categories.map(category => (
            <button
              aria-label={category.isResidual ? translate(language, "unclassified") : category.label}
              className="calligraphy-category-button"
              data-testid={`calligraphy-category-${category.id}`}
              key={category.id}
              onClick={() => props.onCategorySelected(category.id)}
              type="button"
            >
              <span className="calligraphy-category-label">
                {category.isResidual ? translate(language, "unclassified") : category.label}
              </span>
              <span className="calligraphy-category-count">
                {category.kanjiCount} {translate(language, "kanji")}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function selectGrouping(
  onGroupingSelected: CalligraphyProps["onGroupingSelected"],
  grouping: "jlpt" | "joyo"
): void {
  (onGroupingSelected as (nextGrouping: "jlpt" | "joyo", reason: string) => void)(
    grouping,
    "CalligraphyProps didn't trigger grouping selection with the correct grouping."
  );
}
