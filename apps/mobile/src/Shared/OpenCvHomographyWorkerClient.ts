import type { StrokePoint } from "@kanjime/shared";

export interface OpenCvHomographyRequest {
  readonly referenceImage: ArrayBuffer;
  readonly attemptImage: ArrayBuffer;
  readonly referencePoints: ReadonlyArray<StrokePoint>;
  readonly attemptPoints: ReadonlyArray<StrokePoint>;
  readonly visualSize: number;
}

export interface OpenCvHomographyResult {
  readonly isHomographyApplied: boolean;
  readonly matchedKeypoints?: ReadonlyArray<readonly [StrokePoint, StrokePoint]>;
  readonly alignedAttemptImageUri?: string;
}

interface OpenCvWorkerLike {
  postMessage(message: OpenCvWorkerRequest, transfer?: Transferable[]): void;
  addEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void;
  removeEventListener(type: "message", listener: (event: MessageEvent<OpenCvWorkerResponse>) => void): void;
  terminate(): void;
}

export type OpenCvWorkerFactory = () => OpenCvWorkerLike;

interface InitializeWorkerRequest {
  readonly id: string;
  readonly type: "initialize";
}

interface ApplyHomographyWorkerRequest {
  readonly id: string;
  readonly type: "applyHomography";
  readonly request: OpenCvHomographyRequest;
}

export type OpenCvWorkerRequest = InitializeWorkerRequest | ApplyHomographyWorkerRequest;

interface InitializedWorkerResponse {
  readonly id: string;
  readonly type: "initialized";
}

interface HomographyWorkerResponse {
  readonly id: string;
  readonly type: "homographyResult";
  readonly result: OpenCvHomographyResult;
}

interface FailedWorkerResponse {
  readonly id: string;
  readonly type: "failed";
}

export type OpenCvWorkerResponse = InitializedWorkerResponse | HomographyWorkerResponse | FailedWorkerResponse;

interface PendingHomographyRequest {
  readonly resolve: (result: OpenCvHomographyResult) => void;
  readonly timeoutId: ReturnType<typeof setTimeout>;
}

const HOMOGRAPHY_TIMEOUT_MS = 2000;

const createDefaultOpenCvWorker: OpenCvWorkerFactory = () => new Worker(
  new URL("./OpenCvHomographyWorker.ts", import.meta.url),
  { type: "module" }
);
let workerFactory: OpenCvWorkerFactory = createDefaultOpenCvWorker;
let worker: OpenCvWorkerLike | null = null;
let isWorkerReady = false;
let workerCreationCount = 0;
let messageSequence = 0;
let pendingInitializationId: string | null = null;
let initializationPromise: Promise<void> | null = null;
let resolveInitialization: (() => void) | null = null;
let rejectInitialization: (() => void) | null = null;
let pendingHomographyRequests = new Map<string, PendingHomographyRequest>();

const handleWorkerMessage = (event: MessageEvent<OpenCvWorkerResponse>): void => {
  const message = event.data;

  if (message.type === "initialized" && message.id === pendingInitializationId) {
    isWorkerReady = true;
    pendingInitializationId = null;
    resolveInitialization?.();
    resolveInitialization = null;
    rejectInitialization = null;
    return;
  }

  if (message.type === "failed" && message.id === pendingInitializationId) {
    isWorkerReady = false;
    pendingInitializationId = null;
    rejectInitialization?.();
    initializationPromise = null;
    resolveInitialization = null;
    rejectInitialization = null;
    return;
  }

  const pendingRequest = pendingHomographyRequests.get(message.id);

  if (!pendingRequest) {
    return;
  }

  clearTimeout(pendingRequest.timeoutId);
  pendingHomographyRequests.delete(message.id);
  pendingRequest.resolve(message.type === "homographyResult"
    ? normalizeHomographyResult(message.result)
    : createUnavailableHomographyResult());
};

export function configureOpenCvWorkerFactory(factory: OpenCvWorkerFactory): void {
  resetOpenCvWorkerClient();
  workerFactory = factory;
}

export function resetOpenCvWorkerClient(): void {
  if (worker !== null) {
    worker.removeEventListener("message", handleWorkerMessage);
    worker.terminate();
  }

  worker = null;
  workerFactory = createDefaultOpenCvWorker;
  isWorkerReady = false;
  workerCreationCount = 0;
  pendingInitializationId = null;
  initializationPromise = null;
  resolveInitialization = null;
  rejectInitialization = null;
  messageSequence = 0;
  pendingHomographyRequests.forEach(request => {
    clearTimeout(request.timeoutId);
    request.resolve(createUnavailableHomographyResult());
  });
  pendingHomographyRequests = new Map<string, PendingHomographyRequest>();
}

export async function initializeOpenCvWorker(): Promise<void> {
  const homographyWorker = getOrCreateWorker();

  if (isWorkerReady) {
    return;
  }

  if (initializationPromise !== null) {
    return initializationPromise;
  }

  pendingInitializationId = createMessageId();
  initializationPromise = new Promise((resolve, reject) => {
    resolveInitialization = resolve;
    rejectInitialization = reject;
  });
  homographyWorker.postMessage({
    id: pendingInitializationId,
    type: "initialize"
  });

  return initializationPromise;
}

export function isOpenCvWorkerReady(): boolean {
  return isWorkerReady;
}

export function getOpenCvWorkerCreationCount(): number {
  return workerCreationCount;
}

export async function applyOpenCvHomography(request: OpenCvHomographyRequest): Promise<OpenCvHomographyResult> {
  if (!isWorkerReady || worker === null) {
    return createUnavailableHomographyResult();
  }

  return new Promise(resolve => {
    const requestId = createMessageId();
    const timeoutId = setTimeout(() => {
      pendingHomographyRequests.delete(requestId);
      resolve(createUnavailableHomographyResult());
    }, HOMOGRAPHY_TIMEOUT_MS);

    pendingHomographyRequests.set(requestId, {
      resolve,
      timeoutId
    });

    try {
      worker?.postMessage({
        id: requestId,
        type: "applyHomography",
        request
      }, [request.referenceImage, request.attemptImage]);
    } catch {
      clearTimeout(timeoutId);
      pendingHomographyRequests.delete(requestId);
      resolve(createUnavailableHomographyResult());
    }
  });
}

function getOrCreateWorker(): OpenCvWorkerLike {
  if (worker === null) {
    worker = workerFactory();
    workerCreationCount++;
    worker.addEventListener("message", handleWorkerMessage);
  }

  return worker;
}

function createMessageId(): string {
  messageSequence++;
  return `opencv-worker-message-${messageSequence}`;
}

function createUnavailableHomographyResult(): OpenCvHomographyResult {
  return {
    isHomographyApplied: false
  };
}

function normalizeHomographyResult(result: OpenCvHomographyResult): OpenCvHomographyResult {
  if (
    !result.isHomographyApplied ||
    result.matchedKeypoints === undefined ||
    result.matchedKeypoints.length < 4 ||
    result.alignedAttemptImageUri === undefined
  ) {
    return createUnavailableHomographyResult();
  }

  return result;
}
