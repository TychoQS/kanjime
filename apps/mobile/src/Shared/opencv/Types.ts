export interface OpenCvMat {
  readonly rows?: number;
  ucharAt(row: number, col: number): number;
  delete(): void;
}

export interface OpenCvMatConstructor {
  new(): OpenCvMat;
}

export interface OpenCvKeypoint {
  pt: { x: number; y: number };
}

export interface OpenCvDMatch {
  queryIdx: number;
  trainIdx: number;
  distance: number;
}

export interface OpenCvKeypointVector {
  size(): number;
  get(index: number): OpenCvKeypoint;
  delete(): void;
}

export interface OpenCvDMatchVector {
  size(): number;
  get(index: number): OpenCvDMatch;
}

export interface OpenCvDMatchVectorVector {
  size(): number;
  get(index: number): OpenCvDMatchVector;
  delete(): void;
}

export interface OpenCvSift {
  detectAndCompute(image: OpenCvMat, mask: OpenCvMat, keypoints: OpenCvKeypointVector, descriptors: OpenCvMat): void;
  delete(): void;
}

export interface OpenCvBFMatcher {
  knnMatch(query: OpenCvMat, train: OpenCvMat, matches: OpenCvDMatchVectorVector, k: number): void;
  delete(): void;
}

export interface OpenCvHomographyRuntime {
  readonly CV_32FC2: number;
  readonly RANSAC: number;
  readonly NORM_L2: number;
  readonly COLOR_RGBA2GRAY: number;
  readonly Mat: OpenCvMatConstructor;
  readonly SIFT: { new(): OpenCvSift };
  readonly BFMatcher: { new(normType: number, crossCheck: boolean): OpenCvBFMatcher };
  readonly KeyPointVector: { new(): OpenCvKeypointVector };
  readonly DMatchVectorVector: { new(): OpenCvDMatchVectorVector };
  matFromImageData(imageData: ImageData): OpenCvMat;
  matFromArray(rows: number, cols: number, type: number, data: ReadonlyArray<number>): OpenCvMat;
  cvtColor(src: OpenCvMat, dst: OpenCvMat, code: number): void;
  findHomography(src: OpenCvMat, dst: OpenCvMat, method: number, threshold: number, mask: OpenCvMat): OpenCvMat;
}

export interface SiftResult {
  keypoints: OpenCvKeypointVector;
  descriptors: OpenCvMat;
}

export interface GoodMatch {
  referenceKeypointIndex: number;
  attemptKeypointIndex: number;
}

export interface HomographyResult {
  homographyMat: OpenCvMat;
  inlierCount: number;
  totalMatches: number;
  inlierMatches: GoodMatch[];
}

export interface InkMask {
  readonly width: number;
  readonly height: number;
  readonly pixels: Uint8Array;
}
