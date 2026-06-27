import type { StrokePoint } from "@kanjime/shared";

export interface SimilarityInput {
  readonly referenceStrokes: ReadonlyArray<{ readonly points: ReadonlyArray<StrokePoint> }>;
  readonly attemptStrokes: ReadonlyArray<{ readonly points: ReadonlyArray<StrokePoint> }>;
}

export interface SimilarityOutput {
  readonly score: number;
  readonly strategy: "SIFT" | "FALLBACK";
  readonly matchedKeypointCount: number;
  readonly fallbackReason?: "insufficient_keypoints";
}

export interface AlignmentInput {
  readonly referenceStrokes: ReadonlyArray<{ readonly points: ReadonlyArray<StrokePoint> }>;
  readonly attemptStrokes: ReadonlyArray<{ readonly points: ReadonlyArray<StrokePoint> }>;
}

export interface AlignmentOutput {
  readonly isHomographyApplied: boolean;
  readonly matchedKeypoints?: ReadonlyArray<readonly [StrokePoint, StrokePoint]>;
}

export interface VisualComparisonEngine {
  computeSimilarity(input: SimilarityInput): Promise<SimilarityOutput>;
  computeAlignment(input: AlignmentInput): Promise<AlignmentOutput>;
}
