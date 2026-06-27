import type {
  OpenCvHomographyRuntime,
  OpenCvKeypointVector,
  GoodMatch,
  HomographyResult
} from "./Types";
import { getMinGoodMatches } from "./SiftMatcher";

const RANSAC_THRESHOLD = 5.0;

export function computeHomographyWithRansac(
  cv: OpenCvHomographyRuntime,
  referenceKeypoints: OpenCvKeypointVector,
  attemptKeypoints: OpenCvKeypointVector,
  goodMatches: GoodMatch[]
): HomographyResult | null {
  if (goodMatches.length < getMinGoodMatches()) {
    return null;
  }

  const srcCoords: number[] = [];
  const dstCoords: number[] = [];

  for (const match of goodMatches) {
    const refKp = referenceKeypoints.get(match.referenceKeypointIndex);
    const attKp = attemptKeypoints.get(match.attemptKeypointIndex);
    srcCoords.push(attKp.pt.x, attKp.pt.y);
    dstCoords.push(refKp.pt.x, refKp.pt.y);
  }

  const srcMat = cv.matFromArray(goodMatches.length, 1, cv.CV_32FC2, srcCoords);
  const dstMat = cv.matFromArray(goodMatches.length, 1, cv.CV_32FC2, dstCoords);
  const mask = new cv.Mat();
  const H = cv.findHomography(srcMat, dstMat, cv.RANSAC, RANSAC_THRESHOLD, mask);

  let inlierCount = 0;
  const inlierMatches: GoodMatch[] = [];
  const maskRows = mask.rows ?? 0;

  for (let i = 0; i < maskRows; i++) {
    if (mask.ucharAt(i, 0) !== 0) {
      inlierCount++;
      inlierMatches.push(goodMatches[i]);
    }
  }

  srcMat.delete();
  dstMat.delete();
  mask.delete();

  if ((H.rows ?? 0) === 0) {
    H.delete();
    return null;
  }

  return {
    homographyMat: H,
    inlierCount,
    totalMatches: goodMatches.length,
    inlierMatches
  };
}
