import * as ort from "onnxruntime-web/wasm";

import type { InferencePrediction, ModelConfiguration } from "../DomainTypes";

type LoadRequest = {
  readonly id: string;
  readonly type: "load";
  readonly modelUrl: string;
  readonly classesUrl: string;
};

type ClassifyRequest = {
  readonly id: string;
  readonly type: "classify";
  readonly sourceId: string;
  readonly inputUrl: string;
  readonly strokeCount?: number;
};

type WorkerRequest = LoadRequest | ClassifyRequest;

type WorkerResponse =
  | {
      readonly id: string;
      readonly type: "loaded";
      readonly configuration: ModelConfiguration;
    }
  | {
      readonly id: string;
      readonly type: "predictions";
      readonly predictions: ReadonlyArray<InferencePrediction>;
    }
  | {
      readonly id: string;
      readonly type: "error";
      readonly message: string;
    };

const MODEL_INPUT_WIDTH = 224;
const MODEL_INPUT_HEIGHT = 224;
const MAX_RESULTS = 5;

let session: ort.InferenceSession | null = null;
let classes: ReadonlyArray<string> = [];

ort.env.wasm.numThreads = 1;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  void handleRequest(event.data);
};

async function handleRequest(request: WorkerRequest): Promise<void> {
  try {
    if (request.type === "load") {
      await loadModel(request);
      postResponse({
        id: request.id,
        type: "loaded",
        configuration: {
          inputWidth: MODEL_INPUT_WIDTH,
          inputHeight: MODEL_INPUT_HEIGHT,
          isLoaded: true
        }
      });
      return;
    }

    const predictions = await classify(request);
    postResponse({
      id: request.id,
      type: "predictions",
      predictions
    });
  } catch {
    postResponse({
      id: request.id,
      type: "error",
      message: "An unexpected error has occurred and the character could not be identified."
    });
  }
}

async function loadModel(request: LoadRequest): Promise<void> {
  if (session !== null) {
    return;
  }

  const classResponse = await fetch(request.classesUrl);

  if (!classResponse.ok) {
    throw new Error("Classes could not be loaded.");
  }

  const parsedClasses = await classResponse.json() as unknown;

  if (!Array.isArray(parsedClasses) || !parsedClasses.every(item => typeof item === "string")) {
    throw new Error("Classes could not be loaded.");
  }

  classes = parsedClasses;
  session = await ort.InferenceSession.create(request.modelUrl, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all"
  });
}

async function classify(request: ClassifyRequest): Promise<ReadonlyArray<InferencePrediction>> {
  if (session === null || classes.length === 0) {
    throw new Error("Character recognition is not ready.");
  }

  const tensorData = await createInputTensorData(request.inputUrl, request.strokeCount !== undefined);
  const output = await session.run({
    image: new ort.Tensor("float32", tensorData, [1, 3, MODEL_INPUT_HEIGHT, MODEL_INPUT_WIDTH])
  });
  const kanjiLogits = getFloatOutput(output.kanji_logits);
  const strokeLogits = getFloatOutput(output.stroke_logits);
  const strokeCounts = topK(strokeLogits, 1).map(item => item.index + 1);
  const predictions = topK(kanjiLogits, 20)
    .map(item => ({
      character: classes[item.index] ?? "",
      confidence: item.confidence,
      strokeCount: strokeCounts[0] ?? 0
    }))
    .filter(prediction => prediction.character.length > 0);

  const requestedStrokeCount = request.strokeCount;

  if (requestedStrokeCount === undefined) {
    return predictions.slice(0, MAX_RESULTS);
  }

  const filteredPredictions = predictions.filter(prediction => (
    Math.abs(prediction.strokeCount - requestedStrokeCount) <= 1
  ));

  return (filteredPredictions.length > 0 ? filteredPredictions : predictions).slice(0, MAX_RESULTS);
}

async function createInputTensorData(inputUrl: string, isDrawing: boolean): Promise<Float32Array> {
  const blob = await (await fetch(inputUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);
  const context = canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (context === null) {
    throw new Error("Image could not be prepared.");
  }

  context.fillStyle = "black";
  context.fillRect(0, 0, MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);
  context.drawImage(bitmap, 0, 0, MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);

  const imageData = context.getImageData(0, 0, MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);
  const grayscaleValues = new Uint8Array(MODEL_INPUT_WIDTH * MODEL_INPUT_HEIGHT);
  let grayscaleTotal = 0;

  for (let pixelIndex = 0; pixelIndex < grayscaleValues.length; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;
    const grayscale = Math.round(
      imageData.data[dataIndex] * 0.299 +
      imageData.data[dataIndex + 1] * 0.587 +
      imageData.data[dataIndex + 2] * 0.114
    );
    grayscaleValues[pixelIndex] = grayscale;
    grayscaleTotal += grayscale;
  }

  const threshold = grayscaleTotal / grayscaleValues.length;
  const tensorData = new Float32Array(3 * MODEL_INPUT_WIDTH * MODEL_INPUT_HEIGHT);
  const planeSize = MODEL_INPUT_WIDTH * MODEL_INPUT_HEIGHT;

  for (let pixelIndex = 0; pixelIndex < grayscaleValues.length; pixelIndex += 1) {
    const value = isDrawing
      ? (grayscaleValues[pixelIndex] > threshold ? 1 : 0)
      : (grayscaleValues[pixelIndex] < threshold ? 1 : 0);
    tensorData[pixelIndex] = value;
    tensorData[pixelIndex + planeSize] = value;
    tensorData[pixelIndex + planeSize * 2] = value;
  }

  return tensorData;
}

function getFloatOutput(value: ort.OnnxValue | undefined): Float32Array {
  if (!(value instanceof ort.Tensor) || !(value.data instanceof Float32Array)) {
    throw new Error("Character recognition returned an unexpected result.");
  }

  return value.data;
}

function topK(values: Float32Array, limit: number): ReadonlyArray<{ index: number; confidence: number }> {
  const maxValue = values.reduce((largestValue, value) => Math.max(largestValue, value), Number.NEGATIVE_INFINITY);
  const exponentials = [...values].map(value => Math.exp(value - maxValue));
  const sum = exponentials.reduce((total, value) => total + value, 0);

  return exponentials
    .map((value, index) => ({
      index,
      confidence: sum > 0 ? value / sum : 0
    }))
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, limit);
}

function postResponse(response: WorkerResponse): void {
  self.postMessage(response);
}
