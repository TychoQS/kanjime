interface OpenCvGlobal {
  readonly cv?: OpenCvRuntime;
}

interface OpenCvRuntime {
  readonly Mat?: unknown;
  onRuntimeInitialized?: () => void;
}

const OPENCV_SCRIPT_SRC = "/assets/opencv.js";

let initializationPromise: Promise<void> | null = null;

/**
 * Loads the OpenCV.js script once and waits for the Emscripten runtime.
 */
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

      if (isOpenCvReady()) {
        resolve();
        return;
      }

      cv.onRuntimeInitialized = () => {
        resolve();
      };
    };

    document.head.append(script);
  });

  return initializationPromise;
}

export function isOpenCvReady(): boolean {
  return readOpenCvRuntime()?.Mat !== undefined;
}

function readOpenCvRuntime(): OpenCvRuntime | undefined {
  return (globalThis as OpenCvGlobal).cv;
}
