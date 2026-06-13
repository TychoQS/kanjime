/// <reference lib="webworker" />

import type * as OpenCv from "@techstark/opencv-js";

import type { OpenCvWorkerRequest, OpenCvWorkerResponse } from "./OpenCvHomographyWorkerClient";

type OpenCvRuntime = typeof OpenCv;

let openCvRuntimePromise: Promise<OpenCvRuntime> | null = null;

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.addEventListener("message", event => {
  const message = event.data as OpenCvWorkerRequest;

  if (message.type === "initialize") {
    void initializeOpenCvRuntime()
      .then(() => postWorkerMessage({
        id: message.id,
        type: "initialized"
      }))
      .catch(() => postWorkerMessage({
        id: message.id,
        type: "failed"
      }));
    return;
  }

  void initializeOpenCvRuntime()
    .then(openCvRuntime => applyHomography(openCvRuntime, message.request))
    .then(result => postWorkerMessage({
      id: message.id,
      type: "homographyResult",
      result
    }))
    .catch(() => postWorkerMessage({
      id: message.id,
      type: "homographyResult",
      result: {
        isHomographyApplied: false
      }
    }));
});

function initializeOpenCvRuntime(): Promise<OpenCvRuntime> {
  if (openCvRuntimePromise === null) {
    openCvRuntimePromise = import("@techstark/opencv-js");
  }

  return openCvRuntimePromise;
}

function applyHomography(
  cv: OpenCvRuntime,
  request: Extract<OpenCvWorkerRequest, { readonly type: "applyHomography" }>["request"]
): Extract<OpenCvWorkerResponse, { readonly type: "homographyResult" }>["result"] {
  const correspondenceCount = Math.min(request.referencePoints.length, request.attemptPoints.length);

  if (request.referenceImage.byteLength === 0) {
    return { isHomographyApplied: false };
  }
  if (request.attemptImage.byteLength === 0) {
    return { isHomographyApplied: false };
  }
  if (correspondenceCount < 4) {
    return { isHomographyApplied: false };
  }

  const referenceMat = cv.matFromArray(
    correspondenceCount,
    1,
    cv.CV_32FC2,
    request.referencePoints.slice(0, correspondenceCount).flatMap(point => [point.x, point.y])
  );
  const attemptMat = cv.matFromArray(
    correspondenceCount,
    1,
    cv.CV_32FC2,
    request.attemptPoints.slice(0, correspondenceCount).flatMap(point => [point.x, point.y])
  );
  const mask = new cv.Mat();
  const homography = cv.findHomography(referenceMat, attemptMat, cv.RANSAC, 3, mask);

  const source = cv.Mat.zeros(request.visualSize, request.visualSize, cv.CV_8UC1);
  const aligned = new cv.Mat();

  cv.warpPerspective(source, aligned, homography, new cv.Size(request.visualSize, request.visualSize));

  const homographyRows = homography.rows;
  const homographyCols = homography.cols;
  const isHomographyApplied = homographyRows > 0 && homographyCols > 0;

  const alignedAttemptImageUri = isHomographyApplied
    ? createAlignedAttemptImageUri(request.attemptImage)
    : undefined;
  const matchedKeypoints = isHomographyApplied
    ? request.referencePoints.slice(0, correspondenceCount).map((referencePoint, index) => [
      referencePoint,
      request.attemptPoints[index]
    ] as const)
    : undefined;

  referenceMat.delete();
  attemptMat.delete();
  mask.delete();
  homography.delete();
  source.delete();
  aligned.delete();

  if (!isHomographyApplied) {
    return { isHomographyApplied: false };
  }
  if (matchedKeypoints === undefined) {
    return { isHomographyApplied: false };
  }
  if (alignedAttemptImageUri === undefined) {
    return { isHomographyApplied: false };
  }

  return {
    isHomographyApplied,
    matchedKeypoints,
    alignedAttemptImageUri
  };
}

function postWorkerMessage(message: OpenCvWorkerResponse): void {
  workerScope.postMessage(message);
}

function createAlignedAttemptImageUri(image: ArrayBuffer): string {
  const binary = Array.from(new Uint8Array(image))
    .map(byte => String.fromCharCode(byte))
    .join("");

  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

export {};
