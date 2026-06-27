import type {
  OpenCvHomographyRuntime,
  OpenCvSift,
  OpenCvMat,
  OpenCvKeypointVector,
  SiftResult,
  GoodMatch,
  InkMask
} from "./Types";
import { isNearInk } from "./Rasterizer";

const LOWE_RATIO = 0.75;
const MIN_GOOD_MATCHES = 4;

export function getMinGoodMatches(): number {
  return MIN_GOOD_MATCHES;
}

export function computeSiftFeatures(cv: OpenCvHomographyRuntime, sift: OpenCvSift, grayMat: OpenCvMat): SiftResult {
  const keypoints = new cv.KeyPointVector();
  const descriptors = new cv.Mat();
  const mask = new cv.Mat();

  sift.detectAndCompute(grayMat, mask, keypoints, descriptors);
  mask.delete();

  return { keypoints, descriptors };
}

export function findGoodMatches(
  cv: OpenCvHomographyRuntime,
  referenceDescriptors: OpenCvMat,
  attemptDescriptors: OpenCvMat
): GoodMatch[] {
  const matcher = new cv.BFMatcher(cv.NORM_L2, false);
  const knnMatches = new cv.DMatchVectorVector();

  matcher.knnMatch(referenceDescriptors, attemptDescriptors, knnMatches, 2);

  const goodMatches: GoodMatch[] = [];

  for (let i = 0; i < knnMatches.size(); i++) {
    const pair = knnMatches.get(i);

    if (pair.size() < 2) {
      continue;
    }

    const best = pair.get(0);
    const secondBest = pair.get(1);

    if (best.distance < LOWE_RATIO * secondBest.distance) {
      goodMatches.push({
        referenceKeypointIndex: best.queryIdx,
        attemptKeypointIndex: best.trainIdx
      });
    }
  }

  matcher.delete();
  knnMatches.delete();

  return goodMatches;
}

export function filterInkConsistentMatches(
    referenceKeypoints: OpenCvKeypointVector,
    attemptKeypoints: OpenCvKeypointVector,
    referenceInkMask: InkMask,
    attemptInkMask: InkMask,
    matches: ReadonlyArray<GoodMatch>
): GoodMatch[] {
  return matches.filter(match => {
    const referenceKeypoint = referenceKeypoints.get(match.referenceKeypointIndex);
    const attemptKeypoint = attemptKeypoints.get(match.attemptKeypointIndex);

    return (
        isNearInk(referenceInkMask, referenceKeypoint.pt.x, referenceKeypoint.pt.y) &&
        isNearInk(attemptInkMask, attemptKeypoint.pt.x, attemptKeypoint.pt.y)
    );
  });
}

export function cleanupSiftResources(
  sift: OpenCvSift,
  referenceFeatures: SiftResult,
  attemptFeatures: SiftResult
): void {
  sift.delete();
  referenceFeatures.keypoints.delete();
  referenceFeatures.descriptors.delete();
  attemptFeatures.keypoints.delete();
  attemptFeatures.descriptors.delete();
}
