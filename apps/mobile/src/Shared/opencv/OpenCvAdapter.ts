import type { OpenCvHomographyRuntime } from "./Types";
import { getOpenCvRuntime } from "./Loader";
import {
  createOpenCvStrokeDataUri,
  rasterizeSvgToImageData,
  imageDataToGrayMat,
  createInkMask
} from "./Rasterizer";
import {
  computeSiftFeatures,
  findGoodMatches,
  filterInkConsistentMatches,
  cleanupSiftResources
} from "./SiftMatcher";
import { computeHomographyWithRansac } from "./Homography";
import type {
  SimilarityInput,
  SimilarityOutput,
  AlignmentInput,
  AlignmentOutput,
  VisualComparisonEngine
} from "../../Features/Calligraphy/Contracts/VisualComparisonEngine";

const MIN_KEYPOINTS = 8;
const MAX_REPORTED_KEYPOINTS = 18;
const MIN_GOOD_MATCHES = 4;
const KANJIVG_SIZE = 109;

export function createOpenCvAdapter(): VisualComparisonEngine {
  return {
    async computeSimilarity(input: SimilarityInput): Promise<SimilarityOutput> {
      const { referenceStrokes, attemptStrokes } = input;
      const cv = await getOpenCvRuntime() as unknown as OpenCvHomographyRuntime;

      const referenceSvgUri = createOpenCvStrokeDataUri(referenceStrokes);
      const attemptSvgUri = createOpenCvStrokeDataUri(attemptStrokes);

      const [referenceImageData, attemptImageData] = await Promise.all([
        rasterizeSvgToImageData(referenceSvgUri),
        rasterizeSvgToImageData(attemptSvgUri)
      ]);

      const referenceInkMask = createInkMask(referenceImageData);
      const attemptInkMask = createInkMask(attemptImageData);

      const referenceGray = imageDataToGrayMat(cv, referenceImageData);
      const attemptGray = imageDataToGrayMat(cv, attemptImageData);

      const sift = new cv.SIFT();
      const referenceFeatures = computeSiftFeatures(cv, sift, referenceGray);
      const attemptFeatures = computeSiftFeatures(cv, sift, attemptGray);

      referenceGray.delete();
      attemptGray.delete();

      const detectedKeypointCount = Math.min(
        referenceFeatures.keypoints.size(),
        attemptFeatures.keypoints.size()
      );

      if (detectedKeypointCount < MIN_KEYPOINTS) {
        cleanupSiftResources(sift, referenceFeatures, attemptFeatures);
        return {
          score: 0,
          strategy: "FALLBACK",
          matchedKeypointCount: detectedKeypointCount,
          fallbackReason: "insufficient_keypoints"
        };
      }

      const goodMatches = findGoodMatches(cv, referenceFeatures.descriptors, attemptFeatures.descriptors);

      const inkMatches = filterInkConsistentMatches(
          referenceFeatures.keypoints,
          attemptFeatures.keypoints,
          referenceInkMask,
          attemptInkMask,
          goodMatches
      );

      const homographyResult = inkMatches.length >= MIN_GOOD_MATCHES
          ? computeHomographyWithRansac(cv, referenceFeatures.keypoints, attemptFeatures.keypoints, inkMatches)
          : null;

      const score = homographyResult
          ? calculateSiftScore(homographyResult.inlierCount, homographyResult.totalMatches)
          : calculateSiftScore(inkMatches.length, detectedKeypointCount);

      const matchedKeypointCount = homographyResult?.inlierCount ?? inkMatches.length;

      homographyResult?.homographyMat.delete();
      cleanupSiftResources(sift, referenceFeatures, attemptFeatures);

      return {
        score,
        strategy: "SIFT",
        matchedKeypointCount
      };
    },

    async computeAlignment(input: AlignmentInput): Promise<AlignmentOutput> {
      const { referenceStrokes, attemptStrokes } = input;

      try {
        const cv = await getOpenCvRuntime() as unknown as OpenCvHomographyRuntime;

        const referenceSvgUri = createOpenCvStrokeDataUri(referenceStrokes);
        const attemptSvgUri = createOpenCvStrokeDataUri(attemptStrokes);

        const [referenceImageData, attemptImageData] = await Promise.all([
          rasterizeSvgToImageData(referenceSvgUri),
          rasterizeSvgToImageData(attemptSvgUri)
        ]);

        const referenceInkMask = createInkMask(referenceImageData);
        const attemptInkMask = createInkMask(attemptImageData);

        const referenceGray = imageDataToGrayMat(cv, referenceImageData);
        const attemptGray = imageDataToGrayMat(cv, attemptImageData);
        const sift = new cv.SIFT();
        const referenceFeatures = computeSiftFeatures(cv, sift, referenceGray);
        const attemptFeatures = computeSiftFeatures(cv, sift, attemptGray);

        referenceGray.delete();
        attemptGray.delete();

        if (
            referenceFeatures.keypoints.size() < MIN_GOOD_MATCHES ||
            attemptFeatures.keypoints.size() < MIN_GOOD_MATCHES
        ) {
          cleanupSiftResources(sift, referenceFeatures, attemptFeatures);
          return { isHomographyApplied: false };
        }

        const goodMatches = findGoodMatches(cv, referenceFeatures.descriptors, attemptFeatures.descriptors);

        const inkMatches = filterInkConsistentMatches(
            referenceFeatures.keypoints,
            attemptFeatures.keypoints,
            referenceInkMask,
            attemptInkMask,
            goodMatches
        );

        if (inkMatches.length < MIN_GOOD_MATCHES) {
          cleanupSiftResources(sift, referenceFeatures, attemptFeatures);
          return { isHomographyApplied: false };
        }

        const homographyResult = computeHomographyWithRansac(
            cv,
            referenceFeatures.keypoints,
            attemptFeatures.keypoints,
            inkMatches
        );

        if (!homographyResult) {
          cleanupSiftResources(sift, referenceFeatures, attemptFeatures);
          return { isHomographyApplied: false };
        }

        if (homographyResult.inlierCount < MIN_GOOD_MATCHES) {
          homographyResult.homographyMat.delete();
          cleanupSiftResources(sift, referenceFeatures, attemptFeatures);
          return { isHomographyApplied: false };
        }

        const matchedKeypoints = homographyResult.inlierMatches
            .slice(0, MAX_REPORTED_KEYPOINTS)
            .map(match => {
              const refKp = referenceFeatures.keypoints.get(match.referenceKeypointIndex);
              const attKp = attemptFeatures.keypoints.get(match.attemptKeypointIndex);

              return [
                { x: refKp.pt.x * (KANJIVG_SIZE / 256), y: refKp.pt.y * (KANJIVG_SIZE / 256) },
                { x: attKp.pt.x * (KANJIVG_SIZE / 256), y: attKp.pt.y * (KANJIVG_SIZE / 256) }
              ] as const;
            });

        homographyResult.homographyMat.delete();
        cleanupSiftResources(sift, referenceFeatures, attemptFeatures);

        return {
          isHomographyApplied: true,
          matchedKeypoints
        };
      } catch {
        return { isHomographyApplied: false };
      }
    }
  };
}

function calculateSiftScore(inlierCount: number, totalMatches: number): number {
  if (totalMatches === 0) {
    return 0;
  }

  return clampScore(Math.round((inlierCount / totalMatches) * 100));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
