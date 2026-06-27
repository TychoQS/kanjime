import { IonButton } from "@ionic/react";

import { translate, type TranslationKey } from "../../../Shared/I18n";
import type { CalligraphyEvaluationProps } from "../Contracts/CalligraphyEvaluationProps";

const METRIC_LABELS = {
  strokeCount: "strokeCountMetric",
  strokeOrder: "strokeOrderMetric",
  approximateDirection: "approximateDirection",
  generalSimilarity: "generalSimilarity"
} as const;

const VISUAL_SIZE = 109;
const MATCH_GAP = 16;
const MATCH_ATTEMPT_OFFSET_X = VISUAL_SIZE + MATCH_GAP;
const MATCH_VIEWBOX_WIDTH = VISUAL_SIZE * 2 + MATCH_GAP;
const MIN_VISIBLE_MATCHES = 4;

/**
 * Calligraphy evaluation feedback overlay.
 */
export function CalligraphyEvaluationView(props: CalligraphyEvaluationProps): JSX.Element | null {
  const language = document.documentElement.lang || "en-US";
  const summary = translateOrRaw(language, props.feedback.summary);
  const comparison = props.comparison ?? props.feedback.visualComparison ?? null;
  const hasVisibleMatches = (comparison?.matchedKeypoints?.length ?? 0) >= MIN_VISIBLE_MATCHES;

  if (props.metrics !== undefined && comparison === null) {
    throw new Error("The visual comparison data is required before rendering evaluation feedback.");
  }

  return (
      <>
        <div data-testid="calligraphy-practice-screen" className="calligraphy-practice-screen-underlay" />
        <section
            className="calligraphy-evaluation-overlay"
            data-testid="calligraphy-evaluation-overlay"
            hidden={!props.feedback.isOverlayVisible}
        >
          <div className="calligraphy-evaluation-panel" data-testid="calligraphy-evaluation-panel">
            <h2>{translate(language, "evaluation")}</h2>

            <p className="calligraphy-score" data-testid="calligraphy-score">
              <span className="calligraphy-score-label">{translate(language, "score")}</span>
              <strong className="calligraphy-score-value" data-testid="calligraphy-score-value">
                {props.feedback.score}
              </strong>
            </p>

            <p data-testid="calligraphy-evaluation-summary">{summary}</p>

            {comparison ? (
                <section
                    className={
                      hasVisibleMatches
                          ? "calligraphy-visual-comparison calligraphy-visual-comparison--matching"
                          : "calligraphy-visual-comparison calligraphy-visual-comparison--separate"
                    }
                    data-testid="calligraphy-visual-comparison"
                >
                  {hasVisibleMatches ? (
                      <figure className="calligraphy-visual-frame" style={{ margin: 0 }}>
                        <figcaption>{translate(language, "generalSimilarity")}</figcaption>

                        <svg
                            aria-label={translate(language, "generalSimilarity")}
                            data-testid="calligraphy-matching-visual"
                            role="img"
                            viewBox={`0 0 ${MATCH_VIEWBOX_WIDTH} ${VISUAL_SIZE}`}
                            style={{
                              display: "block",
                              width: "100%",
                              maxWidth: "100%",
                              background: "var(--app-surface)",
                              borderRadius: "4px",
                            }}
                        >
                          <rect
                              x={0}
                              y={0}
                              width={MATCH_VIEWBOX_WIDTH}
                              height={VISUAL_SIZE}
                              fill="var(--app-surface)"
                          />

                          <image
                              href={comparison.referenceImageUri}
                              x={0}
                              y={0}
                              width={VISUAL_SIZE}
                              height={VISUAL_SIZE}
                              preserveAspectRatio="none"
                          />

                          <image
                              href={comparison.attemptImageUri}
                              x={MATCH_ATTEMPT_OFFSET_X}
                              y={0}
                              width={VISUAL_SIZE}
                              height={VISUAL_SIZE}
                              preserveAspectRatio="none"
                          />

                          {comparison.matchedKeypoints?.map(([referencePoint, attemptPoint], index) => (
                              <g key={`match-${index}`}>
                                <line
                                    x1={referencePoint.x}
                                    y1={referencePoint.y}
                                    x2={MATCH_ATTEMPT_OFFSET_X + attemptPoint.x}
                                    y2={attemptPoint.y}
                                    stroke="#22c55e"
                                    strokeWidth={1.2}
                                    opacity={0.85}
                                />

                                <circle
                                    cx={referencePoint.x}
                                    cy={referencePoint.y}
                                    r={2.2}
                                    fill="#a7f3d0"
                                    stroke="#064e3b"
                                    strokeWidth={0.5}
                                    data-testid="calligraphy-keypoint"
                                />

                                <circle
                                    cx={MATCH_ATTEMPT_OFFSET_X + attemptPoint.x}
                                    cy={attemptPoint.y}
                                    r={2.2}
                                    fill="#a7f3d0"
                                    stroke="#064e3b"
                                    strokeWidth={0.5}
                                />
                              </g>
                          ))}
                        </svg>
                      </figure>
                  ) : (
                      <>
                        <figure className="calligraphy-visual-frame">
                          <figcaption>{translate(language, "calligraphyReference")}</figcaption>
                          <img
                              alt={translate(language, "calligraphyReference")}
                              className="calligraphy-comparison-image"
                              data-testid="calligraphy-reference-visual"
                              src={comparison.referenceImageUri}
                          />
                        </figure>

                        <figure className="calligraphy-visual-frame">
                          <figcaption>{translate(language, "calligraphyAttempt")}</figcaption>
                          <img
                              alt={translate(language, "calligraphyAttempt")}
                              className="calligraphy-comparison-image"
                              data-testid="calligraphy-attempt-visual"
                              src={comparison.attemptImageUri}
                          />
                        </figure>

                        {comparison.alignedAttemptImageUri ? (
                            <figure className="calligraphy-visual-frame">
                              <figcaption>{translate(language, "alignedAttempt")}</figcaption>
                              <img
                                  alt={translate(language, "alignedAttempt")}
                                  className="calligraphy-comparison-image"
                                  data-testid="calligraphy-aligned-attempt-visual"
                                  src={comparison.alignedAttemptImageUri}
                              />
                            </figure>
                        ) : null}
                      </>
                  )}
                </section>
            ) : null}

            <ul className="calligraphy-metric-list" data-testid="calligraphy-metric-list">
              {(props.feedback.aspects ?? []).map(aspect => (
                  <li data-testid={`calligraphy-metric-${aspect.id}`} key={aspect.id}>
                    <span>{translate(language, METRIC_LABELS[aspect.id])}</span>
                    <strong>{Math.round(aspect.score)}</strong>
                    <small>{translate(language, aspect.description as TranslationKey)}</small>
                  </li>
              ))}
            </ul>

            <p data-testid="calligraphy-recommendation">
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