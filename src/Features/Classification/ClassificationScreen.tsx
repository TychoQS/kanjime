import {
  IonButton,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText
} from "@ionic/react";
import { camera, close, createOutline, imageOutline, trash } from "ionicons/icons";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ClassificationMode, CropRegion, Stroke, StrokePoint } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import { MobilePage } from "../Shell/MobilePage";
import type { CanvasInterface } from "./Canvas/Contracts/CanvasInterface";
import { CanvasInputView } from "./Canvas/CanvasInputView";
import type { ImageInterface } from "./Image/Contracts/ImageInterface";
import type { PhotoInterface } from "./Image/Contracts/PhotoInterface";
import { ImageView } from "./Image/ImageView";
import { CropOverlayView } from "./Image/CropOverlayView";
import type { DisplayInferencesInterface } from "./Inference/Contracts/DisplayInferencesInterface";
import type { InferenceInterface } from "./Inference/Contracts/InferenceInterface";
import { InferenceListView } from "./Inference/InferenceListView";
import type { ClassificationInterface } from "./Mode/Contracts/ClassificationInterface";
import type { ToggleClassificationModeInterface } from "./Mode/Contracts/ToggleClassificationModeInterface";

interface ClassificationScreenProps {
  readonly canvasController: CanvasInterface;
  readonly inferenceController: InferenceInterface;
  readonly imageController: ImageInterface;
  readonly photoController: PhotoInterface;
  readonly displayInferencesController: DisplayInferencesInterface;
  readonly classificationController: ClassificationInterface;
  readonly toggleClassificationModeController: ToggleClassificationModeInterface;
  readonly language: string;
}

interface CropDraft {
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
}

const IMAGE_INFERENCE_DELAY_MS = 450;

/**
 * Main OCR screen for image and drawing recognition.
 */
export function ClassificationScreen(props: ClassificationScreenProps): JSX.Element {
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const lastImageSourceIdRef = useRef<string>("");
  const [mode, setMode] = useState<ClassificationMode>(props.classificationController.getActiveMode());
  const [imageState, setImageState] = useState(props.imageController.getImageState());
  const [canvasStrokes, setCanvasStrokes] = useState<ReadonlyArray<Stroke>>(props.canvasController.getStrokeHistory());
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const [results, setResults] = useState<ReadonlyArray<{
    character: string;
    primaryReadings: ReadonlyArray<string>;
    levels: ReadonlyArray<string>;
  }>>(safeGetVisibleResults(props.displayInferencesController));
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCrop = useMemo(() => cropDraftToRegion(cropDraft) ?? imageState.crop, [cropDraft, imageState.crop]);

  const refreshResults = useCallback(() => {
    setResults(safeGetVisibleResults(props.displayInferencesController));
  }, [props.displayInferencesController]);

  const refreshImageState = useCallback(() => {
    setImageState(props.imageController.getImageState());
  }, [props.imageController]);

  const refreshCanvasState = useCallback(() => {
    setCanvasStrokes(props.canvasController.getStrokeHistory());
  }, [props.canvasController]);

  const classifyImage = useCallback(async (
    sourceId: string,
    sourceUri: string,
    crop: CropRegion | null
  ): Promise<void> => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const predictions = crop
        ? await props.inferenceController.classifyCrop({ sourceId, sourceUri, crop })
        : await props.inferenceController.classifyFullImage({ sourceId, sourceUri });
      await Promise.resolve(props.displayInferencesController.updateResultsFromImageSource(sourceId, predictions));
      lastImageSourceIdRef.current = sourceId;
      refreshResults();
    } catch {
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    } finally {
      setIsProcessing(false);
    }
  }, [props.displayInferencesController, props.inferenceController, refreshResults]);

  useEffect(() => {
    if (mode !== "image" || imageState.image === null) {
      return;
    }

    const sourceId = createImageSourceId(imageState.image.uri, imageState.crop);

    if (sourceId === lastImageSourceIdRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void classifyImage(sourceId, imageState.image?.uri ?? "", imageState.crop);
    }, IMAGE_INFERENCE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [classifyImage, imageState.crop, imageState.image, mode]);

  const chooseImage = async (): Promise<void> => {
    setErrorMessage(null);

    try {
      const image = await props.photoController.capturePhoto();
      props.imageController.setImage(image);
      lastImageSourceIdRef.current = "";
      refreshImageState();
      props.displayInferencesController.clearResults();
      refreshResults();
    } catch {
      setErrorMessage("The image could not be selected.");
    }
  };

  const clearImage = (): void => {
    props.imageController.clearImage();
    props.displayInferencesController.clearResults();
    setCropDraft(null);
    lastImageSourceIdRef.current = "";
    refreshImageState();
    refreshResults();
  };

  const switchMode = (nextMode: ClassificationMode): void => {
    props.classificationController.activateMode(nextMode);
    props.toggleClassificationModeController.switchMode(nextMode);
    setMode(nextMode);
    setErrorMessage(null);
    setCropDraft(null);
    lastImageSourceIdRef.current = "";
    props.displayInferencesController.clearResults();
    refreshResults();
    refreshImageState();
    refreshCanvasState();
  };

  const onStrokeCommitted = async (
    sourceId: string,
    predictions?: ReadonlyArray<{ character: string; strokeCount: number; confidence: number }>
  ): Promise<void> => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (predictions && predictions.length > 0) {
        await Promise.resolve(props.displayInferencesController.updateResultsFromDrawingInference(predictions));
        refreshResults();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error has occurred and the character could not be identified.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearDrawing = (): void => {
    try {
      props.canvasController.clearCanvas();
    } catch {
      // no-op: empty canvas clears are ignored in UI
    }
    props.displayInferencesController.clearResults();
    refreshCanvasState();
    refreshResults();
  };

  const openResult = async (character: string): Promise<void> => {
    try {
      await props.displayInferencesController.openKanjiEntry(character);
    } catch {
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    }
  };

  return (
    <MobilePage title={translate(props.language, "recognition")} testId="classification-screen">
      <div className="screen-shell">
        <IonSegment
          className="mode-segment"
          value={mode}
          onIonChange={event => switchMode(event.detail.value === "drawing" ? "drawing" : "image")}
          data-testid="ocr-mode-segment"
        >
          <IonSegmentButton value="image" data-testid="ocr-image-segment">
            <IonIcon icon={imageOutline} />
            <IonLabel>{translate(props.language, "image")}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="drawing" data-testid="ocr-drawing-segment">
            <IonIcon icon={createOutline} />
            <IonLabel>{translate(props.language, "drawing")}</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div className="screen-flow">
          {mode === "image" ? (
            <div className="ocr-input-zone" data-testid="image-ocr-zone">
              <div
                ref={imageFrameRef}
                className="image-crop-frame"
                data-testid="image-crop-frame"
                onPointerDown={event => startCrop(event, imageFrameRef.current, imageState.image, setCropDraft)}
                onPointerMove={event => updateCrop(event, imageFrameRef.current, imageState.image, cropDraft, setCropDraft)}
                onPointerUp={() => finishCrop(cropDraft, props.imageController, setCropDraft, refreshImageState)}
              >
                <div className="classification-image-view-embedded">
                  <ImageView
                    image={imageState.image ? {
                      uri: imageState.image.uri,
                      width: imageState.image.width,
                      height: imageState.image.height,
                      altText: translate(props.language, "image")
                    } : null}
                    isProcessing={isProcessing}
                    onClearImage={clearImage}
                  />
                </div>
                <CropOverlayView
                  imageWidth={imageFrameRef.current?.getBoundingClientRect().width ?? 1}
                  imageHeight={imageFrameRef.current?.getBoundingClientRect().height ?? 1}
                  activeCrop={
                    activeCrop && imageState.image && imageFrameRef.current
                      ? toFrameCrop(activeCrop, imageState.image, imageFrameRef.current)
                      : null
                  }
                  isVisible={imageState.image !== null && activeCrop !== null}
                  onCropChanged={() => undefined}
                />
                {imageState.image === null ? (
                  <IonText color="medium">
                    <p>{translate(props.language, "noImage")}</p>
                  </IonText>
                ) : null}
              </div>
              <IonText color="medium">
                <p className="helper-text">{translate(props.language, "selectCrop")}</p>
              </IonText>
              <div className="center-actions">
                <IonButton data-testid="choose-image-button" onClick={() => void chooseImage()}>
                  <IonIcon icon={camera} slot="icon-only" />
                </IonButton>
                {imageState.image ? (
                  <IonButton
                    data-testid="clear-image-button"
                    fill="clear"
                    onClick={clearImage}
                    aria-label={translate(props.language, "clearImage")}
                  >
                    <IonIcon icon={close} slot="icon-only" />
                  </IonButton>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="ocr-input-zone" data-testid="drawing-ocr-zone">
              <div className="classification-canvas-view-embedded">
                <CanvasInputView
                  backgroundColor={getCssColor("--ion-color-secondary")}
                  strokeColor={getCssColor("--ion-color-primary")}
                  isDrawingEnabled
                  strokes={canvasStrokes}
                  onStrokeCommitted={stroke => {
                    const sourceId = `drawing-${stroke.endedAt}`;
                    void props.canvasController.registerStroke(stroke).then(predictions => {
                      refreshCanvasState();
                      void onStrokeCommitted(sourceId, predictions);
                    });
                  }}
                  onClearRequested={clearDrawing}
                />
              </div>
              <div className="center-actions">
                <IonButton
                  data-testid="clear-drawing-button"
                  disabled={canvasStrokes.length === 0}
                  fill="clear"
                  onClick={clearDrawing}
                  aria-label={translate(props.language, "clearDrawing")}
                >
                  <IonIcon icon={trash} slot="icon-only" />
                </IonButton>
              </div>
            </div>
          )}

          <section className="results-panel" data-testid="ocr-results-panel">
            <div className="section-heading">
              <span>{translate(props.language, "results")}</span>
              {isProcessing ? <IonSpinner name="crescent" data-testid="ocr-spinner" /> : null}
            </div>
            {errorMessage ? (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            ) : null}
            <div className="result-list scroll-list">
              {results.length === 0 && !isProcessing ? (
                <IonText color="medium">
                  <p>{translate(props.language, "emptyResults")}</p>
                </IonText>
              ) : (
                <InferenceListView
                  results={results.map(result => ({
                    character: result.character,
                    primaryReadings: result.primaryReadings,
                    levels: result.levels,
                    isSelected: false
                  }))}
                  onResultSelected={character => {
                    void openResult(character);
                  }}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </MobilePage>
  );
}

function createImageSourceId(imageUri: string, crop: CropRegion | null): string {
  if (!crop) {
    return `${imageUri}:full`;
  }

  return `${imageUri}:${Math.round(crop.x)}:${Math.round(crop.y)}:${Math.round(crop.width)}:${Math.round(crop.height)}`;
}

function startCrop(
  event: PointerEvent<HTMLDivElement>,
  frame: HTMLDivElement | null,
  image: { readonly width: number; readonly height: number } | null,
  setCropDraft: (crop: CropDraft | null) => void
): void {
  if (!frame || !image) {
    return;
  }

  frame.setPointerCapture(event.pointerId);
  const point = toImagePoint(event, frame, image);
  setCropDraft({
    startX: point.x,
    startY: point.y,
    currentX: point.x,
    currentY: point.y
  });
}

function updateCrop(
  event: PointerEvent<HTMLDivElement>,
  frame: HTMLDivElement | null,
  image: { readonly width: number; readonly height: number } | null,
  cropDraft: CropDraft | null,
  setCropDraft: (crop: CropDraft | null) => void
): void {
  if (!frame || !image || cropDraft === null) {
    return;
  }

  const point = toImagePoint(event, frame, image);
  setCropDraft({
    ...cropDraft,
    currentX: point.x,
    currentY: point.y
  });
}

function finishCrop(
  cropDraft: CropDraft | null,
  imageController: ImageInterface,
  setCropDraft: (crop: CropDraft | null) => void,
  refreshImageState: () => void
): void {
  const nextCrop = cropDraftToRegion(cropDraft);

  if (nextCrop && nextCrop.width >= 8 && nextCrop.height >= 8) {
    imageController.setActiveCrop(nextCrop);
  }

  refreshImageState();
  setCropDraft(null);
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
  event: PointerEvent<HTMLElement>,
  frame: HTMLElement,
  image: { readonly width: number; readonly height: number }
): StrokePoint {
  const img = frame.querySelector("img");
  const boxRect = img!.getBoundingClientRect();
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
  const x = clamp(((event.clientX - contentLeft) / contentWidth) * image.width, 0, image.width);
  const y = clamp(((event.clientY - contentTop) / contentHeight) * image.height, 0, image.height);
  return { x, y };
}

function toFrameCrop(
  crop: CropRegion,
  image: { readonly width: number; readonly height: number },
  frameEl: HTMLElement
): CropRegion {
  const frameRect = frameEl.getBoundingClientRect();
  const boxAspect = frameRect.width / frameRect.height;
  const imgAspect = image.width / image.height;
  let contentW: number, contentH: number, contentL: number, contentT: number;
  if (imgAspect > boxAspect) {
    contentW = frameRect.width;
    contentH = frameRect.width / imgAspect;
    contentL = 0;
    contentT = (frameRect.height - contentH) / 2;
  } else {
    contentH = frameRect.height;
    contentW = frameRect.height * imgAspect;
    contentT = 0;
    contentL = (frameRect.width - contentW) / 2;
  }
  return {
    x: contentL + (crop.x / image.width) * contentW,
    y: contentT + (crop.y / image.height) * contentH,
    width: (crop.width / image.width) * contentW,
    height: (crop.height / image.height) * contentH
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCssColor(name: string): string {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function safeGetVisibleResults(displayInferencesController: DisplayInferencesInterface): ReadonlyArray<{
  character: string;
  primaryReadings: ReadonlyArray<string>;
  levels: ReadonlyArray<string>;
}> {
  try {
    return displayInferencesController.getVisibleResults();
  } catch {
    return [];
  }
}
