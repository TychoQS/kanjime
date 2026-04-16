/**
 * Contract for OCR preprocessing and inference execution.
 *
 * @inv Inference execution does not block user interaction on the main application flow.
 * @inv Model inputs always match the dimensions expected by the inference model.
 * @inv The same input source is never classified more than once.
 */
export interface InferenceInterface {
  /**
   * Generates the model-ready drawing input with a black background and white strokes.
   *
   * Requirement IDs: R23.
   *
   * @pre The feature is in drawing mode and the canvas contains at least one stroke.
   * @post The returned image data matches model input dimensions and encodes a black background with white stroke content.
   */
  preprocessDrawingForModel(
    input: {
      canvasDataUrl: string;
      strokeCount: number;
      modelInputWidth: number;
      modelInputHeight: number;
    }
  ): Promise<ImageData>;

  /**
   * Generates the model-ready image input, optionally from an active crop, and binarizes it.
   *
   * Requirement IDs: R24.
   *
   * @pre The feature is in image mode and a valid image or crop is available.
   * @post The returned image data matches model input dimensions and is binarized before inference.
   */
  preprocessImageForModel(
    input: {
      sourceUri: string;
      crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      modelInputWidth: number;
      modelInputHeight: number;
    }
  ): Promise<ImageData>;

  /**
   * Executes a single drawing classification for a new drawing source.
   *
   * Requirement IDs: R23, R25.
   *
   * @pre The feature is in OCR drawing mode and a new valid drawing input exists.
   * @post Exactly one inference is executed for the provided drawing source without blocking the surrounding UI.
   */
  classifyDrawing(
    input: {
      sourceId: string;
      canvasDataUrl: string;
      strokeCount: number;
    }
  ): Promise<ReadonlyArray<{ character: string; confidence: number; strokeCount: number }>>;

  /**
   * Executes a single full-image classification when no crop is active.
   *
   * Requirement IDs: R24, R25, R26.
   *
   * @pre The feature is in OCR image mode, a valid image is loaded, and no crop is active.
   * @post Exactly one inference is executed for the full image source without requiring a crop.
   */
  classifyFullImage(
    input: {
      sourceId: string;
      sourceUri: string;
    }
  ): Promise<ReadonlyArray<{ character: string; confidence: number }>>;

  /**
   * Executes a single crop-based classification and treats the crop as a new source.
   *
   * Requirement IDs: R22, R24, R25.
   *
   * @pre The feature is in OCR image mode and a valid crop exists for the loaded image.
   * @post Exactly one inference is executed using only the provided crop as input and the crop replaces any previous crop source.
   */
  classifyCrop(
    input: {
      sourceId: string;
      sourceUri: string;
      crop: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }
  ): Promise<ReadonlyArray<{ character: string; confidence: number }>>;

  /**
   * Checks whether a source identifier has already been processed during the current OCR flow.
   *
   * Requirement IDs: R25.
   *
   * @post The returned value is true only when the same source has already produced an inference in the current session state.
   */
  hasProcessedSource(sourceId: string): boolean;
}
