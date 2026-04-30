import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import type { Stroke, StrokePoint } from "../../../Shared/DomainTypes";
import type { CanvasInputProps } from "./Contracts/CanvasInputProps";

const CANVAS_SIZE = 360;

/**
 * Component for drawing kanji characters on a canvas.
 */
export const CanvasInputView: React.FC<CanvasInputProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

  useEffect(() => {
    drawCanvas(canvasRef.current, props.strokes, activeStroke, props.backgroundColor, props.strokeColor);
  }, [activeStroke, props.backgroundColor, props.strokeColor, props.strokes]);

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
        onPointerDown={event => beginStroke(event, canvasRef.current, setActiveStroke)}
        onPointerMove={event => continueStroke(event, canvasRef.current, activeStroke, setActiveStroke)}
        onPointerUp={() => {
          if (activeStroke) {
            props.onStrokeCommitted(activeStroke);
            setActiveStroke(null);
          }
        }}
        onPointerCancel={() => setActiveStroke(null)}
      />
    </div>
  );
};

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
