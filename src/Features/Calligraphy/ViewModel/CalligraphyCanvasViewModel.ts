import type { CreateCalligraphyCanvasControllerDependencies } from "../CreateCalligraphyCanvasController";
import type { CalligraphyCanvasInterface } from "../Contracts/CalligraphyCanvasInterface";
import type { Stroke } from "../../../Shared/DomainTypes";
import { StrokeError } from "../../../Shared/AppErrors";

/**
 * Creates the calligraphy canvas view model.
 */
export function createCalligraphyCanvasViewModel(
  _dependencies: CreateCalligraphyCanvasControllerDependencies
): CalligraphyCanvasInterface {
  const strokes: Stroke[] = [];

  return {
    registerStroke(stroke: Stroke): void {
      if (stroke.points.length === 0 || stroke.startedAt.trim().length === 0 || stroke.endedAt.trim().length === 0) {
        throw new StrokeError("Draw at least one stroke before evaluating the practice.");
      }

      strokes.push(copyStroke(stroke));
    },
    resetAttempt(): void {
      if (strokes.length === 0) {
        throw new StrokeError("There is no practice attempt to clear.");
      }

      strokes.splice(0, strokes.length);
    },
    getStrokeHistory(): ReadonlyArray<Stroke> {
      return strokes.map(copyStroke);
    }
  };
}

function copyStroke(stroke: Stroke): Stroke {
  return {
    points: stroke.points.map(point => ({ ...point })),
    startedAt: stroke.startedAt,
    endedAt: stroke.endedAt
  };
}
