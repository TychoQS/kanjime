import type { CanvasInterface } from "../Contracts/CanvasInterface";
import type { CreateCanvasControllerDependencies } from "../CreateCanvasController";
import type { Stroke } from "../../../../Shared/DomainTypes";

let registeredCanvasClear: (() => void) | null = null;

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
    async registerStroke(stroke: Stroke): Promise<ReadonlyArray<{ character: string; strokeCount: number }>> {
      assertValidStroke(stroke);
      const strokeSnapshot: Stroke = {
        points: stroke.points.map(point => ({ ...point })),
        startedAt: stroke.startedAt,
        endedAt: stroke.endedAt
      };

      strokes.push(strokeSnapshot);

      const predictions = await dependencies.requestDrawingInference(strokeSnapshot);
      return predictions
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
