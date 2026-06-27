interface OpenCvGlobal {
  readonly cv?: OpenCvRuntime | Promise<unknown>;
}

interface OpenCvRuntime {
  readonly Mat?: unknown;
  readonly SIFT?: unknown;
  readonly SIFT_create?: unknown;
  onRuntimeInitialized?: () => void;
}

interface SiftInstance {
  delete?: () => void;
  detectAndCompute?: (...args: unknown[]) => unknown;
}

const OPENCV_SCRIPT_SRC = "/opencv/opencv.js";

let initializationPromise: Promise<void> | null = null;

export function initializeOpenCv(): Promise<void> {
  if (isOpenCvReady()) {
    return Promise.resolve();
  }

  if (initializationPromise !== null) {
    return initializationPromise;
  }

  initializationPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      initializationPromise = null;
      reject(new Error("OpenCV cannot be loaded without a document."));
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-open-cv-service="true"]',
    );

    const handleLoadedRuntime = async () => {
      try {
        const cv = await resolveOpenCvRuntime();

        if (!isOpenCvRuntimeReady(cv)) {
          initializationPromise = null;
          reject(new Error("OpenCV runtime was exposed but is not ready."));
          return;
        }

        assertSiftAvailable(cv);
        resolve();
      } catch (error) {
        initializationPromise = null;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (existingScript) {
      void handleLoadedRuntime();
      return;
    }

    const script = document.createElement("script");
    script.src = OPENCV_SCRIPT_SRC;
    script.async = true;
    script.dataset.openCvService = "true";

    script.onerror = () => {
      initializationPromise = null;
      reject(new Error("OpenCV could not be loaded."));
    };

    script.onload = () => {
      const cv = readOpenCvRuntime();

      if (cv === undefined) {
        initializationPromise = null;
        reject(new Error("OpenCV runtime was not exposed."));
        return;
      }

      if (isPromiseLike(cv)) {
        cv.then((resolvedModule: unknown) => {
          (globalThis as Record<string, unknown>).cv = resolvedModule;
          void handleLoadedRuntime();
        }).catch((error: unknown) => {
          initializationPromise = null;
          reject(error instanceof Error ? error : new Error(String(error)));
        });
        return;
      }

      if (isOpenCvRuntimeReady(cv)) {
        try {
          assertSiftAvailable(cv);
          resolve();
        } catch (error) {
          initializationPromise = null;
          reject(error instanceof Error ? error : new Error(String(error)));
        }
        return;
      }

      cv.onRuntimeInitialized = () => {
        void handleLoadedRuntime();
      };
    };

    document.head.append(script);
  });

  return initializationPromise;
}

export async function getOpenCvRuntime(): Promise<OpenCvRuntime> {
  await initializeOpenCv();

  const cv = await resolveOpenCvRuntime();

  if (!isOpenCvRuntimeReady(cv)) {
    throw new Error("OpenCV runtime is not ready.");
  }

  assertSiftAvailable(cv);

  return cv;
}

export function isOpenCvReady(): boolean {
  const cv = readOpenCvRuntime();

  if (cv === undefined || isPromiseLike(cv)) {
    return false;
  }

  return isOpenCvRuntimeReady(cv) && hasSift(cv);
}

export function createSift(cv: OpenCvRuntime): SiftInstance {
  const siftNamespace = cv.SIFT as
    | undefined
    | {
      create?: () => SiftInstance;
      new(): SiftInstance;
    };

  if (siftNamespace && typeof siftNamespace.create === "function") {
    return siftNamespace.create();
  }

  if (typeof cv.SIFT_create === "function") {
    return (cv.SIFT_create as () => SiftInstance)();
  }

  if (typeof siftNamespace === "function") {
    return new siftNamespace();
  }

  throw new Error("SIFT is not available in this OpenCV.js build.");
}

function readOpenCvRuntime(): OpenCvRuntime | Promise<unknown> | undefined {
  return (globalThis as OpenCvGlobal).cv;
}

async function resolveOpenCvRuntime(): Promise<OpenCvRuntime> {
  const cv = readOpenCvRuntime();

  if (cv === undefined) {
    throw new Error("OpenCV runtime was not exposed.");
  }

  const resolved = isPromiseLike(cv) ? await cv : cv;

  if (!isOpenCvRuntime(resolved)) {
    throw new Error("OpenCV runtime has an unexpected shape.");
  }

  return resolved;
}

function isOpenCvRuntime(value: unknown): value is OpenCvRuntime {
  return typeof value === "object" && value !== null;
}

function isOpenCvRuntimeReady(cv: OpenCvRuntime): boolean {
  return cv.Mat !== undefined;
}

function hasSift(cv: OpenCvRuntime): boolean {
  const siftNamespace = cv.SIFT as
    | undefined
    | {
      create?: unknown;
    };

  return (
    Boolean(cv.SIFT) ||
    typeof cv.SIFT_create === "function" ||
    typeof siftNamespace?.create === "function"
  );
}

function assertSiftAvailable(cv: OpenCvRuntime): void {
  if (!hasSift(cv)) {
    throw new Error("OpenCV loaded, but SIFT is not exported.");
  }
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}
