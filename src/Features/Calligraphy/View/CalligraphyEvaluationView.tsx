import { IonButton } from "@ionic/react";

import { translate, type TranslationKey } from "../../../Shared/I18n";
import type { CalligraphyEvaluationProps } from "../Contracts/CalligraphyEvaluationProps";

const METRIC_LABELS = {
  strokeCount: "strokeCountMetric",
  strokeOrder: "strokeOrderMetric",
  approximateDirection: "approximateDirection",
  generalSimilarity: "generalSimilarity"
} as const;

/**
 * Calligraphy evaluation feedback overlay.
 */
export function CalligraphyEvaluationView(props: CalligraphyEvaluationProps): JSX.Element | null {
  const language = document.documentElement.lang || "en-US";
  const summary = translateOrRaw(language, props.feedback.summary);

  return (
    <>
      <div data-testid="calligraphy-practice-screen" className="calligraphy-practice-screen-underlay" />
      <section
        className="calligraphy-evaluation-overlay"
        data-testid="calligraphy-evaluation-overlay"
        hidden={!props.feedback.isOverlayVisible}
      >
      <div className="calligraphy-evaluation-panel">
        <h2>{translate(language, "evaluation")}</h2>
        <p className="calligraphy-score" data-testid="calligraphy-score">
          <span className="calligraphy-score-label">{translate(language, "score")}</span>
          <strong className="calligraphy-score-value">{props.feedback.score}</strong>
        </p>
        <p>{summary}</p>
        <ul className="calligraphy-metric-list">
          {(props.feedback.aspects ?? []).map(aspect => (
            <li key={aspect.id}>
              <span>{translate(language, METRIC_LABELS[aspect.id])}</span>
              <strong>{Math.round(aspect.score)}</strong>
              <small>{translate(language, aspect.description as TranslationKey)}</small>
            </li>
          ))}
        </ul>
        <p>
          <strong>{translate(language, "recommendation")}: </strong>
          {translate(language, (props.feedback.recommendation ?? "recommendSimilarity") as TranslationKey)}
        </p>
        <IonButton data-testid="dismiss-evaluation-button" onClick={props.onDismissRequested}>
          {translate(language, "practiceAgain")}
        </IonButton>
      </div>
      </section>
    </>
  );
}

function translateOrRaw(language: string, value: string): string {
  return value in translateKeySet ? translate(language, value as TranslationKey) : value;
}

const translateKeySet = Object.fromEntries([
  "evaluationSummaryStrong",
  "evaluationSummaryGood",
  "evaluationSummaryNeedsPractice"
].map(key => [key, true])) as Record<string, boolean>;
