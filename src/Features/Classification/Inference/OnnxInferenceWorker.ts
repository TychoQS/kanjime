/**
 * Web Worker for ONNX Runtime inference.
 *
 * Handles model initialization and kanji classification without
 * blocking the main application thread.
 *
 * @pre The ONNX model and classes JSON are available at the configured URLs.
 * @inv The model session is created at most once per worker lifetime.
 * @post Classification requests return ordered predictions from the kanji head.
 */

import * as ort from "onnxruntime-web";

interface InitializeMessage {
  readonly type: "initialize";
  readonly requestId: number;
  readonly modelUrl: string;
  readonly classesUrl: string;
  readonly inputWidth: number;
  readonly inputHeight: number;
}

interface ClassifyMessage {
  readonly type: "classify";
  readonly requestId: number;
  readonly sourceId: string;
  readonly sourceUri: string;
  readonly crop?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

type WorkerMessage = InitializeMessage | ClassifyMessage;

interface WorkerResponse {
  readonly type: "success" | "error";
  readonly requestId: number;
  readonly message?: string;
  readonly predictions?: ReadonlyArray<{ character: string; confidence: number }>;
}

/** ImageNet channel normalization constants. */
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

let session: ort.InferenceSession | null = null;
let classes: ReadonlyArray<string> = [];
let modelInputWidth = 224;
let modelInputHeight = 224;

/**
 * Sends a typed response back to the main thread.
 *
 * @post The response is received by the worker client in CompositionRoot.
 */
function respond(response: WorkerResponse): void {
  (self as unknown as { postMessage: (message: WorkerResponse) => void }).postMessage(response);
}

/**
 * Initializes the ONNX inference session from the provided model URL.
 *
 * @pre The model URL points to a valid ONNX file served by the application.
 * @post The inference session and class list are ready for classification.
 */
async function handleInitialize(message: InitializeMessage): Promise<void> {
  try {
    if (session !== null) {
      respond({ type: "success", requestId: message.requestId });
      return;
    }

    modelInputWidth = message.inputWidth;
    modelInputHeight = message.inputHeight;

    const [classesResponse] = await Promise.all([
      fetch(message.classesUrl)
    ]);

    if (!classesResponse.ok) {
      throw new Error("Failed to load model class list.");
    }

    classes = (await classesResponse.json()) as ReadonlyArray<string>;

    ort.env.wasm.numThreads = 1;

    session = await ort.InferenceSession.create(message.modelUrl, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all"
    });

    respond({ type: "success", requestId: message.requestId });
  } catch (error) {
    respond({
      type: "error",
      requestId: message.requestId,
      message: error instanceof Error ? error.message : "The character identifier could not be loaded."
    });
  }
}

/**
 * Loads an image from a URI into an OffscreenCanvas and extracts pixel data.
 *
 * @pre The URI points to a valid image resource.
 * @post The returned ImageData contains the image scaled to model input dimensions.
 */
async function loadImageData(
  sourceUri: string,
  width: number,
  height: number,
  crop?: { x: number; y: number; width: number; height: number }
): Promise<ImageData> {
  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to create canvas context.");
  }

  if (crop) {
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  } else {
    context.drawImage(bitmap, 0, 0, width, height);
  }

  return context.getImageData(0, 0, width, height);
}

/**
 * Converts image pixel data into a normalized Float32 tensor for GhostNet.
 *
 * The tensor layout is NCHW (batch, channels, height, width) with
 * ImageNet mean/std normalization applied per channel.
 *
 * @pre The ImageData dimensions match the model input size.
 * @post The returned Float32Array has shape [1, 3, height, width].
 */
function imageDataToTensor(imageData: ImageData, width: number, height: number): Float32Array {
  const { data } = imageData;
  const totalPixels = width * height;
  const tensorData = new Float32Array(3 * totalPixels);

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
    const rgbaOffset = pixelIndex * 4;
    const red = data[rgbaOffset] / 255.0;
    const green = data[rgbaOffset + 1] / 255.0;
    const blue = data[rgbaOffset + 2] / 255.0;

    tensorData[pixelIndex] = (red - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    tensorData[totalPixels + pixelIndex] = (green - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    tensorData[2 * totalPixels + pixelIndex] = (blue - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }

  return tensorData;
}

/**
 * Applies softmax to logit values to obtain probabilities.
 *
 * @pre logits contains numeric values for each class.
 * @post The returned array sums to approximately 1.0.
 */
function softmax(logits: Float32Array): Float32Array {
  const maxLogit = logits.reduce((max, value) => Math.max(max, value), -Infinity);
  const exponents = new Float32Array(logits.length);
  let sum = 0;

  for (let index = 0; index < logits.length; index++) {
    exponents[index] = Math.exp(logits[index] - maxLogit);
    sum += exponents[index];
  }

  for (let index = 0; index < exponents.length; index++) {
    exponents[index] /= sum;
  }

  return exponents;
}

/**
 * Classifies an image source through the loaded ONNX model.
 *
 * @pre The model session is initialized and the source URI is valid.
 * @post The returned predictions are ordered by descending confidence.
 */
async function handleClassify(message: ClassifyMessage): Promise<void> {
  try {
    if (session === null) {
      throw new Error("The character identifier is not ready.");
    }

    const imageData = await loadImageData(
      message.sourceUri,
      modelInputWidth,
      modelInputHeight,
      message.crop
    );
    const tensorData = imageDataToTensor(imageData, modelInputWidth, modelInputHeight);
    const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, modelInputHeight, modelInputWidth]);

    const feeds: Record<string, ort.Tensor> = { input: inputTensor };
    const results = await session.run(feeds);

    const kanjiOutput = results["kanji_logits"];

    if (!kanjiOutput) {
      throw new Error("Model output missing kanji_logits.");
    }

    const logits = kanjiOutput.data as Float32Array;
    const probabilities = softmax(logits);

    const indexedProbabilities = Array.from(probabilities).map((probability, index) => ({
      index,
      probability
    }));
    indexedProbabilities.sort((left, right) => right.probability - left.probability);

    const topPredictions = indexedProbabilities.slice(0, 10).map(entry => ({
      character: classes[entry.index] ?? `class_${entry.index}`,
      confidence: entry.probability
    }));

    respond({
      type: "success",
      requestId: message.requestId,
      predictions: topPredictions
    });
  } catch (error) {
    respond({
      type: "error",
      requestId: message.requestId,
      message: error instanceof Error ? error.message : "The character could not be identified."
    });
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>): void => {
  const message = event.data;

  if (message.type === "initialize") {
    void handleInitialize(message);
  } else if (message.type === "classify") {
    void handleClassify(message);
  }
};
