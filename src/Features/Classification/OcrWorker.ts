import * as ort from "onnxruntime-web/wasm";
import ortWasmMjsUrl from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import ortWasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

import type { CropRegion, InferencePrediction, Stroke } from "../../Shared/DomainTypes";
import type { DrawingClassificationInput, ImageClassificationInput } from "../../Shared/OcrWorkerClient";
import { MODEL_INPUT_SIZE } from "./Inference/InferenceRuntimeConfig";

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

const MODEL_URL = new URL("/assets/model/kanji.onnx", self.location.origin).toString();
const CLASSES_URL = new URL("/assets/model/classes.json", self.location.origin).toString();
const MAX_RESULTS = 12;

let sessionPromise: Promise<ort.InferenceSession> | null = null;
let classesPromise: Promise<ReadonlyArray<string>> | null = null;

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = {
  mjs: ortWasmMjsUrl,
  wasm: ortWasmUrl
};

self.addEventListener("message", event => {
  void handleMessage(event as MessageEvent<OcrWorkerRequest>);
});

async function handleMessage(event: MessageEvent<OcrWorkerRequest>): Promise<void> {
  const request = event.data;

  try {
    if (request.type === "load") {
      await loadSession();
      postResponse({
        id: request.id,
        type: "loaded"
      });
      return;
    }

    if (request.type === "preprocessDrawing") {
      postResponse({
        id: request.id,
        type: "preprocessedImage",
        imageData: createDrawingImageData(request.input)
      });
      return;
    }

    if (request.type === "preprocessImage") {
      postResponse({
        id: request.id,
        type: "preprocessedImage",
        imageData: await createBinarizedImageData(request.input.sourceUri, request.input.crop)
      });
      return;
    }

    const predictions = request.type === "classifyDrawing"
      ? await classifyDrawing(request.input)
      : await classifyImage(request.input);

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

async function loadSession(): Promise<ort.InferenceSession> {
  if (sessionPromise === null) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all"
    });
  }

  return sessionPromise;
}

async function loadClasses(): Promise<ReadonlyArray<string>> {
  if (classesPromise === null) {
    classesPromise = fetch(CLASSES_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error("The model classes could not be loaded.");
        }

        return response.json() as Promise<unknown>;
      })
      .then(parsed => {
        if (!Array.isArray(parsed) || !parsed.every(item => typeof item === "string")) {
          throw new Error("The model classes are invalid.");
        }

        return parsed;
      });
  }

  return classesPromise;
}

async function classifyDrawing(input: DrawingClassificationInput): Promise<ReadonlyArray<InferencePrediction>> {
  const tensor = createTensorFromImageData(createDrawingImageData(input));
  return runInference(tensor);
}

async function classifyImage(input: ImageClassificationInput): Promise<ReadonlyArray<InferencePrediction>> {
  const imageData = await createBinarizedImageData(input.sourceUri, input.crop);
  const tensor = createTensorFromImageData(imageData);
  return runInference(tensor);
}

async function runInference(tensorData: Float32Array): Promise<ReadonlyArray<InferencePrediction>> {
  const [session, classes] = await Promise.all([loadSession(), loadClasses()]);
  return runInferenceWithResources(tensorData, session, classes);
}

async function runInferenceWithResources(
  tensorData: Float32Array,
  session: ort.InferenceSession,
  classes: ReadonlyArray<string>
): Promise<ReadonlyArray<InferencePrediction>> {
  const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
  const outputs = await session.run({ input: inputTensor });
  const kanjiLogits = outputs.kanji_logits;

  if (!(kanjiLogits.data instanceof Float32Array)) {
    throw new Error("The model output could not be read.");
  }

  return selectTopPredictions(kanjiLogits.data, classes);
}

function createDrawingImageData(input: DrawingClassificationInput): ImageData {
  const canvas = new OffscreenCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const context = requireCanvasContext(canvas);
  context.fillStyle = "black";
  context.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  context.strokeStyle = "white";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(10, MODEL_INPUT_SIZE * 0.055);

  const scaleX = MODEL_INPUT_SIZE / input.width;
  const scaleY = MODEL_INPUT_SIZE / input.height;

  for (const stroke of input.strokes) {
    drawStroke(context, stroke, scaleX, scaleY);
  }

  return context.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
}

function drawStroke(
  context: OffscreenCanvasRenderingContext2D,
  stroke: Stroke,
  scaleX: number,
  scaleY: number
): void {
  if (stroke.points.length === 0) {
    return;
  }

  context.beginPath();
  context.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);

  for (const point of stroke.points.slice(1)) {
    context.lineTo(point.x * scaleX, point.y * scaleY);
  }

  context.stroke();
}

async function createBinarizedImageData(
  sourceUri: string,
  crop: CropRegion | undefined
): Promise<ImageData> {
  const response = await fetch(sourceUri);

  if (!response.ok) {
    throw new Error("The image could not be loaded.");
  }

  const imageBitmap = await createImageBitmap(await response.blob());
  const canvas = new OffscreenCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const context = requireCanvasContext(canvas);
  const sourceCrop = crop ?? {
    x: 0,
    y: 0,
    width: imageBitmap.width,
    height: imageBitmap.height
  };

  context.drawImage(
    imageBitmap,
    sourceCrop.x,
    sourceCrop.y,
    sourceCrop.width,
    sourceCrop.height,
    0,
    0,
    MODEL_INPUT_SIZE,
    MODEL_INPUT_SIZE
  );
  imageBitmap.close();

  return binarizeImageData(context.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE));
}

function binarizeImageData(imageData: ImageData): ImageData {
  const output = new ImageData(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const grayValues = new Uint8ClampedArray(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
  const histogram = new Uint32Array(256);

  for (let pixelIndex = 0; pixelIndex < grayValues.length; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const gray = Math.round(
      imageData.data[sourceIndex] * 0.299 +
      imageData.data[sourceIndex + 1] * 0.587 +
      imageData.data[sourceIndex + 2] * 0.114
    );
    grayValues[pixelIndex] = gray;
    histogram[gray] += 1;
  }

  const threshold = computeOtsuThreshold(histogram, grayValues.length);
  let darkPixelCount = 0;

  for (const gray of grayValues) {
    if (gray < threshold) {
      darkPixelCount += 1;
    }
  }

  const textIsDark = darkPixelCount <= grayValues.length / 2;

  for (let pixelIndex = 0; pixelIndex < grayValues.length; pixelIndex += 1) {
    const gray = grayValues[pixelIndex];
    const isText = textIsDark ? gray < threshold : gray >= threshold;
    const value = isText ? 255 : 0;
    const outputIndex = pixelIndex * 4;
    output.data[outputIndex] = value;
    output.data[outputIndex + 1] = value;
    output.data[outputIndex + 2] = value;
    output.data[outputIndex + 3] = 255;
  }

  return output;
}

function computeOtsuThreshold(histogram: Uint32Array, pixelCount: number): number {
  let totalIntensity = 0;

  for (let intensity = 0; intensity < histogram.length; intensity += 1) {
    totalIntensity += intensity * histogram[intensity];
  }

  let backgroundWeight = 0;
  let backgroundIntensity = 0;
  let bestThreshold = 0;
  let bestVariance = Number.NEGATIVE_INFINITY;

  for (let intensity = 0; intensity < histogram.length; intensity += 1) {
    backgroundWeight += histogram[intensity];

    if (backgroundWeight === 0) {
      continue;
    }

    const foregroundWeight = pixelCount - backgroundWeight;

    if (foregroundWeight === 0) {
      break;
    }

    backgroundIntensity += intensity * histogram[intensity];
    const backgroundMean = backgroundIntensity / backgroundWeight;
    const foregroundMean = (totalIntensity - backgroundIntensity) / foregroundWeight;
    const meanDifference = backgroundMean - foregroundMean;
    const betweenClassVariance = backgroundWeight * foregroundWeight * meanDifference * meanDifference;

    if (betweenClassVariance > bestVariance) {
      bestVariance = betweenClassVariance;
      bestThreshold = intensity;
    }
  }

  return bestThreshold;
}

function createTensorFromImageData(imageData: ImageData): Float32Array {
  const channelSize = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const tensor = new Float32Array(channelSize * 3);

  for (let pixelIndex = 0; pixelIndex < channelSize; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const value = imageData.data[sourceIndex] / 255;
    tensor[pixelIndex] = value;
    tensor[channelSize + pixelIndex] = value;
    tensor[channelSize * 2 + pixelIndex] = value;
  }

  return tensor;
}

function selectTopPredictions(
  logits: Float32Array,
  classes: ReadonlyArray<string>
): ReadonlyArray<InferencePrediction> {
  return [...logits]
    .map((confidence, index) => ({
      character: classes[index] ?? "",
      confidence,
      strokeCount: 0
    }))
    .filter(prediction => prediction.character.length > 0)
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, MAX_RESULTS);
}

function requireCanvasContext(canvas: OffscreenCanvas): OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (context === null) {
    throw new Error("The image could not be prepared.");
  }

  return context;
}

function postResponse(response: OcrWorkerResponse): void {
  self.postMessage(response);
}
