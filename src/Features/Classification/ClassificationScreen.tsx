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
import { useRef } from "react";

import type { CropRegion } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { CanvasInputView } from "./Canvas/CanvasInputView";
import { ImageView } from "./Image/ImageView";
import { CropOverlayView } from "./Image/CropOverlayView";
import { InferenceListView } from "./Inference/InferenceListView";

/**
 * Main OCR screen for image and drawing recognition.
 */
export function ClassificationScreen(): JSX.Element {
  const { classification, preferences } = useAppViewModelContext();
  const imageFrameRef = useRef<HTMLDivElement>(null);

  return (
    <MobilePage title={translate(preferences.preferences.language, "recognition")} testId="classification-screen">
      <div className="screen-shell">
        <IonSegment
          className="mode-segment"
          value={classification.mode}
          onIonChange={event => classification.switchMode(event.detail.value === "drawing" ? "drawing" : "image")}
          data-testid="ocr-mode-segment"
        >
          <IonSegmentButton value="image" data-testid="ocr-image-segment">
            <IonIcon icon={imageOutline} />
            <IonLabel>{translate(preferences.preferences.language, "image")}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="drawing" data-testid="ocr-drawing-segment">
            <IonIcon icon={createOutline} />
            <IonLabel>{translate(preferences.preferences.language, "drawing")}</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div className="screen-flow">
          {classification.mode === "image" ? (
            <div className="ocr-input-zone" data-testid="image-ocr-zone">
              <div
                ref={imageFrameRef}
                className="image-crop-frame"
                data-testid="image-crop-frame"
                onPointerDown={event => classification.startCrop(event, imageFrameRef.current)}
                onPointerMove={event => classification.updateCrop(event, imageFrameRef.current)}
                onPointerUp={() => classification.finishCrop()}
              >
                <div className="classification-image-view-embedded">
                  <ImageView
                    image={classification.imageState.image ? {
                      uri: classification.imageState.image.uri,
                      width: classification.imageState.image.width,
                      height: classification.imageState.image.height,
                      altText: translate(preferences.preferences.language, "image")
                    } : null}
                    isProcessing={classification.isProcessing}
                    onClearImage={classification.clearImage}
                  />
                </div>
                <CropOverlayView
                  imageWidth={imageFrameRef.current?.getBoundingClientRect().width ?? 1}
                  imageHeight={imageFrameRef.current?.getBoundingClientRect().height ?? 1}
                  activeCrop={
                    classification.activeCrop && classification.imageState.image && imageFrameRef.current
                      ? toFrameCrop(classification.activeCrop, classification.imageState.image, imageFrameRef.current)
                      : null
                  }
                  isVisible={classification.imageState.image !== null && classification.activeCrop !== null}
                  onCropChanged={() => undefined}
                />
                {classification.imageState.image === null ? (
                  <IonText color="medium">
                    <p>{translate(preferences.preferences.language, "noImage")}</p>
                  </IonText>
                ) : null}
              </div>
              <IonText color="medium">
                <p className="helper-text">{translate(preferences.preferences.language, "selectCrop")}</p>
              </IonText>
              <div className="center-actions">
                <IonButton data-testid="choose-image-button" onClick={() => void classification.chooseImage()}>
                  <IonIcon icon={camera} slot="icon-only" />
                </IonButton>
                {classification.imageState.image ? (
                  <IonButton
                    data-testid="clear-image-button"
                    fill="clear"
                    onClick={classification.clearImage}
                    aria-label={translate(preferences.preferences.language, "clearImage")}
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
                  activeStroke={classification.activeStroke}
                  strokes={classification.canvasStrokes}
                  onPointerDown={event => classification.beginStroke(event, event.currentTarget)}
                  onPointerMove={event => classification.continueStroke(event, event.currentTarget)}
                  onPointerUp={() => classification.completeStroke()}
                  onPointerCancel={() => classification.cancelStroke()}
                />
              </div>
              <div className="center-actions">
                <IonButton
                  data-testid="clear-drawing-button"
                  disabled={classification.canvasStrokes.length === 0}
                  fill="clear"
                  onClick={classification.clearDrawing}
                  aria-label={translate(preferences.preferences.language, "clearDrawing")}
                >
                  <IonIcon icon={trash} slot="icon-only" />
                </IonButton>
              </div>
            </div>
          )}

          <section className="results-panel" data-testid="ocr-results-panel">
            <div className="section-heading">
              <span>{translate(preferences.preferences.language, "results")}</span>
              {classification.isProcessing ? <IonSpinner name="crescent" data-testid="ocr-spinner" /> : null}
            </div>
            {classification.errorMessage ? (
              <IonText color="danger">
                <p>{classification.errorMessage}</p>
              </IonText>
            ) : null}
            <div className="result-list scroll-list">
              {classification.results.length === 0 && !classification.isProcessing ? (
                <IonText color="medium">
                  <p>{translate(preferences.preferences.language, "emptyResults")}</p>
                </IonText>
              ) : (
                <InferenceListView
                  results={classification.results.map(result => ({
                    character: result.character,
                    primaryReadings: result.primaryReadings,
                    levels: result.levels,
                    isSelected: false
                  }))}
                  onResultSelected={character => {
                    void classification.openResult(character);
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

function toFrameCrop(
  crop: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
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
