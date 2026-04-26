import React, { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasInputProps } from "./Contracts/CanvasInputProps";

/**
 * Component for drawing kanji characters on a canvas.
 * 
 * @pre {@link CanvasInputProps}
 * @inv {@link CanvasInputProps}
 * @post {@link CanvasInputProps}
 */
export const CanvasInputView: React.FC<CanvasInputProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStroke, setActiveStroke] = useState<{
    points: ReadonlyArray<{ x: number; y: number }>;
    startedAt: string;
  } | null>(null);

  const drawStrokes = useCallback((): void => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = props.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 10;
    context.strokeStyle = props.strokeColor;

    for (const stroke of props.strokes) {
      drawStrokePath(context, stroke.points);
    }

    if (activeStroke) {
      drawStrokePath(context, activeStroke.points);
    }
  }, [activeStroke, props.backgroundColor, props.strokeColor, props.strokes]);

  useEffect(() => {
    drawStrokes();
  }, [drawStrokes]);

  const getCanvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    return { x, y };
  }, []);

  const startStroke = useCallback((event: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!props.isDrawingEnabled) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveStroke({
      points: [getCanvasPoint(event)],
      startedAt: new Date().toISOString()
    });
  }, [getCanvasPoint, props.isDrawingEnabled]);

  const extendStroke = useCallback((event: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!activeStroke) {
      return;
    }

    const nextPoint = getCanvasPoint(event);
    setActiveStroke({
      startedAt: activeStroke.startedAt,
      points: [...activeStroke.points, nextPoint]
    });
  }, [activeStroke, getCanvasPoint]);

  const finishStroke = useCallback((event: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!activeStroke) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const completedStroke = {
      points: activeStroke.points,
      startedAt: activeStroke.startedAt,
      endedAt: new Date().toISOString()
    };

    setActiveStroke(null);

    if (completedStroke.points.length > 0) {
      props.onStrokeCommitted(completedStroke);
    }
  }, [activeStroke, props]);

  if (!props.isDrawingEnabled) {
    return null;
  }

  return (
    <div
      data-background={props.backgroundColor}
      data-stroke={props.strokeColor}
      data-testid="canvas-container"
      className="canvasInput"
    >
      <canvas
        ref={canvasRef}
        aria-label="Drawing area"
        data-background={props.backgroundColor}
        data-stroke={props.strokeColor}
        data-stroke-color={props.strokeColor}
        data-testid="drawing-canvas"
        height={320}
        onPointerCancel={finishStroke}
        onPointerDown={startStroke}
        onPointerLeave={finishStroke}
        onPointerMove={extendStroke}
        onPointerUp={finishStroke}
        role="presentation"
        width={320}
      />
      {props.strokes.length > 0 ? (
        <button
          aria-label="Clear drawing"
          data-testid="clear-drawing-button"
          onClick={props.onClearRequested}
          type="button"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
};

function drawStrokePath(
  context: CanvasRenderingContext2D,
  points: ReadonlyArray<{ x: number; y: number }>
): void {
  if (points.length === 0) {
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (const point of points.slice(1)) {
    context.lineTo(point.x, point.y);
  }

  context.stroke();
}
