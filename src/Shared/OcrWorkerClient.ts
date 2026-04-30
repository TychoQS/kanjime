import type { CropRegion, InferencePrediction, Stroke } from "./DomainTypes";

export interface DrawingClassificationInput {
  readonly strokes: ReadonlyArray<Stroke>;
  readonly width: number;
  readonly height: number;
}

export interface ImageClassificationInput {
  readonly sourceUri: string;
  readonly crop?: CropRegion;
}

type OcrWorkerRequest =
  | {
      readonly id: number;
      readonly type: "load";
    }
  | {
      readonly id: number;
      readonly type: "classifyDrawing";
      readonly input: DrawingClassificationInput;
    }
  | {
      readonly id: number;
      readonly type: "classifyImage";
      readonly input: ImageClassificationInput;
    }
  | {
      readonly id: number;
      readonly type: "preprocessDrawing";
      readonly input: DrawingClassificationInput;
    }
  | {
      readonly id: number;
      readonly type: "preprocessImage";
      readonly input: ImageClassificationInput;
    };

type OcrWorkerResponse =
  | {
      readonly id: number;
      readonly type: "loaded";
    }
  | {
      readonly id: number;
      readonly type: "predictions";
      readonly predictions: ReadonlyArray<InferencePrediction>;
    }
  | {
      readonly id: number;
      readonly type: "preprocessedImage";
      readonly imageData: ImageData;
    }
  | {
      readonly id: number;
      readonly type: "error";
      readonly message: string;
    };

type PendingRequest =
  | {
      readonly type: "load";
      readonly resolve: () => void;
      readonly reject: (reason: Error) => void;
    }
  | {
      readonly type: "predictions";
      readonly resolve: (value: ReadonlyArray<InferencePrediction>) => void;
      readonly reject: (reason: Error) => void;
    }
  | {
      readonly type: "preprocessedImage";
      readonly resolve: (value: ImageData) => void;
      readonly reject: (reason: Error) => void;
    };

/**
 * Browser worker client for non-blocking OCR inference.
 *
 * @pre The OCR worker can be constructed by Vite.
 * @inv The model-load request is shared for the app session.
 * @post Classification resolves with ordered prediction objects.
 */
export class OcrWorkerClient {
  private readonly worker: Worker;

  private readonly pendingRequests = new Map<number, PendingRequest>();

  private nextRequestId = 1;

  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.worker = new Worker(new URL("../Features/Classification/OcrWorker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.addEventListener("message", event => this.handleMessage(event));
  }

  loadModel(): Promise<void> {
    if (this.loadPromise !== null) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const requestId = this.nextRequestId;
      this.nextRequestId += 1;
      this.pendingRequests.set(requestId, {
        type: "load",
        resolve: () => resolve(),
        reject
      });
      this.worker.postMessage({
        id: requestId,
        type: "load"
      } satisfies OcrWorkerRequest);
    });

    return this.loadPromise;
  }

  async classifyDrawing(input: DrawingClassificationInput): Promise<ReadonlyArray<InferencePrediction>> {
    await this.loadModel();
    return this.sendPredictionRequest({
      id: this.nextId(),
      type: "classifyDrawing",
      input
    });
  }

  async classifyImage(input: ImageClassificationInput): Promise<ReadonlyArray<InferencePrediction>> {
    await this.loadModel();
    return this.sendPredictionRequest({
      id: this.nextId(),
      type: "classifyImage",
      input
    });
  }

  async preprocessDrawing(input: DrawingClassificationInput): Promise<ImageData> {
    await this.loadModel();
    return this.sendPreprocessRequest({
      id: this.nextId(),
      type: "preprocessDrawing",
      input
    });
  }

  async preprocessImage(input: ImageClassificationInput): Promise<ImageData> {
    await this.loadModel();
    return this.sendPreprocessRequest({
      id: this.nextId(),
      type: "preprocessImage",
      input
    });
  }

  dispose(): void {
    this.worker.terminate();
    this.pendingRequests.clear();
  }

  private sendPredictionRequest(request: OcrWorkerRequest): Promise<ReadonlyArray<InferencePrediction>> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(request.id, {
        type: "predictions",
        resolve,
        reject
      });
      this.worker.postMessage(request);
    });
  }

  private sendPreprocessRequest(request: OcrWorkerRequest): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(request.id, {
        type: "preprocessedImage",
        resolve,
        reject
      });
      this.worker.postMessage(request);
    });
  }

  private handleMessage(event: MessageEvent<OcrWorkerResponse>): void {
    const response = event.data;
    const pendingRequest = this.pendingRequests.get(response.id);

    if (!pendingRequest) {
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.type === "error") {
      pendingRequest.reject(new Error(response.message));
      return;
    }

    if (response.type === "loaded") {
      if (pendingRequest.type !== "load") {
        pendingRequest.reject(new Error("Unexpected worker response for model load."));
        return;
      }

      pendingRequest.resolve();
      return;
    }

    if (response.type === "preprocessedImage") {
      if (pendingRequest.type !== "preprocessedImage") {
        pendingRequest.reject(new Error("Unexpected worker response for image preprocessing."));
        return;
      }

      pendingRequest.resolve(response.imageData);
      return;
    }

    if (pendingRequest.type !== "predictions") {
      pendingRequest.reject(new Error("Unexpected worker response for inference predictions."));
      return;
    }

    pendingRequest.resolve(response.predictions);
  }

  private nextId(): number {
    const requestId = this.nextRequestId;
    this.nextRequestId += 1;
    return requestId;
  }
}
