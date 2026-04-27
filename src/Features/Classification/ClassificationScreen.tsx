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
import { useHistory } from "react-router-dom";

import type { CompositionRoot } from "../../CompositionRoot";
import type { ClassificationMode, CropRegion, InferencePrediction, Stroke, StrokePoint } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import type { KanjiSummary } from "../../Shared/KanjiRepository";
import { MobilePage } from "../Shell/MobilePage";

interface ClassificationScreenProps {
  readonly root: CompositionRoot;
  readonly language: string;
}

interface ImageInputState {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
}

interface CropDraft {
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
}

const CANVAS_SIZE = 360;
const IMAGE_INFERENCE_DELAY_MS = 450;

/**
 * Main OCR screen for image and drawing recognition.
 *
 * @pre The composition root has initialized the offline model and dictionary.
 * @post Valid image or drawing input automatically updates visible predictions.
 */
export function ClassificationScreen(props: ClassificationScreenProps): JSX.Element {
  const history = useHistory();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const lastImageSourceIdRef = useRef<string>("");
  const [mode, setMode] = useState<ClassificationMode>("image");
  const [imageInput, setImageInput] = useState<ImageInputState | null>(null);
  const [crop, setCrop] = useState<CropRegion | null>(null);
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const [strokes, setStrokes] = useState<ReadonlyArray<Stroke>>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [results, setResults] = useState<ReadonlyArray<KanjiSummary>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCrop = useMemo(() => cropDraftToRegion(cropDraft) ?? crop, [crop, cropDraft]);

  useEffect(() => {
    drawCanvas(canvasRef.current, strokes, activeStroke);
  }, [activeStroke, strokes]);

  useEffect(() => {
    if (mode !== "image" || imageInput === null) {
      return;
    }

    const sourceId = createImageSourceId(imageInput.uri, crop);

    if (sourceId === lastImageSourceIdRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void classifyImage(imageInput, crop, sourceId);
    }, IMAGE_INFERENCE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [crop, imageInput, mode]);

  const classifyImage = useCallback(async (
    input: ImageInputState,
    selectedCrop: CropRegion | null,
    sourceId: string
  ): Promise<void> => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const predictions = await props.root.ocrClient.classifyImage({
        sourceUri: input.uri,
        ...(selectedCrop ? { crop: selectedCrop } : {})
      });
      lastImageSourceIdRef.current = sourceId;
      setResults(await mapImagePredictions(props.root, predictions));
    } catch {
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    } finally {
      setIsProcessing(false);
    }
  }, [props.root]);

  const classifyDrawing = useCallback(async (nextStrokes: ReadonlyArray<Stroke>): Promise<void> => {
    if (nextStrokes.length === 0) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const predictions = await props.root.ocrClient.classifyDrawing({
        strokes: nextStrokes,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE
      });
      setResults(await mapDrawingPredictions(props.root, predictions, nextStrokes.length));
    } catch {
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    } finally {
      setIsProcessing(false);
    }
  }, [props.root]);

  const chooseImage = async (): Promise<void> => {
    setErrorMessage(null);

    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        allowEditing: false,
        correctOrientation: true,
        quality: 80,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        width: 1024
      });

      if (!photo.webPath) {
        throw new Error("The selected image could not be used.");
      }

      const dimensions = await loadImageDimensions(photo.webPath);
      setImageInput({
        uri: photo.webPath,
        width: dimensions.width,
        height: dimensions.height
      });
      setCrop(null);
      setResults([]);
      lastImageSourceIdRef.current = "";
    } catch {
      setErrorMessage("The image could not be selected.");
    }
  };

  const clearImage = (): void => {
    setImageInput(null);
    setCrop(null);
    setCropDraft(null);
    setResults([]);
    lastImageSourceIdRef.current = "";
  };

  const switchMode = (nextMode: ClassificationMode): void => {
    setMode(nextMode);
    setResults([]);
    setErrorMessage(null);
    lastImageSourceIdRef.current = "";

    if (nextMode === "image") {
      setStrokes([]);
      setActiveStroke(null);
      return;
    }

    setImageInput(null);
    setCrop(null);
    setCropDraft(null);
  };

  const openResult = async (character: string): Promise<void> => {
    await props.root.recordHistory(character, mode === "image" ? "imageClassification" : "drawingClassification");
    history.push(`/kanji/${encodeURIComponent(character)}`);
  };

  const clearDrawing = (): void => {
    setStrokes([]);
    setActiveStroke(null);
    setResults([]);
    drawCanvas(canvasRef.current, [], null);
  };

  const commitStroke = (stroke: Stroke): void => {
    const nextStrokes = [...strokes, stroke];
    setStrokes(nextStrokes);
    setActiveStroke(null);
    void classifyDrawing(nextStrokes);
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
                onPointerDown={event => startCrop(event, imageFrameRef.current, imageInput, setCropDraft)}
                onPointerMove={event => updateCrop(event, imageFrameRef.current, imageInput, cropDraft, setCropDraft)}
                onPointerUp={() => finishCrop(cropDraft, setCrop, setCropDraft)}
              >
                {imageInput ? (
                  <>
                    <img
                      alt={translate(props.language, "image")}
                      className="image-preview"
                      draggable={false}
                      src={imageInput.uri}
                    />
                    {activeCrop ? <CropOverlay crop={activeCrop} image={imageInput} /> : null}
                  </>
                ) : (
                  <IonText color="medium">
                    <p>{translate(props.language, "noImage")}</p>
                  </IonText>
                )}
              </div>
              <IonText color="medium">
                <p className="helper-text">{translate(props.language, "selectCrop")}</p>
              </IonText>
              <div className="center-actions">
                <IonButton data-testid="choose-image-button" onClick={() => void chooseImage()}>
                  <IonIcon icon={camera} slot="icon-only" />
                </IonButton>
                {imageInput ? (
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
              <canvas
                ref={canvasRef}
                aria-label={translate(props.language, "drawing")}
                className="drawing-canvas"
                data-testid="drawing-canvas"
                height={CANVAS_SIZE}
                width={CANVAS_SIZE}
                onPointerDown={event => beginStroke(event, canvasRef.current, setActiveStroke)}
                onPointerMove={event => continueStroke(event, canvasRef.current, activeStroke, setActiveStroke)}
                onPointerUp={() => activeStroke ? commitStroke(activeStroke) : undefined}
                onPointerCancel={() => setActiveStroke(null)}
              />
              <div className="center-actions">
                <IonButton
                  data-testid="clear-drawing-button"
                  disabled={strokes.length === 0 && activeStroke === null}
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
            <div className="result-list">
              {results.length === 0 && !isProcessing ? (
                <IonText color="medium">
                  <p>{translate(props.language, "emptyResults")}</p>
                </IonText>
              ) : results.map(result => (
                <button
                  className="result-row"
                  data-testid={`ocr-result-${result.character}`}
                  key={result.character}
                  onClick={() => void openResult(result.character)}
                  type="button"
                >
                  <span className="result-kanji">{result.character}</span>
                  <span className="result-meta">{result.primaryReadings.join(" ")}</span>
                  <span className="result-levels">{result.levels.join(" ")}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MobilePage>
  );
}

function CropOverlay(props: { readonly crop: CropRegion; readonly image: ImageInputState }): JSX.Element {
  return (
    <div
      className="crop-overlay"
      data-testid="active-crop-overlay"
      style={{
        height: `${(props.crop.height / props.image.height) * 100}%`,
        left: `${(props.crop.x / props.image.width) * 100}%`,
        top: `${(props.crop.y / props.image.height) * 100}%`,
        width: `${(props.crop.width / props.image.width) * 100}%`
      }}
    />
  );
}

async function mapImagePredictions(
  root: CompositionRoot,
  predictions: ReadonlyArray<InferencePrediction>
): Promise<ReadonlyArray<KanjiSummary>> {
  return (await root.kanjiRepository.getSummaries(predictions.map(prediction => prediction.character))).slice(0, 5);
}

async function mapDrawingPredictions(
  root: CompositionRoot,
  predictions: ReadonlyArray<InferencePrediction>,
  strokeCount: number
): Promise<ReadonlyArray<KanjiSummary>> {
  const summaries = await root.kanjiRepository.getSummaries(predictions.map(prediction => prediction.character));
  const summaryByCharacter = new Map(summaries.map(summary => [summary.character, summary]));

  return predictions
    .map(prediction => summaryByCharacter.get(prediction.character) ?? null)
    .filter((summary): summary is KanjiSummary => (
      summary !== null &&
      Math.abs(summary.strokeCount - strokeCount) <= 1
    ))
    .slice(0, 5);
}

function loadImageDimensions(uri: string): Promise<{ readonly width: number; readonly height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = uri;
  });
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
  image: ImageInputState | null,
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
  image: ImageInputState | null,
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
  setCrop: (crop: CropRegion | null) => void,
  setCropDraft: (crop: CropDraft | null) => void
): void {
  const nextCrop = cropDraftToRegion(cropDraft);
  setCrop(nextCrop && nextCrop.width >= 8 && nextCrop.height >= 8 ? nextCrop : null);
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
  image: ImageInputState
): StrokePoint {
  const rect = frame.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * image.width, 0, image.width);
  const y = clamp(((event.clientY - rect.top) / rect.height) * image.height, 0, image.height);

  return { x, y };
}

function beginStroke(
  event: PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
  setActiveStroke: (stroke: Stroke | null) => void
): void {
  if (!canvas) {
    return;
  }

  canvas.setPointerCapture(event.pointerId);
  const now = new Date().toISOString();
  setActiveStroke({
    points: [toCanvasPoint(event, canvas)],
    startedAt: now,
    endedAt: now
  });
}

function continueStroke(
  event: PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
  activeStroke: Stroke | null,
  setActiveStroke: (stroke: Stroke | null) => void
): void {
  if (!canvas || activeStroke === null) {
    return;
  }

  setActiveStroke({
    ...activeStroke,
    points: [...activeStroke.points, toCanvasPoint(event, canvas)],
    endedAt: new Date().toISOString()
  });
}

function toCanvasPoint(event: PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): StrokePoint {
  const rect = canvas.getBoundingClientRect();

  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * CANVAS_SIZE, 0, CANVAS_SIZE),
    y: clamp(((event.clientY - rect.top) / rect.height) * CANVAS_SIZE, 0, CANVAS_SIZE)
  };
}

function drawCanvas(
  canvas: HTMLCanvasElement | null,
  strokes: ReadonlyArray<Stroke>,
  activeStroke: Stroke | null
): void {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = getCssColor("--ion-color-secondary");
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(10, CANVAS_SIZE * 0.055);
  context.strokeStyle = getCssColor("--ion-color-primary");

  for (const stroke of [...strokes, ...(activeStroke ? [activeStroke] : [])]) {
    if (stroke.points.length === 0) {
      continue;
    }

    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (const point of stroke.points.slice(1)) {
      context.lineTo(point.x, point.y);
    }

    context.stroke();
  }
}

function getCssColor(name: string): string {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
