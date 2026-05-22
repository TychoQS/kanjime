import type {
  CalligraphyAttempt,
  CalligraphyEvaluationAspect,
  CalligraphyEvaluationMetrics,
  CalligraphyEvaluationResult,
  Stroke,
  StrokePoint
} from "../../../Shared/DomainTypes";
import { ApplicationError, StrokeError } from "../../../Shared/AppErrors";

interface ReferenceStroke {
  readonly points: ReadonlyArray<StrokePoint>;
}

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const KANJIVG_SIZE = 109;
const SAMPLE_POINTS_PER_STROKE = 12;

export interface CalligraphyEvaluationDataDependencies {
  readonly loadReferenceStrokeOrder: (character: string) => Promise<string>;
}

export async function evaluateCalligraphyAttempt(
  dependencies: CalligraphyEvaluationDataDependencies,
  attempt: CalligraphyAttempt
): Promise<CalligraphyEvaluationResult> {
  if (!attempt.isFinalized) {
    throw new StrokeError("Finish the practice before requesting evaluation.");
  }

  if (attempt.strokes.length === 0) {
    throw new StrokeError("Draw at least one stroke before evaluating the practice.");
  }

  const referenceSvg = await dependencies.loadReferenceStrokeOrder(attempt.targetCharacter);
  const referenceStrokes = parseReferenceStrokes(referenceSvg);

  if (referenceStrokes.length === 0) {
    throw new ApplicationError("The reference stroke order could not be loaded.");
  }

  const normalizedAttempt = normalizeAttemptStrokes(attempt.strokes);
  const normalizedReference = normalizeReferenceStrokes(referenceStrokes);
  const metrics = {
    strokeCount: calculateStrokeCountScore(normalizedAttempt.length, normalizedReference.length),
    strokeOrder: calculateStrokeOrderScore(normalizedAttempt, normalizedReference),
    approximateDirection: calculateDirectionScore(normalizedAttempt, normalizedReference),
    generalSimilarity: calculateSimilarityScore(normalizedAttempt, normalizedReference)
  };
  const score = calculateGlobalCalligraphyScore(metrics, normalizedAttempt);
  const aspects = createAspects(metrics);

  return {
    targetCharacter: attempt.targetCharacter,
    score,
    summary: chooseSummary(score),
    recommendation: chooseRecommendation(metrics),
    metrics,
    aspects
  };
}

export function calculateGlobalCalligraphyScore(
  metrics: CalligraphyEvaluationMetrics,
  attemptStrokes: ReadonlyArray<Stroke>
): number {
  const weightedScore = (
    metrics.strokeCount * 0.25 +
    metrics.strokeOrder * 0.2 +
    metrics.approximateDirection * 0.2 +
    metrics.generalSimilarity * 0.35
  );
  const totalPoints = attemptStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
  const hasVeryShortAttempt = attemptStrokes.length === 0 || totalPoints < Math.max(3, attemptStrokes.length * 2);
  const cap = hasVeryShortAttempt || metrics.strokeCount < 35 || metrics.generalSimilarity < 25 ? 60 : SCORE_MAX;

  return clampScore(Math.round(Math.min(weightedScore, cap)));
}

function parseReferenceStrokes(svg: string): ReadonlyArray<ReferenceStroke> {
  return [...svg.matchAll(/<path\b[^>]*\sd="([^"]+)"[^>]*>/g)]
    .map(match => ({ points: parsePathPoints(match[1]) }))
    .filter(stroke => stroke.points.length > 0);
}

function parsePathPoints(pathData: string): ReadonlyArray<StrokePoint> {
  const numbers = [...pathData.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number.parseFloat(match[0]));
  const points: StrokePoint[] = [];

  for (let index = 0; index + 1 < numbers.length; index += 2) {
    points.push({
      x: numbers[index],
      y: numbers[index + 1]
    });
  }

  return points;
}

function normalizeReferenceStrokes(strokes: ReadonlyArray<ReferenceStroke>): ReadonlyArray<Stroke> {
  return normalizeStrokeCollection(strokes.map((stroke, index) => ({
    points: stroke.points,
    startedAt: String(index),
    endedAt: String(index)
  })));
}

function normalizeAttemptStrokes(strokes: ReadonlyArray<Stroke>): ReadonlyArray<Stroke> {
  return normalizeStrokeCollection(strokes);
}

function normalizeStrokeCollection(strokes: ReadonlyArray<Stroke>): ReadonlyArray<Stroke> {
  const points = strokes.flatMap(stroke => stroke.points);
  const bounds = getBounds(points);
  const scale = Math.max(bounds.width, bounds.height, 1);

  return strokes.map(stroke => ({
    points: stroke.points.map(point => ({
      x: ((point.x - bounds.minX) / scale) * KANJIVG_SIZE,
      y: ((point.y - bounds.minY) / scale) * KANJIVG_SIZE
    })),
    startedAt: stroke.startedAt,
    endedAt: stroke.endedAt
  }));
}

function getBounds(points: ReadonlyArray<StrokePoint>): {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
} {
  if (points.length === 0) {
    return { minX: 0, minY: 0, width: 1, height: 1 };
  }

  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function calculateStrokeCountScore(attemptCount: number, referenceCount: number): number {
  if (referenceCount === 0) {
    return SCORE_MIN;
  }

  return clampScore(100 - Math.abs(attemptCount - referenceCount) * (100 / referenceCount));
}

function calculateStrokeOrderScore(
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>
): number {
  const comparedCount = Math.min(attemptStrokes.length, referenceStrokes.length);

  if (comparedCount === 0) {
    return SCORE_MIN;
  }

  const scores = Array.from({ length: comparedCount }, (_, index) => {
    return strokeDistanceScore(attemptStrokes[index], referenceStrokes[index]);
  });

  return average(scores);
}

function calculateDirectionScore(
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>
): number {
  const comparedCount = Math.min(attemptStrokes.length, referenceStrokes.length);

  if (comparedCount === 0) {
    return SCORE_MIN;
  }

  const scores = Array.from({ length: comparedCount }, (_, index) => {
    const attemptAngle = strokeAngle(attemptStrokes[index]);
    const referenceAngle = strokeAngle(referenceStrokes[index]);
    const difference = Math.abs(Math.atan2(Math.sin(attemptAngle - referenceAngle), Math.cos(attemptAngle - referenceAngle)));

    return clampScore(100 - (difference / Math.PI) * 100);
  });

  return average(scores);
}

function calculateSimilarityScore(
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>
): number {
  const attemptPoints = sampleCollection(attemptStrokes);
  const referencePoints = sampleCollection(referenceStrokes);

  if (attemptPoints.length === 0 || referencePoints.length === 0) {
    return SCORE_MIN;
  }

  const distances = attemptPoints.map(point => nearestDistance(point, referencePoints));
  const distanceScore = clampScore(100 - average(distances) * 1.8);
  const attemptLength = totalLength(attemptStrokes);
  const referenceLength = totalLength(referenceStrokes);
  const lengthRatio = referenceLength === 0 ? 0 : Math.min(attemptLength, referenceLength) / Math.max(attemptLength, referenceLength);

  return clampScore(distanceScore * 0.75 + lengthRatio * 25);
}

function strokeDistanceScore(attemptStroke: Stroke, referenceStroke: Stroke): number {
  const attemptPoints = sampleStroke(attemptStroke);
  const referencePoints = sampleStroke(referenceStroke);
  const count = Math.min(attemptPoints.length, referencePoints.length);

  if (count === 0) {
    return SCORE_MIN;
  }

  const distances = Array.from({ length: count }, (_, index) => {
    return distance(attemptPoints[index], referencePoints[index]);
  });

  return clampScore(100 - average(distances) * 1.8);
}

function sampleCollection(strokes: ReadonlyArray<Stroke>): ReadonlyArray<StrokePoint> {
  return strokes.flatMap(sampleStroke);
}

function sampleStroke(stroke: Stroke): ReadonlyArray<StrokePoint> {
  if (stroke.points.length <= SAMPLE_POINTS_PER_STROKE) {
    return stroke.points.map(point => ({ ...point }));
  }

  return Array.from({ length: SAMPLE_POINTS_PER_STROKE }, (_, index) => {
    const sourceIndex = Math.round((index / (SAMPLE_POINTS_PER_STROKE - 1)) * (stroke.points.length - 1));
    return { ...stroke.points[sourceIndex] };
  });
}

function strokeAngle(stroke: Stroke): number {
  if (stroke.points.length < 2) {
    return 0;
  }

  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];
  return Math.atan2(end.y - start.y, end.x - start.x);
}

function nearestDistance(point: StrokePoint, candidates: ReadonlyArray<StrokePoint>): number {
  return Math.min(...candidates.map(candidate => distance(point, candidate)));
}

function distance(left: StrokePoint, right: StrokePoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function totalLength(strokes: ReadonlyArray<Stroke>): number {
  return strokes.reduce((sum, stroke) => sum + strokeLength(stroke), 0);
}

function strokeLength(stroke: Stroke): number {
  return stroke.points.slice(1).reduce((sum, point, index) => sum + distance(stroke.points[index], point), 0);
}

function createAspects(metrics: CalligraphyEvaluationMetrics): ReadonlyArray<CalligraphyEvaluationAspect> {
  return [
    { id: "strokeCount", score: metrics.strokeCount, description: "strokeCountFeedback" },
    { id: "strokeOrder", score: metrics.strokeOrder, description: "strokeOrderFeedback" },
    { id: "approximateDirection", score: metrics.approximateDirection, description: "directionFeedback" },
    { id: "generalSimilarity", score: metrics.generalSimilarity, description: "similarityFeedback" }
  ];
}

function chooseSummary(score: number): string {
  if (score >= 80) {
    return "evaluationSummaryStrong";
  }

  if (score >= 55) {
    return "evaluationSummaryGood";
  }

  return "evaluationSummaryNeedsPractice";
}

function chooseRecommendation(metrics: CalligraphyEvaluationMetrics): string {
  const entries = [
    { key: "recommendStrokeCount", value: metrics.strokeCount },
    { key: "recommendStrokeOrder", value: metrics.strokeOrder },
    { key: "recommendDirection", value: metrics.approximateDirection },
    { key: "recommendSimilarity", value: metrics.generalSimilarity }
  ].sort((left, right) => left.value - right.value);

  return entries[0].key;
}

function average(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    return SCORE_MIN;
  }

  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, value));
}
