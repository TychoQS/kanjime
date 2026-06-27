import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CanvasInterface } from "../../Canvas/Contracts/CanvasInterface";
import type { CanvasInteractionViewModel } from "../../Canvas/ViewModel/CanvasViewModel";
import type { ImageInterface } from "../../Image/Contracts/ImageInterface";
import type { PhotoInterface } from "../../Image/Contracts/PhotoInterface";
import type { DisplayInferencesInterface } from "../../Inference/Contracts/DisplayInferencesInterface";
import type { InferenceInterface } from "../../Inference/Contracts/InferenceInterface";
import type { ModelLoaderInterface } from "../../Inference/Contracts/ModelLoaderInterface";
import { PHOTO_SELECTION_CANCELLED_MESSAGE } from "../../Image/ViewModel/PhotoViewModel";
import type { ClassificationInterface } from "../Contracts/ClassificationInterface";
import type { CreateClassificationControllerDependencies } from "../CreateClassificationController";
import type { ToggleClassificationModeInterface } from "../Contracts/ToggleClassificationModeInterface";
import type { ClassificationMode } from "@kanjime/shared";
import type { CharacterSummary, CropRegion, ImageState, StrokePoint, ApplicationUserAction } from "@kanjime/shared";
import { InferenceError } from "@kanjime/shared";

interface CropDraft {
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
}

const IMAGE_INFERENCE_DELAY_MS = 450;
let registeredClassificationScreenClear: (() => void) | null = null;
let shouldClearClassificationScreenOnEnable = false;

export interface ClassificationScreenViewModel {
  readonly mode: ClassificationMode;
  readonly imageState: ImageState;
  readonly cameraStream: MediaStream | null;
  readonly isCameraPreviewActive: boolean;
  readonly canvasStrokes: ReturnType<CanvasInterface["getStrokeHistory"]>;
  readonly cropDraft: CropDraft | null;
  readonly activeCrop: CropRegion | null;
  readonly results: ReadonlyArray<CharacterSummary>;
  readonly isProcessing: boolean;
  readonly isModelReady: boolean;
  readonly errorMessage: string | null;
  readonly activeStroke: CanvasInteractionViewModel["activeStroke"];
  dismissError(): void;
  takePhoto(): Promise<void>;
  capturePhoto(video: HTMLVideoElement | null): Promise<void>;
  cancelPhotoCapture(): void;
  chooseImage(): Promise<void>;
  clearImage(): void;
  switchMode(mode: ClassificationMode): void;
  clearDrawing(): void;
  openResult(character: string): Promise<void>;
  startCrop(
    event: ReactPointerEvent<HTMLDivElement>,
    frame: HTMLDivElement | null
  ): void;
  updateCrop(
    event: ReactPointerEvent<HTMLDivElement>,
    frame: HTMLDivElement | null
  ): void;
  finishCrop(): void;
  beginStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  continueStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  completeStroke(): void;
  cancelStroke(): void;
}

/**
 * Clears the registered OCR screen hook state, when available.
 */
export function clearRegisteredClassificationScreenState(): void {
  registeredClassificationScreenClear?.();
}

/**
 * Marks the OCR screen to clear its state the next time it becomes active.
 */
export function markRegisteredClassificationScreenForReset(): void {
  shouldClearClassificationScreenOnEnable = true;
}

export interface ClassificationScreenViewModelDependencies {
  readonly canvasController: CanvasInterface;
  readonly inferenceController: InferenceInterface;
  readonly imageController: ImageInterface;
  readonly photoController: PhotoInterface;
  readonly displayInferencesController: DisplayInferencesInterface;
  readonly classificationController: ClassificationInterface;
  readonly toggleClassificationModeController: ToggleClassificationModeInterface;
  readonly modelLoader: ModelLoaderInterface;
  readonly canvasInteraction: CanvasInteractionViewModel;
  readonly recordUserAction: (action: ApplicationUserAction) => void;
  readonly captureUnexpectedError: (error: Error) => Promise<{ readonly message: string; readonly isControlled: boolean }>;
}

function isClassificationMode(mode: string): mode is ClassificationMode {
  return mode === "image" || mode === "drawing";
}

export function createClassificationViewModel(
  dependencies: CreateClassificationControllerDependencies
): ClassificationInterface {
  let activeMode: ClassificationMode = "image";

  return {
    getActiveMode(): ClassificationMode {
      return activeMode;
    },
    activateMode(mode: ClassificationMode): void {
      if (!isClassificationMode(mode)) {
        throw new InferenceError("Select a valid input mode.");
      }

      activeMode = mode;
      void dependencies.onModeChanged(mode);
    }
  };
}

export function useClassificationScreenViewModel(
  dependencies: ClassificationScreenViewModelDependencies,
  isEnabled: boolean
): ClassificationScreenViewModel {
  const lastImageSourceIdRef = useRef("");
  const currentSourceIdRef = useRef(0);
  const [mode, setMode] = useState<ClassificationMode>(dependencies.classificationController.getActiveMode());
  const [imageState, setImageState] = useState<ImageState>(dependencies.imageController.getImageState());
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [canvasStrokes, setCanvasStrokes] = useState(dependencies.canvasController.getStrokeHistory());
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const [results, setResults] = useState<ReadonlyArray<CharacterSummary>>(
    safeGetVisibleResults(dependencies.displayInferencesController)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCrop = useMemo(() => cropDraftToRegion(cropDraft) ?? imageState.crop, [cropDraft, imageState.crop]);

  const refreshResults = useCallback(() => {
    setResults(safeGetVisibleResults(dependencies.displayInferencesController));
  }, [dependencies.displayInferencesController]);

  const refreshImageState = useCallback(() => {
    setImageState(dependencies.imageController.getImageState());
  }, [dependencies.imageController]);

  const refreshCanvasState = useCallback(() => {
    setCanvasStrokes(dependencies.canvasController.getStrokeHistory());
  }, [dependencies.canvasController]);

  useEffect(() => {
    registeredClassificationScreenClear = () => {
      try {
        dependencies.canvasController.clearCanvas();
      } catch (error) {
        if (!isEmptyCanvasClearError(error)) {
          void captureUnexpectedError(dependencies.captureUnexpectedError, error);
        }
      }

      dependencies.imageController.clearImage();
      dependencies.photoController.stopCameraPreview();
      dependencies.displayInferencesController.clearResults();
      setMode(dependencies.classificationController.getActiveMode());
      setImageState(dependencies.imageController.getImageState());
      setCameraStream(null);
      setCanvasStrokes(dependencies.canvasController.getStrokeHistory());
      setCropDraft(null);
      setResults(safeGetVisibleResults(dependencies.displayInferencesController));
      setIsProcessing(false);
      setErrorMessage(null);
      lastImageSourceIdRef.current = "";
      dependencies.canvasInteraction.cancelStroke();
    };

    return () => {
      if (registeredClassificationScreenClear !== null) {
        registeredClassificationScreenClear = null;
      }
    };
  }, [
    dependencies.canvasController,
    dependencies.canvasInteraction,
    dependencies.classificationController,
    dependencies.displayInferencesController,
    dependencies.imageController,
    dependencies.photoController,
    dependencies.captureUnexpectedError
  ]);

  useEffect(() => {
    if (!isEnabled || !shouldClearClassificationScreenOnEnable) {
      return;
    }

    shouldClearClassificationScreenOnEnable = false;
    clearRegisteredClassificationScreenState();
  }, [isEnabled]);

  const classifyImage = useCallback(async (
    sourceId: string,
    sourceUri: string,
    crop: CropRegion | null
  ): Promise<void> => {
    if (imageState.image === null) {
      return;
    }

    const thisSourceId = currentSourceIdRef.current;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const predictions = crop
        ? await dependencies.inferenceController.classifyCrop({ sourceId, sourceUri, crop })
        : await dependencies.inferenceController.classifyFullImage({ sourceId, sourceUri });

      dependencies.recordUserAction({
        type: "classification:inference-requested",
        mode: "image",
        hadResults: predictions.length > 0,
        occurredAt: new Date().toISOString()
      });

      if (thisSourceId !== currentSourceIdRef.current) {
        return;
      }

      if (imageState.image === null) {
        return;
      }

      await Promise.resolve(dependencies.displayInferencesController.updateResultsFromImageSource(sourceId, predictions));
      lastImageSourceIdRef.current = sourceId;
      refreshResults();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      void dependencies.captureUnexpectedError(errorObj);
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    } finally {
      setIsProcessing(false);
    }
  }, [dependencies.displayInferencesController, dependencies.inferenceController, dependencies.recordUserAction, dependencies.captureUnexpectedError, refreshResults, imageState.image]);

  useEffect(() => {
    if (!isEnabled || mode !== "image" || imageState.image === null) {
      return;
    }

    const sourceId = createImageSourceId(imageState.image.uri, imageState.crop);

    if (sourceId === lastImageSourceIdRef.current) {
      return;
    }

    currentSourceIdRef.current += 1;
    const thisSourceId = currentSourceIdRef.current;

    const timeout = window.setTimeout(() => {
      if (thisSourceId === currentSourceIdRef.current) {
        void classifyImage(sourceId, imageState.image?.uri ?? "", imageState.crop);
      }
    }, IMAGE_INFERENCE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [classifyImage, imageState.crop, imageState.image, isEnabled, mode]);

  useEffect(() => {
    if (isEnabled) {
      return undefined;
    }

    dependencies.photoController.stopCameraPreview();
    setCameraStream(null);
    return undefined;
  }, [dependencies.photoController, isEnabled]);

  useEffect(() => () => {
    dependencies.photoController.stopCameraPreview();
  }, [dependencies.photoController]);

  return {
    mode,
    imageState,
    cameraStream,
    isCameraPreviewActive: cameraStream !== null,
    canvasStrokes,
    cropDraft,
    activeCrop,
    results,
    isProcessing,
    isModelReady: dependencies.modelLoader.isModelReady(),
    errorMessage,
    activeStroke: dependencies.canvasInteraction.activeStroke,
    dismissError(): void {
      setErrorMessage(null);
    },
    async takePhoto(): Promise<void> {
      setErrorMessage(null);
      dependencies.recordUserAction({
        type: "classification:photo-requested",
        mode: "image",
        occurredAt: new Date().toISOString()
      });

      try {
        dependencies.photoController.stopCameraPreview();
        const stream = await dependencies.photoController.startCameraPreview();
        dependencies.imageController.clearImage();
        dependencies.displayInferencesController.clearResults();
        setCropDraft(null);
        lastImageSourceIdRef.current = "";
        setCameraStream(stream);
        refreshImageState();
        refreshResults();
      } catch (error) {
        if (isCancelledPhotoSelection(error)) {
          dependencies.recordUserAction({
            type: "classification:photo-cancelled",
            mode: "image",
            occurredAt: new Date().toISOString()
          });
          return;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        void dependencies.captureUnexpectedError(errorObj);
        setErrorMessage("The photo could not be captured.");
      }
    },
    async capturePhoto(video: HTMLVideoElement | null): Promise<void> {
      if (video === null) {
        setErrorMessage("The photo could not be captured.");
        return;
      }

      setErrorMessage(null);

      try {
        const image = await dependencies.photoController.capturePhoto(video);
        dependencies.photoController.stopCameraPreview();
        setCameraStream(null);
        dependencies.imageController.setImage(image);
        lastImageSourceIdRef.current = "";
        refreshImageState();
        dependencies.displayInferencesController.clearResults();
        refreshResults();
      } catch (error) {
        if (isCancelledPhotoSelection(error)) {
          dependencies.recordUserAction({
            type: "classification:photo-cancelled",
            mode: "image",
            occurredAt: new Date().toISOString()
          });
          return;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        void dependencies.captureUnexpectedError(errorObj);
        setErrorMessage("The photo could not be captured.");
      }
    },
    cancelPhotoCapture(): void {
      dependencies.photoController.stopCameraPreview();
      setCameraStream(null);
      setErrorMessage(null);
    },
    async chooseImage(): Promise<void> {
      setErrorMessage(null);
      dependencies.recordUserAction({
        type: "classification:photo-requested",
        mode: "image",
        occurredAt: new Date().toISOString()
      });

      try {
        const image = await dependencies.photoController.pickPhotoFromLibrary();
        dependencies.imageController.setImage(image);
        lastImageSourceIdRef.current = "";
        refreshImageState();
        dependencies.displayInferencesController.clearResults();
        refreshResults();
      } catch (error) {
        if (isCancelledPhotoSelection(error)) {
          dependencies.recordUserAction({
            type: "classification:photo-cancelled",
            mode: "image",
            occurredAt: new Date().toISOString()
          });
          return;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        void dependencies.captureUnexpectedError(errorObj);
        setErrorMessage("The image could not be selected.");
      }
    },
    clearImage(): void {
      try {
        dependencies.photoController.stopCameraPreview();
        setCameraStream(null);
        dependencies.imageController.clearImage();
        dependencies.displayInferencesController.clearResults();
        setCropDraft(null);
        lastImageSourceIdRef.current = "";
        refreshImageState();
        refreshResults();
      } catch (error) {
        void captureUnexpectedError(dependencies.captureUnexpectedError, error);
        setErrorMessage("The image could not be selected.");
      }
    },
    switchMode(nextMode: ClassificationMode): void {
      try {
        dependencies.photoController.stopCameraPreview();
        setCameraStream(null);
        dependencies.classificationController.activateMode(nextMode);
        dependencies.toggleClassificationModeController.switchMode(nextMode);
        setMode(nextMode);
        setErrorMessage(null);
        setCropDraft(null);
        lastImageSourceIdRef.current = "";
        dependencies.displayInferencesController.clearResults();
        refreshResults();
        refreshImageState();
        refreshCanvasState();
        dependencies.canvasInteraction.cancelStroke();
      } catch (error) {
        void captureUnexpectedError(dependencies.captureUnexpectedError, error);
        setErrorMessage("An unexpected error has occurred and the character could not be identified.");
      }
    },
    clearDrawing(): void {
      try {
        dependencies.canvasController.clearCanvas();
      } catch (error) {
        if (!isEmptyCanvasClearError(error)) {
          void captureUnexpectedError(dependencies.captureUnexpectedError, error);
          setErrorMessage("An unexpected error has occurred and the character could not be identified.");
        }
      }

      dependencies.displayInferencesController.clearResults();
      refreshCanvasState();
      refreshResults();
      dependencies.canvasInteraction.cancelStroke();
    },
    async openResult(character: string): Promise<void> {
      try {
        await dependencies.displayInferencesController.openKanjiEntry(character);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        void dependencies.captureUnexpectedError(errorObj);
        setErrorMessage("An unexpected error has occurred and the character could not be identified.");
      }
    },
    startCrop(event: ReactPointerEvent<HTMLDivElement>, frame: HTMLDivElement | null): void {
      if (!frame || imageState.image === null) {
        return;
      }

      frame.setPointerCapture(event.pointerId);
      const point = toImagePoint(event, frame, imageState.image);
      setCropDraft({
        startX: point.x,
        startY: point.y,
        currentX: point.x,
        currentY: point.y
      });
    },
    updateCrop(event: ReactPointerEvent<HTMLDivElement>, frame: HTMLDivElement | null): void {
      if (!frame || imageState.image === null || cropDraft === null) {
        return;
      }

      const point = toImagePoint(event, frame, imageState.image);
      setCropDraft({
        ...cropDraft,
        currentX: point.x,
        currentY: point.y
      });
    },
    finishCrop(): void {
      const nextCrop = cropDraftToRegion(cropDraft);

      try {
        if (nextCrop) {
          dependencies.imageController.setActiveCrop(nextCrop);
        }
      } catch (error) {
        if (!isInvalidCropError(error)) {
          void captureUnexpectedError(dependencies.captureUnexpectedError, error);
          setErrorMessage("An unexpected error has occurred and the character could not be identified.");
        }
      }

      refreshImageState();
      setCropDraft(null);
    },
    beginStroke: dependencies.canvasInteraction.beginStroke,
    continueStroke: dependencies.canvasInteraction.continueStroke,
    completeStroke(): void {
      const stroke = dependencies.canvasInteraction.commitStroke();

      if (stroke === null) {
        return;
      }

      const predictionsPromise = dependencies.canvasController.registerStroke(stroke);

      // Reflect the committed stroke immediately to avoid a visible empty-frame repaint.
      refreshCanvasState();
      setIsProcessing(true);
      setErrorMessage(null);

      void predictionsPromise
        .then(predictions => {
          dependencies.recordUserAction({
            type: "classification:inference-requested",
            mode: "drawing",
            hadResults: predictions.length > 0,
            occurredAt: new Date().toISOString()
          });
          return Promise.resolve(
            predictions.length > 0
              ? dependencies.displayInferencesController.updateResultsFromDrawingInference(predictions)
              : undefined
          ).then(() => {
            if (predictions.length > 0) {
              refreshResults();
            }
          });
        })
        .catch((error: unknown) => {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          void dependencies.captureUnexpectedError(errorObj);
          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("An unexpected error has occurred and the character could not be identified.");
          }
        })
        .finally(() => {
          setIsProcessing(false);
        });
    },
    cancelStroke: dependencies.canvasInteraction.cancelStroke
  };
}

function createImageSourceId(imageUri: string, crop: CropRegion | null): string {
  if (!crop) {
    return `${imageUri}:full`;
  }

  return `${imageUri}:${Math.round(crop.x)}:${Math.round(crop.y)}:${Math.round(crop.width)}:${Math.round(crop.height)}`;
}

function cropDraftToRegion(cropDraft: CropDraft | null): CropRegion | null {
  if (cropDraft === null) {
    return null;
  }

  const x = Math.min(cropDraft.startX, cropDraft.currentX);
  const y = Math.min(cropDraft.startY, cropDraft.currentY);

  return {
    x,
    y,
    width: Math.abs(cropDraft.currentX - cropDraft.startX),
    height: Math.abs(cropDraft.currentY - cropDraft.startY)
  };
}

function toImagePoint(
  event: ReactPointerEvent<HTMLElement>,
  frame: HTMLElement,
  image: { readonly width: number; readonly height: number }
): StrokePoint {
  const img = frame.querySelector("img");

  if (img === null) {
    return { x: 0, y: 0 };
  }

  const boxRect = img.getBoundingClientRect();
  const boxAspect = boxRect.width / boxRect.height;
  const imgAspect = image.width / image.height;
  let contentWidth: number;
  let contentHeight: number;
  let contentLeft: number;
  let contentTop: number;

  if (imgAspect > boxAspect) {
    contentWidth = boxRect.width;
    contentHeight = boxRect.width / imgAspect;
    contentLeft = boxRect.left;
    contentTop = boxRect.top + (boxRect.height - contentHeight) / 2;
  } else {
    contentHeight = boxRect.height;
    contentWidth = boxRect.height * imgAspect;
    contentTop = boxRect.top;
    contentLeft = boxRect.left + (boxRect.width - contentWidth) / 2;
  }

  return {
    x: clamp(((event.clientX - contentLeft) / contentWidth) * image.width, 0, image.width),
    y: clamp(((event.clientY - contentTop) / contentHeight) * image.height, 0, image.height)
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeGetVisibleResults(
  displayInferencesController: DisplayInferencesInterface
): ReadonlyArray<CharacterSummary> {
  try {
    return displayInferencesController.getVisibleResults();
  } catch {
    return [];
  }
}

function isCancelledPhotoSelection(error: unknown): boolean {
  return error instanceof Error && error.message === PHOTO_SELECTION_CANCELLED_MESSAGE;
}

function isEmptyCanvasClearError(error: unknown): boolean {
  return error instanceof Error && error.message === "There is no drawing to clear.";
}

function isInvalidCropError(error: unknown): boolean {
  return error instanceof Error && error.message === "ImageInterface accepted a crop outside the image bounds.";
}

function captureUnexpectedError(
  capture: (error: Error) => Promise<{ readonly message: string; readonly isControlled: boolean }>,
  error: unknown
): Promise<{ readonly message: string; readonly isControlled: boolean }> {
  return capture(error instanceof Error ? error : new Error(String(error)));
}
