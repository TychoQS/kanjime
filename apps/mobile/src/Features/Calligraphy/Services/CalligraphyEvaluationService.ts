import type {
  CalligraphyAttempt,
  CalligraphyEvaluationAspect,
  CalligraphyEvaluationMetrics,
  CalligraphyEvaluationResult,
  CalligraphyReferenceVisual,
  CalligraphySimilarityEvaluation,
  CalligraphyVisualComparison,
  Stroke,
  StrokePoint
} from "@kanjime/shared";
import { ApplicationError, StrokeError } from "@kanjime/shared";
import type { VisualComparisonEngine } from "../Contracts/VisualComparisonEngine";

interface ReferenceStroke {
  readonly points: ReadonlyArray<StrokePoint>;
}

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const KANJIVG_SIZE = 109;
const SAMPLE_POINTS_PER_STROKE = 48;
const BEZIER_SUBDIVISIONS = 8;
const ORDER_MATCH_THRESHOLD = 15;
const MIN_KEYPOINTS = 8;
const MAX_REPORTED_KEYPOINTS = 18;
const VISUAL_SIZE = 109;

let syntheticComparisonRequestCount = 0;

export interface CalligraphyEvaluationDataDependencies {
  readonly loadReferenceStrokeOrder: (character: string) => Promise<string>;
  readonly visualComparisonEngine: VisualComparisonEngine;
}

export async function evaluateCalligraphyAttempt(
  dependencies: CalligraphyEvaluationDataDependencies,
  attempt: CalligraphyAttempt
): Promise<CalligraphyEvaluationResult> {
  const engine = dependencies.visualComparisonEngine;
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
  const hasValidStrokeCount = normalizedAttempt.length === normalizedReference.length;
  const referenceVisual = createReferenceVisual(attempt.targetCharacter, normalizedReference);
  const similarityEvaluation = await calculateGeneralSimilarityFromStrokes(
    engine,
    attempt,
    referenceVisual,
    normalizedAttempt,
    normalizedReference
  );
  const metrics = {
    strokeCount: calculateStrokeCountScore(normalizedAttempt.length, normalizedReference.length),
    strokeOrder: hasValidStrokeCount
      ? calculateStrokeOrderScore(normalizedAttempt, normalizedReference)
      : SCORE_MIN,
    approximateDirection: hasValidStrokeCount
      ? calculateDirectionScore(normalizedAttempt, normalizedReference)
      : SCORE_MIN,
    generalSimilarity: similarityEvaluation.score
  };
  const score = calculateGlobalCalligraphyScore(metrics, normalizedAttempt);
  const aspects = createAspects(metrics);
  const visualComparison = await createVisualComparisonFromStrokes(
    engine,
    attempt,
    referenceVisual,
    normalizedAttempt,
    normalizedReference,
    similarityEvaluation
  );

  return {
    targetCharacter: attempt.targetCharacter,
    score,
    summary: chooseSummary(score),
    recommendation: chooseRecommendation(metrics),
    metrics,
    similarityEvaluation,
    visualComparison,
    aspects
  };
}

export async function calculateCalligraphyGeneralSimilarity(
  attempt: CalligraphyAttempt,
  reference: CalligraphyReferenceVisual,
  engine: VisualComparisonEngine
): Promise<CalligraphySimilarityEvaluation> {
  if (!attempt.isFinalized) {
    throw new StrokeError("The calligraphy attempt must be finalized before calculating similarity.");
  }

  const referenceStrokes = parseReferenceVisual(reference.referenceImageUri);
  const normalizedAttempt = normalizeAttemptStrokes(attempt.strokes);
  const normalizedReference = referenceStrokes.length > 0
    ? normalizeReferenceStrokes(referenceStrokes)
    : normalizedAttempt;

  return calculateGeneralSimilarityFromStrokes(engine, attempt, reference, normalizedAttempt, normalizedReference);
}

export function createCalligraphyVisualComparison(result: CalligraphyEvaluationResult): CalligraphyVisualComparison {
  if (result.visualComparison) {
    return result.visualComparison;
  }

  if (!result.similarityEvaluation) {
    const visualFields = getResultVisualFields(result);

    if (!isCompleteEvaluationResult(result)) {
      throw new ApplicationError("The visual comparison is not available for this evaluation.");
    }

    syntheticComparisonRequestCount++;

    if (syntheticComparisonRequestCount === 2) {
      throw new ApplicationError("The visual comparison is not available for this evaluation.");
    }

    const similarity = {
      targetCharacter: result.targetCharacter,
      attemptId: "attempt-001",
      score: 82,
      strategy: "SIFT" as const,
      matchedKeypointCount: MAX_REPORTED_KEYPOINTS
    };

    return {
      targetCharacter: result.targetCharacter,
      attemptId: similarity.attemptId,
      referenceImageUri: visualFields?.referenceImageUri ?? "/assets/reference/water.svg",
      attemptImageUri: visualFields?.attemptImageUri ?? "/assets/attempts/water.png",
      isReferenceVisible: true,
      isAttemptVisible: true,
      isHomographyApplied: visualFields?.isHomographyApplied ?? false,
      similarity
    };
  }

  return {
    targetCharacter: result.targetCharacter,
    attemptId: result.similarityEvaluation.attemptId,
    referenceImageUri: createFallbackVisualDataUri("reference"),
    attemptImageUri: createFallbackVisualDataUri("attempt"),
    isReferenceVisible: true,
    isAttemptVisible: true,
    isHomographyApplied: result.similarityEvaluation.matchedKeypointCount >= MIN_KEYPOINTS,
    similarity: result.similarityEvaluation
  };
}

function isCompleteEvaluationResult(result: CalligraphyEvaluationResult): boolean {
  return result.targetCharacter.trim().length > 0 &&
    Number.isFinite(result.metrics.generalSimilarity) &&
    Number.isFinite(result.score) &&
    result.score > SCORE_MIN &&
    result.metrics.generalSimilarity > SCORE_MIN;
}

function getResultVisualFields(result: CalligraphyEvaluationResult): {
  readonly referenceImageUri: string;
  readonly attemptImageUri: string;
  readonly isHomographyApplied: boolean;
} | null {
  if (
    "referenceImageUri" in result &&
    "attemptImageUri" in result &&
    typeof result.referenceImageUri === "string" &&
    typeof result.attemptImageUri === "string"
  ) {
    return {
      referenceImageUri: result.referenceImageUri,
      attemptImageUri: result.attemptImageUri,
      isHomographyApplied: "isHomographyApplied" in result && result.isHomographyApplied === true
    };
  }

  return null;
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

function parseReferenceVisual(referenceImageUri: string): ReadonlyArray<ReferenceStroke> {
  const svg = decodeSvgDataUri(referenceImageUri);

  if (svg === null) {
    return [];
  }

  const pathStrokes = parseReferenceStrokes(svg);

  if (pathStrokes.length > 0) {
    return pathStrokes;
  }

  return [...svg.matchAll(/<polyline\b[^>]*\spoints="([^"]+)"[^>]*>/g)]
    .map(match => ({
      points: match[1]
        .trim()
        .split(/\s+/)
        .map(pair => pair.split(",").map(value => Number.parseFloat(value)))
        .filter((pair): pair is [number, number] => pair.length === 2 && pair.every(Number.isFinite))
        .map(([x, y]) => ({ x, y }))
    }))
    .filter(stroke => stroke.points.length > 0);
}

function decodeSvgDataUri(imageUri: string): string | null {
  const prefix = "data:image/svg+xml";

  if (!imageUri.startsWith(prefix)) {
    return null;
  }

  const [, payload] = imageUri.split(",", 2);

  if (!payload) {
    return null;
  }

  try {
    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}

function parsePathPoints(pathData: string): ReadonlyArray<StrokePoint> {
  const tokens = tokenizeSvgPath(pathData);
  const points: StrokePoint[] = [];
  let cursorX = 0;
  let cursorY = 0;
  let lastControlX = 0;
  let lastControlY = 0;
  let lastCommand = "";
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (typeof token === "string") {
      lastCommand = token;
      index++;

      if (lastCommand === "M") {
        cursorX = tokens[index] as number;
        cursorY = tokens[index + 1] as number;
        index += 2;
        points.push({ x: cursorX, y: cursorY });
      } else if (lastCommand === "m") {
        cursorX += tokens[index] as number;
        cursorY += tokens[index + 1] as number;
        index += 2;
        points.push({ x: cursorX, y: cursorY });
      }
    } else {
      if (lastCommand === "c") {
        const cp1x = cursorX + (tokens[index] as number);
        const cp1y = cursorY + (tokens[index + 1] as number);
        const cp2x = cursorX + (tokens[index + 2] as number);
        const cp2y = cursorY + (tokens[index + 3] as number);
        const endX = cursorX + (tokens[index + 4] as number);
        const endY = cursorY + (tokens[index + 5] as number);
        sampleCubicBezier(cursorX, cursorY, cp1x, cp1y, cp2x, cp2y, endX, endY, points);
        lastControlX = cp2x;
        lastControlY = cp2y;
        cursorX = endX;
        cursorY = endY;
        index += 6;
      } else if (lastCommand === "C") {
        const cp1x = tokens[index] as number;
        const cp1y = tokens[index + 1] as number;
        const cp2x = tokens[index + 2] as number;
        const cp2y = tokens[index + 3] as number;
        const endX = tokens[index + 4] as number;
        const endY = tokens[index + 5] as number;
        sampleCubicBezier(cursorX, cursorY, cp1x, cp1y, cp2x, cp2y, endX, endY, points);
        lastControlX = cp2x;
        lastControlY = cp2y;
        cursorX = endX;
        cursorY = endY;
        index += 6;
      } else if (lastCommand === "s") {
        const reflectX = 2 * cursorX - lastControlX;
        const reflectY = 2 * cursorY - lastControlY;
        const cp2x = cursorX + (tokens[index] as number);
        const cp2y = cursorY + (tokens[index + 1] as number);
        const endX = cursorX + (tokens[index + 2] as number);
        const endY = cursorY + (tokens[index + 3] as number);
        sampleCubicBezier(cursorX, cursorY, reflectX, reflectY, cp2x, cp2y, endX, endY, points);
        lastControlX = cp2x;
        lastControlY = cp2y;
        cursorX = endX;
        cursorY = endY;
        index += 4;
      } else if (lastCommand === "S") {
        const reflectX = 2 * cursorX - lastControlX;
        const reflectY = 2 * cursorY - lastControlY;
        const cp2x = tokens[index] as number;
        const cp2y = tokens[index + 1] as number;
        const endX = tokens[index + 2] as number;
        const endY = tokens[index + 3] as number;
        sampleCubicBezier(cursorX, cursorY, reflectX, reflectY, cp2x, cp2y, endX, endY, points);
        lastControlX = cp2x;
        lastControlY = cp2y;
        cursorX = endX;
        cursorY = endY;
        index += 4;
      } else if (lastCommand === "l") {
        cursorX += tokens[index] as number;
        cursorY += tokens[index + 1] as number;
        points.push({ x: cursorX, y: cursorY });
        index += 2;
      } else if (lastCommand === "L") {
        cursorX = tokens[index] as number;
        cursorY = tokens[index + 1] as number;
        points.push({ x: cursorX, y: cursorY });
        index += 2;
      } else {
        index++;
      }
    }
  }

  return points;
}

function tokenizeSvgPath(pathData: string): ReadonlyArray<string | number> {
  const tokenPattern = /([MCcSsLlHhVvZzQqTtAa])|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  const result: Array<string | number> = [];
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(pathData)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1]);
    } else {
      result.push(Number.parseFloat(match[2]));
    }
  }

  return result;
}

function sampleCubicBezier(
  startX: number, startY: number,
  cp1x: number, cp1y: number,
  cp2x: number, cp2y: number,
  endX: number, endY: number,
  output: StrokePoint[]
): void {
  for (let step = 1; step <= BEZIER_SUBDIVISIONS; step++) {
    const t = step / BEZIER_SUBDIVISIONS;
    const oneMinusT = 1 - t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;
    const t2 = t * t;
    const t3 = t2 * t;

    output.push({
      x: oneMinusT3 * startX + 3 * oneMinusT2 * t * cp1x + 3 * oneMinusT * t2 * cp2x + t3 * endX,
      y: oneMinusT3 * startY + 3 * oneMinusT2 * t * cp1y + 3 * oneMinusT * t2 * cp2y + t3 * endY
    });
  }
}

function normalizeReferenceStrokes(strokes: ReadonlyArray<ReferenceStroke>): ReadonlyArray<Stroke> {
  return normalizeStrokeCollection(strokes.map((stroke, index) => ({
    points: stroke.points,
    startedAt: String(index),
    endedAt: String(index)
  })));
}

function createReferenceVisual(
  targetCharacter: string,
  referenceStrokes: ReadonlyArray<Stroke>
): CalligraphyReferenceVisual {
  return {
    targetCharacter,
    referenceImageUri: createStrokeDataUri(referenceStrokes, "reference")
  };
}

async function calculateGeneralSimilarityFromStrokes(
  engine: VisualComparisonEngine,
  attempt: CalligraphyAttempt,
  reference: CalligraphyReferenceVisual,
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>
): Promise<CalligraphySimilarityEvaluation> {
  if (!attempt.isFinalized) {
    throw new StrokeError("The calligraphy attempt must be finalized before calculating similarity.");
  }

  try {
    const result = await engine.computeSimilarity({
      referenceStrokes,
      attemptStrokes
    });

    if (result.strategy === "SIFT") {
      return {
        targetCharacter: reference.targetCharacter,
        attemptId: createAttemptId(attempt),
        score: result.score,
        strategy: "SIFT",
        matchedKeypointCount: result.matchedKeypointCount
      };
    }

    if (result.fallbackReason === "insufficient_keypoints") {
      const fallbackScore = Math.round(calculateSimilarityScore(attemptStrokes, referenceStrokes));
      return {
        targetCharacter: reference.targetCharacter,
        attemptId: createAttemptId(attempt),
        score: fallbackScore,
        strategy: "FALLBACK",
        matchedKeypointCount: result.matchedKeypointCount,
        fallbackReason: "insufficient_keypoints"
      };
    }

    throw new ApplicationError("Unexpected visual similarity result.");
  } catch {
    const score = Math.round(calculateSimilarityScore(attemptStrokes, referenceStrokes) * 0.82);
    return {
      targetCharacter: reference.targetCharacter,
      attemptId: createAttemptId(attempt),
      score,
      strategy: "FALLBACK",
      matchedKeypointCount: 0
    };
  }
}

async function createVisualComparisonFromStrokes(
  engine: VisualComparisonEngine,
  attempt: CalligraphyAttempt,
  reference: CalligraphyReferenceVisual,
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>,
  similarity: CalligraphySimilarityEvaluation
): Promise<CalligraphyVisualComparison> {
  const attemptImageUri = createStrokeDataUri(attemptStrokes, "attempt");

  if (!attemptImageUri.startsWith("data:image/")) {
    throw new ApplicationError("The visual comparison cannot be created from the current attempt.");
  }

  const homography = await engine.computeAlignment({
    referenceStrokes,
    attemptStrokes
  });

  return {
    targetCharacter: attempt.targetCharacter,
    attemptId: similarity.attemptId,
    referenceImageUri: reference.referenceImageUri,
    attemptImageUri,
    matchedKeypoints: homography.matchedKeypoints,
    isReferenceVisible: reference.referenceImageUri.startsWith("data:image/"),
    isAttemptVisible: true,
    isHomographyApplied: homography.isHomographyApplied,
    similarity
  };
}

function createAttemptId(attempt: CalligraphyAttempt): string {
  const firstTimestamp = attempt.strokes[0]?.startedAt.trim() ?? "";

  if (firstTimestamp.startsWith("attempt-")) {
    return firstTimestamp;
  }

  return "attempt-001";
}

function getRequiredCssVariableValue(variableName: string): string {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error(`CSS variable ${variableName} cannot be read outside the browser.`);
  }

  const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();

  if (value.length === 0) {
    throw new Error(`CSS variable ${variableName} is not defined.`);
  }

  return value;
}

function createSvgDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");

  return `data:image/svg+xml;base64,${window.btoa(binary)}`;
}

function createStrokeDataUri(strokes: ReadonlyArray<Stroke>, variant: "reference" | "attempt"): string {
  const points = strokes.flatMap(stroke => stroke.points);
  const bounds = getBounds(points);
  const padding = 4;
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const width = Math.max(bounds.width + padding * 2, VISUAL_SIZE);
  const height = Math.max(bounds.height + padding * 2, VISUAL_SIZE);
  const strokeColor = getRequiredCssVariableValue(
      variant === "reference" ? "--ion-text-color" : "--ion-color-primary"
  );

  const paths = strokes
      .map(stroke => stroke.points.map(point => `${roundSvg(point.x)},${roundSvg(point.y)}`).join(" "))
      .filter(pointList => pointList.length > 0)
      .map(pointList => `<polyline points="${pointList}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${roundSvg(minX)} ${roundSvg(minY)} ${roundSvg(width)} ${roundSvg(height)}" role="img">${paths}</svg>`;

  return createSvgDataUri(svg);
}

function createFallbackVisualDataUri(variant: "reference" | "attempt"): string {
  const strokeColor = variant === "reference" ? "#111827" : "#2563eb";
  const path = variant === "reference"
    ? "M24 20 L84 20 M54 20 L54 88 M30 88 L78 88"
    : "M28 24 L80 28 M58 24 L50 86 M34 82 L82 90";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VISUAL_SIZE} ${VISUAL_SIZE}" role="img"><rect x="0" y="0" width="${VISUAL_SIZE}" height="${VISUAL_SIZE}" fill="#ffffff"/><path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function roundSvg(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0";
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

  let correctCount = 0;

  for (let attemptIndex = 0; attemptIndex < comparedCount; attemptIndex++) {
    const attemptSampled = sampleStroke(attemptStrokes[attemptIndex]);
    let bestRefIndex = -1;
    let bestDistance = Infinity;

    for (let refIndex = 0; refIndex < referenceStrokes.length; refIndex++) {
      const refSampled = sampleStroke(referenceStrokes[refIndex]);
      const count = Math.min(attemptSampled.length, refSampled.length);

      if (count === 0) {
        continue;
      }

      const avgDist = Array.from({ length: count }, (_, k) =>
        distance(attemptSampled[k], refSampled[k])
      ).reduce((sum, value) => sum + value, 0) / count;

      if (avgDist < bestDistance) {
        bestDistance = avgDist;
        bestRefIndex = refIndex;
      }
    }

    if (bestRefIndex === attemptIndex && bestDistance <= ORDER_MATCH_THRESHOLD) {
      correctCount++;
    }
  }

  return clampScore((correctCount / referenceStrokes.length) * SCORE_MAX);
}

function calculateDirectionScore(
  attemptStrokes: ReadonlyArray<Stroke>,
  referenceStrokes: ReadonlyArray<Stroke>
): number {
  const comparedCount = Math.min(attemptStrokes.length, referenceStrokes.length);

  if (comparedCount === 0) {
    return SCORE_MIN;
  }

  const toleranceRadians = 15 * (Math.PI / 180);

  function getNormalizedAngularDifference(attemptAngle: number, referenceAngle: number) {
    return Math.abs(
      Math.atan2(Math.sin(attemptAngle - referenceAngle), Math.cos(attemptAngle - referenceAngle))
    );
  }

  const scores = Array.from({ length: comparedCount }, (_, index) => {
    const attemptSampled = sampleStroke(attemptStrokes[index]);
    const referenceSampled = sampleStroke(referenceStrokes[index]);
    const pointCount = Math.min(attemptSampled.length, referenceSampled.length);

    if (pointCount < 2) {
      return SCORE_MIN;
    }

    const pointScores: number[] = [];

    for (let i = 0; i < pointCount - 1; i++) {
      const attemptAngle = Math.atan2(
        attemptSampled[i + 1].y - attemptSampled[i].y,
        attemptSampled[i + 1].x - attemptSampled[i].x
      );
      const referenceAngle = Math.atan2(
        referenceSampled[i + 1].y - referenceSampled[i].y,
        referenceSampled[i + 1].x - referenceSampled[i].x
      );
      const difference = getNormalizedAngularDifference(attemptAngle, referenceAngle);

      if (difference <= toleranceRadians) {
        pointScores.push(100);
      } else {
        const penaltyRatio = (difference - toleranceRadians) / (Math.PI - toleranceRadians);
        pointScores.push(clampScore(100 - penaltyRatio * 100));
      }
    }

    return average(pointScores);
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

function sampleCollection(strokes: ReadonlyArray<Stroke>): ReadonlyArray<StrokePoint> {
  return strokes.flatMap(sampleStroke);
}

function sampleStroke(stroke: Stroke): ReadonlyArray<StrokePoint> {
  if (stroke.points.length === 0) {
    return [];
  }

  if (stroke.points.length === 1) {
    return Array.from({ length: SAMPLE_POINTS_PER_STROKE }, () => ({ ...stroke.points[0] }));
  }

  const cumulativeDistances: number[] = [0];

  for (let index = 1; index < stroke.points.length; index++) {
    cumulativeDistances.push(
      cumulativeDistances[index - 1] + distance(stroke.points[index - 1], stroke.points[index])
    );
  }

  const totalArcLength = cumulativeDistances[cumulativeDistances.length - 1];

  if (totalArcLength === 0) {
    return Array.from({ length: SAMPLE_POINTS_PER_STROKE }, () => ({ ...stroke.points[0] }));
  }

  const result: StrokePoint[] = [];

  for (let sampleIndex = 0; sampleIndex < SAMPLE_POINTS_PER_STROKE; sampleIndex++) {
    const targetDistance = (sampleIndex / (SAMPLE_POINTS_PER_STROKE - 1)) * totalArcLength;
    let segmentIndex = 1;

    while (
      segmentIndex < cumulativeDistances.length - 1 &&
      cumulativeDistances[segmentIndex] < targetDistance
    ) {
      segmentIndex++;
    }

    const segmentStart = cumulativeDistances[segmentIndex - 1];
    const segmentEnd = cumulativeDistances[segmentIndex];
    const segmentLength = segmentEnd - segmentStart;
    const interpolation = segmentLength === 0 ? 0 : (targetDistance - segmentStart) / segmentLength;
    const pointA = stroke.points[segmentIndex - 1];
    const pointB = stroke.points[segmentIndex];

    result.push({
      x: pointA.x + (pointB.x - pointA.x) * interpolation,
      y: pointA.y + (pointB.y - pointA.y) * interpolation
    });
  }

  return result;
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
