import { useEffect, useRef } from "react";

import type { Stroke } from "../../../Shared/DomainTypes";
import { DRAWING_CANVAS_SIZE } from "../Inference/InferenceRuntimeConfig";
import type { CanvasInputProps } from "./Contracts/CanvasInputProps";

const CANVAS_SIZE = DRAWING_CANVAS_SIZE;

/**
 * Component for drawing kanji characters on a canvas.
 */
export const CanvasInputView: React.FC<CanvasInputProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCanvas(canvasRef.current, props.strokes, props.activeStroke, props.backgroundColor, props.strokeColor);
  }, [props.activeStroke, props.backgroundColor, props.strokeColor, props.strokes]);

  if (!props.isDrawingEnabled) {
    return null;
  }

  return (
    <div
      data-background={props.backgroundColor}
      data-stroke={props.strokeColor}
      data-testid="canvas-container"
    >
      <canvas
        ref={canvasRef}
        aria-label="Drawing area"
        className="drawing-canvas"
        data-background={props.backgroundColor}
        data-stroke={props.strokeColor}
        data-stroke-color={props.strokeColor}
        data-testid="drawing-canvas"
        height={CANVAS_SIZE}
        role="presentation"
        style={{
          backgroundColor: props.backgroundColor,
          borderColor: "var(--ion-color-medium)",
          borderStyle: "solid",
          borderWidth: "1px",
          color: props.strokeColor,
          display: "block",
          maxWidth: "100%",
          touchAction: "none",
          width: "100%"
        }}
        width={CANVAS_SIZE}
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
        onPointerCancel={props.onPointerCancel}
      />
    </div>
  );
};

function drawCanvas(
  canvas: HTMLCanvasElement | null,
  strokes: ReadonlyArray<Stroke>,
  activeStroke: Stroke | null,
  backgroundColor: string,
  strokeColor: string
): void {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(7, CANVAS_SIZE * 0.035);
  context.strokeStyle = strokeColor;

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
