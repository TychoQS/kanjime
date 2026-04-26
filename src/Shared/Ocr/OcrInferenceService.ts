import type { InferencePrediction, ModelConfiguration } from "../DomainTypes";

type WorkerLoadRequest = {
  readonly id: string;
  readonly type: "load";
  readonly modelUrl: string;
  readonly classesUrl: string;
};

type WorkerClassifyRequest = {
  readonly id: string;
  readonly type: "classify";
  readonly sourceId: string;
  readonly inputUrl: string;
  readonly strokeCount?: number;
};

type WorkerRequest = WorkerLoadRequest | WorkerClassifyRequest;

type WorkerLoadedResponse = {
  readonly id: string;
  readonly type: "loaded";
  readonly configuration: ModelConfiguration;
};

type WorkerPredictionsResponse = {
  readonly id: string;
  readonly type: "predictions";
  readonly predictions: ReadonlyArray<InferencePrediction>;
};

type WorkerErrorResponse = {
  readonly id: string;
  readonly type: "error";
  readonly message: string;
};

type WorkerResponse = WorkerLoadedResponse | WorkerPredictionsResponse | WorkerErrorResponse;

const MODEL_URL = "/assets/model/kanji-classifier.onnx";
const CLASSES_URL = "/assets/model/classes.json";

/**
 * Browser worker based OCR service.
 *
 * @inv The worker and model load promise are created at most once.
 */
export interface OcrInferenceService {
  /**
   * Loads the OCR model.
   *
   * @post The returned configuration describes the ready model.
   */
  loadModel(): Promise<ModelConfiguration>;

  /**
   * Classifies one input source.
   *
   * @pre sourceId and inputUrl are non-empty.
   * @post Predictions are ordered by confidence.
   */
  classifySource(
    sourceId: string,
    inputUrl: string,
    strokeCount?: number
  ): Promise<ReadonlyArray<InferencePrediction>>;
}

/**
 * Creates the worker-backed inference service.
 *
 * @returns OCR inference service.
 */
export function createOcrInferenceService(): OcrInferenceService {
  const worker = new Worker(new URL("./OcrWorker.ts", import.meta.url), {
    type: "module"
  });
  const pendingRequests = new Map<string, {
    resolve: (response: WorkerResponse) => void;
    reject: (reason: Error) => void;
  }>();
  let loadPromise: Promise<ModelConfiguration> | null = null;

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const pendingRequest = pendingRequests.get(response.id);

    if (!pendingRequest) {
      return;
    }

    pendingRequests.delete(response.id);
    pendingRequest.resolve(response);
  };
  worker.onerror = event => {
    const error = new Error(event.message || "Character recognition could not start.");
    pendingRequests.forEach(request => request.reject(error));
    pendingRequests.clear();
  };

  async function postRequest(request: WorkerRequest): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      pendingRequests.set(request.id, { resolve, reject });
      worker.postMessage(request);
    });
  }

  return {
    loadModel(): Promise<ModelConfiguration> {
      if (loadPromise === null) {
        loadPromise = postRequest({
          id: crypto.randomUUID(),
          type: "load",
          modelUrl: MODEL_URL,
          classesUrl: CLASSES_URL
        }).then(response => {
          if (response.type === "error") {
            throw new Error(response.message);
          }

          if (response.type !== "loaded") {
            throw new Error("Character recognition could not start.");
          }

          return response.configuration;
        });
      }

      return loadPromise;
    },
    async classifySource(sourceId, inputUrl, strokeCount): Promise<ReadonlyArray<InferencePrediction>> {
      const response = await postRequest({
        id: crypto.randomUUID(),
        type: "classify",
        sourceId,
        inputUrl,
        ...(strokeCount === undefined ? {} : { strokeCount })
      });

      if (response.type === "error") {
        throw new Error(response.message);
      }

      if (response.type !== "predictions") {
        throw new Error("The character could not be identified.");
      }

      return response.predictions;
    }
  };
}
