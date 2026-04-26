import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText
} from "@ionic/react";
import React, { useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { useApplicationComposition } from "../../ApplicationContext";
import type { CharacterSummary, ClassificationMode, ImageDescriptor, InferencePrediction, Stroke } from "../../Shared/DomainTypes";
import { useI18n } from "../../Shared/I18n/I18nContext";
import { CanvasInputView } from "./Canvas/CanvasInputView";
import { ImageView } from "./Image/ImageView";
import { InferenceListView } from "./Inference/InferenceListView";

/**
 * OCR classification screen.
 *
 * @post Image and drawing classification flows are reachable from one mobile screen.
 */
export function ClassificationScreen(): JSX.Element {
  const composition = useApplicationComposition();
  const { t } = useI18n();
  const history = useHistory();
  const [mode, setMode] = useState<ClassificationMode>("image");
  const [strokes, setStrokes] = useState<ReadonlyArray<Stroke>>([]);
  const [image, setImage] = useState<ImageDescriptor | null>(null);
  const [results, setResults] = useState<ReadonlyArray<CharacterSummary>>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const latestDrawingSource = useRef<{ sourceId: string; inputUrl: string; strokeCount: number } | null>(null);
  const latestPredictions = useRef<ReadonlyArray<InferencePrediction>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayController = useMemo(() => composition.createDisplayInferencesController(
    async character => {
      history.push(`/kanji/${encodeURIComponent(character)}`);
    },
    composition.saveHistoryEntry
  ), [composition, history]);
  const classificationController = useMemo(() => composition.createClassificationController(setMode), [composition]);
  const toggleController = useMemo(() => composition.createToggleController(previousMode => {
    if (previousMode === "drawing") {
      setStrokes([]);
    }

    if (previousMode === "image") {
      setImage(null);
    }

    setResults([]);
    setSelectedCharacter(null);
  }), [composition]);
  const canvasController = useMemo(() => composition.createCanvasController(async () => {
    const source = latestDrawingSource.current;

    if (!source) {
      return [];
    }

    const predictions = await composition.ocrInferenceService.classifySource(
      source.sourceId,
      source.inputUrl,
      source.strokeCount
    );
    latestPredictions.current = predictions;

    return predictions.map(prediction => ({
      character: prediction.character,
      strokeCount: prediction.strokeCount
    }));
  }), [composition]);

  async function switchMode(nextMode: ClassificationMode): Promise<void> {
    try {
      toggleController.switchMode(nextMode);
      classificationController.activateMode(nextMode);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  async function handleStrokeCommitted(stroke: Stroke): Promise<void> {
    const nextStrokes = [...strokes, stroke];
    const sourceId = `drawing-${stroke.startedAt}-${stroke.endedAt}`;
    const inputUrl = createDrawingDataUrl(nextStrokes);
    latestDrawingSource.current = {
      sourceId,
      inputUrl,
      strokeCount: nextStrokes.length
    };
    setStrokes(nextStrokes);
    setIsProcessing(true);

    try {
      await canvasController.registerStroke(stroke);
      displayController.updateResultsFromDrawingInference(latestPredictions.current);
      setResults(await composition.kanjiRepository.getSummariesForCharacters(
        latestPredictions.current.map(prediction => prediction.character)
      ));
    } catch {
      setMessage(t("unexpectedError"));
    } finally {
      setIsProcessing(false);
    }
  }

  function clearDrawing(): void {
    if (strokes.length > 0) {
      canvasController.clearCanvas();
    }

    latestDrawingSource.current = null;
    latestPredictions.current = [];
    setStrokes([]);
    setResults([]);
    setSelectedCharacter(null);
  }

  async function classifyImage(activeImage: ImageDescriptor): Promise<void> {
    setIsProcessing(true);

    try {
      const predictions = await composition.ocrInferenceService.classifySource(
        `image-${activeImage.uri}`,
        activeImage.uri
      );
      latestPredictions.current = predictions;
      displayController.updateResultsFromImageSource(activeImage.uri, predictions);
      setResults(await composition.kanjiRepository.getSummariesForCharacters(
        predictions.map(prediction => prediction.character)
      ));
    } catch {
      setMessage(t("unexpectedError"));
    } finally {
      setIsProcessing(false);
    }
  }

  async function loadImageFromUri(uri: string, mimeType: string): Promise<void> {
    try {
      const descriptor = await createImageDescriptor(uri, mimeType);
      setImage(descriptor);
      setResults([]);
      await classifyImage(descriptor);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  async function capturePhoto(): Promise<void> {
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 80,
        width: 1024,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true
      });

      if (!photo.webPath) {
        throw new Error("Image could not be used.");
      }

      await loadImageFromUri(photo.webPath, `image/${photo.format}`);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  async function pickPhoto(): Promise<void> {
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 80,
        width: 1024,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        correctOrientation: true
      });

      if (!photo.webPath) {
        throw new Error("Image could not be used.");
      }

      await loadImageFromUri(photo.webPath, `image/${photo.format}`);
    } catch {
      fileInputRef.current?.click();
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uri = URL.createObjectURL(file);
    await loadImageFromUri(uri, file.type);
    event.target.value = "";
  }

  async function openResult(character: string): Promise<void> {
    setSelectedCharacter(character);

    try {
      await displayController.openKanjiEntry(character);
    } catch {
      setMessage(t("unexpectedError"));
    }
  }

  return (
    <IonContent data-testid="classification-screen" className="screenContent">
      <div className="screenStack">
        <IonSegment
          data-testid="classification-mode-selector"
          value={mode}
          onIonChange={event => {
            const value = event.detail.value;

            if (value === "image" || value === "drawing") {
              void switchMode(value);
            }
          }}
        >
          <IonSegmentButton data-testid="image-mode-button" value="image">
            {t("imageMode")}
          </IonSegmentButton>
          <IonSegmentButton data-testid="drawing-mode-button" value="drawing">
            {t("drawingMode")}
          </IonSegmentButton>
        </IonSegment>

        {mode === "drawing" ? (
          <IonCard data-testid="drawing-panel">
            <IonCardHeader>
              <IonCardTitle>{t("drawHere")}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="stack">
              <IonText>{t("drawingHelp")}</IonText>
              <CanvasInputView
                backgroundColor="var(--app-canvas-background)"
                strokeColor="var(--app-canvas-stroke)"
                isDrawingEnabled
                strokes={strokes}
                onStrokeCommitted={stroke => void handleStrokeCommitted(stroke)}
                onClearRequested={clearDrawing}
              />
            </IonCardContent>
          </IonCard>
        ) : (
          <IonCard data-testid="image-panel">
            <IonCardHeader>
              <IonCardTitle>{t("imageMode")}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="stack">
              <div className="buttonRow">
                <IonButton data-testid="take-photo-button" onClick={() => void capturePhoto()}>
                  {t("takePhoto")}
                </IonButton>
                <IonButton data-testid="pick-image-button" onClick={() => void pickPhoto()}>
                  {t("pickImage")}
                </IonButton>
                <IonButton data-testid="choose-file-button" onClick={() => fileInputRef.current?.click()}>
                  {t("chooseFile")}
                </IonButton>
              </div>
              <input
                ref={fileInputRef}
                data-testid="image-file-input"
                type="file"
                accept="image/*"
                className="visuallyHidden"
                onChange={event => void handleFileSelected(event)}
              />
              {image ? (
                <ImageView
                  image={{
                    ...image,
                    altText: t("imageMode")
                  }}
                  isProcessing={isProcessing}
                  onClearImage={() => {
                    setImage(null);
                    setResults([]);
                  }}
                />
              ) : (
                <IonText data-testid="image-empty-state">{t("imageEmpty")}</IonText>
              )}
            </IonCardContent>
          </IonCard>
        )}

        <IonCard data-testid="classification-results-panel">
          <IonCardHeader>
            <IonCardTitle>{t("results")}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isProcessing ? <IonSpinner data-testid="classification-spinner" name="crescent" /> : null}
            {results.length > 0 ? (
              <InferenceListView
                results={results.map(result => ({
                  ...result,
                  isSelected: selectedCharacter === result.character
                }))}
                onResultSelected={character => void openResult(character)}
              />
            ) : (
              <IonText data-testid="classification-empty-state">{t("noResults")}</IonText>
            )}
          </IonCardContent>
        </IonCard>

        {message ? (
          <IonText color="danger" data-testid="classification-error">
            {message}
          </IonText>
        ) : null}
      </div>
    </IonContent>
  );
}

function createDrawingDataUrl(strokes: ReadonlyArray<Stroke>): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("The drawing could not be prepared.");
  }

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "white";
  context.lineWidth = 10;
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
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

  return canvas.toDataURL("image/png");
}

function createImageDescriptor(uri: string, mimeType: string): Promise<ImageDescriptor> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve({
      uri,
      width: image.naturalWidth,
      height: image.naturalHeight,
      mimeType
    });
    image.onerror = () => reject(new Error("The selected image could not be used."));
    image.src = uri;
  });
}
