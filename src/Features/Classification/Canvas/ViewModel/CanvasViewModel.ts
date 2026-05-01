import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useState } from "react";

import type { CanvasInterface } from "../Contracts/CanvasInterface";
import type { CreateCanvasControllerDependencies } from "../CreateCanvasController";
import { DRAWING_CANVAS_SIZE } from "../../Inference/InferenceRuntimeConfig";
import type { Stroke, StrokePoint } from "../../../../Shared/DomainTypes";

let registeredCanvasClear: (() => void) | null = null;
const CANVAS_SIZE = DRAWING_CANVAS_SIZE;

export interface CanvasInteractionViewModel {
  readonly activeStroke: Stroke | null;
  beginStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  continueStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  commitStroke(): Stroke | null;
  cancelStroke(): void;
}

/**
 * Clears the most recently created canvas state, when available.
 *
 * @post Registered canvas stroke history is empty after this operation.
 */
export function clearRegisteredCanvasState(): void {
  registeredCanvasClear?.();
}

/**
 * Checks whether a stroke can be stored and classified.
 *
 * @pre The stroke is supplied by the drawing surface.
 * @post The operation completes only for strokes with at least one point and timestamps.
 */
function assertValidStroke(stroke: Stroke): void {
  if (stroke.points.length === 0 || stroke.startedAt.trim().length === 0 || stroke.endedAt.trim().length === 0) {
    throw new Error("Draw at least one stroke before identifying a character.");
  }
}

/**
 * Creates the canvas view model.
 *
 * @pre The inference dependency accepts completed strokes.
 * @inv Stroke history stores valid strokes in insertion order.
 * @post The returned controller records strokes and requests drawing inference once per stroke.
 */
export function createCanvasViewModel(dependencies: CreateCanvasControllerDependencies): CanvasInterface {
  const strokes: Stroke[] = [];
  registeredCanvasClear = () => {
    strokes.splice(0, strokes.length);
  };

  return {
    async registerStroke(stroke: Stroke): Promise<ReadonlyArray<{ character: string; strokeCount: number; confidence: number }>> {
      assertValidStroke(stroke);
      const strokeSnapshot: Stroke = {
        points: stroke.points.map(point => ({ ...point })),
        startedAt: stroke.startedAt,
        endedAt: stroke.endedAt
      };

      strokes.push(strokeSnapshot);

      const predictions = await dependencies.requestDrawingInference(strokeSnapshot);
      return predictions
        .filter(prediction => Math.abs(prediction.strokeCount - strokes.length) <= 1)
        .slice(0, 5)
        .map(prediction => ({ ...prediction }));
    },
    clearCanvas(): void {
      if (strokes.length === 0) {
        throw new Error("There is no drawing to clear.");
      }

      strokes.splice(0, strokes.length);
    },
    getStrokeHistory(): ReadonlyArray<Stroke> {
      return strokes.map(stroke => ({
        points: stroke.points.map(point => ({ ...point })),
        startedAt: stroke.startedAt,
        endedAt: stroke.endedAt
      }));
    }
  };
}

/**
 * Creates the transient drawing interaction hook view model.
 *
 * @pre Pointer events originate from the drawing canvas rendered in the classification screen.
 * @inv The active stroke is either null or a valid immutable snapshot in progress.
 * @post The returned actions keep transient pointer state out of the view component.
 */
export function useCanvasInteractionViewModel(): CanvasInteractionViewModel {
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

  const beginStroke = useCallback((
    event: ReactPointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null
  ): void => {
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
  }, []);

  const continueStroke = useCallback((
    event: ReactPointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null
  ): void => {
    if (!canvas) {
      return;
    }

    setActiveStroke(currentStroke => {
      if (currentStroke === null) {
        return null;
      }

      return {
        ...currentStroke,
        points: [...currentStroke.points, toCanvasPoint(event, canvas)],
        endedAt: new Date().toISOString()
      };
    });
  }, []);

  return {
    activeStroke,
    beginStroke,
    continueStroke,
    commitStroke(): Stroke | null {
      if (activeStroke === null) {
        return null;
      }

      const committedStroke = {
        points: activeStroke.points.map(point => ({ ...point })),
        startedAt: activeStroke.startedAt,
        endedAt: activeStroke.endedAt
      };

      setActiveStroke(null);

      return committedStroke;
    },
    cancelStroke(): void {
      setActiveStroke(null);
    }
  };
}

function toCanvasPoint(
  event: ReactPointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): StrokePoint {
  const rect = canvas.getBoundingClientRect();

  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * CANVAS_SIZE, 0, CANVAS_SIZE),
    y: clamp(((event.clientY - rect.top) / rect.height) * CANVAS_SIZE, 0, CANVAS_SIZE)
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
