import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useState } from "react";

import type { CanvasInterface } from "../Contracts/CanvasInterface";
import type { CreateCanvasControllerDependencies } from "../CreateCanvasController";
import { DRAWING_CANVAS_SIZE } from "../../Inference/InferenceRuntimeConfig";
import type { Stroke, StrokePoint } from "../../../../Shared/DomainTypes";
import { StrokeError } from "../../../../Shared/AppErrors";

let registeredCanvasClear: (() => void) | null = null;
const CANVAS_SIZE = DRAWING_CANVAS_SIZE;

export interface CanvasInteractionViewModel {
  readonly activeStroke: Stroke | null;
  beginStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  continueStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  commitStroke(): Stroke | null;
  cancelStroke(): void;
}

export function clearRegisteredCanvasState(): void {
  registeredCanvasClear?.();
}

function assertValidStroke(stroke: Stroke): void {
  if (stroke.points.length === 0 || stroke.startedAt.trim().length === 0 || stroke.endedAt.trim().length === 0) {
    throw new StrokeError("Draw at least one stroke before identifying a character.");
  }
}

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
        throw new StrokeError("There is no drawing to clear.");
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
